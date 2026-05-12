import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config/env'
import { RISK_SCORER_SYSTEM } from './prompts'
import { getRecentContext } from '../memory/liquidmind'
import type { Portfolio } from '../types/portfolio'
import type { Decision } from '../types/decision'

const anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY })

export async function scoreRisk(portfolio: Portfolio): Promise<Decision> {
  try {
    const recentContext = getRecentContext()
    const systemPrompt = recentContext
      ? `${RISK_SCORER_SYSTEM}\n\nRecent decisions for context:\n${recentContext}`
      : RISK_SCORER_SYSTEM

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: JSON.stringify(portfolio) }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const parsed = JSON.parse(text.trim())

    if (
      typeof parsed.risk !== 'number' ||
      typeof parsed.action !== 'string' ||
      typeof parsed.reason !== 'string'
    ) {
      throw new Error('Invalid shape in Claude response')
    }

    return {
      type: 'risk',
      action: parsed.action as 'hold' | 'hedge',
      risk: parsed.risk,
      swap_percent: parsed.swap_percent ?? 0,
      reason: parsed.reason,
      timestamp: new Date().toISOString(),
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] riskScorer error:`, err)
    return {
      type: 'risk',
      action: 'hold',
      risk: 0,
      swap_percent: 0,
      reason: 'scoring error — defaulting to hold',
      timestamp: new Date().toISOString(),
    }
  }
}
