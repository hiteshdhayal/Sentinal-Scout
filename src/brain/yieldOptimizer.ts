import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config/env'
import { YIELD_OPTIMIZER_SYSTEM } from './prompts'
import { getRecentContext } from '../memory/liquidmind'
import type { Pool } from '../types/portfolio'
import type { Decision } from '../types/decision'

const anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY })

interface YieldRecommendation {
  migrate: boolean
  targetPool: string
  expectedImprovement: number
  reason: string
}

export async function findBestPool(pools: Pool[]): Promise<Decision> {
  try {
    const recentContext = getRecentContext()
    const systemPrompt = recentContext
      ? `${YIELD_OPTIMIZER_SYSTEM}\n\nRecent decisions for context:\n${recentContext}`
      : YIELD_OPTIMIZER_SYSTEM

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: JSON.stringify(pools) }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const parsed: YieldRecommendation = JSON.parse(text.trim())

    if (
      typeof parsed.migrate !== 'boolean' ||
      typeof parsed.targetPool !== 'string' ||
      typeof parsed.expectedImprovement !== 'number' ||
      typeof parsed.reason !== 'string'
    ) {
      throw new Error('Invalid shape in Claude yield response')
    }

    return {
      type: 'yield',
      action: parsed.migrate ? 'migrate' : 'hold',
      targetPool: parsed.targetPool,
      expectedImprovement: parsed.expectedImprovement,
      reason: parsed.reason,
      timestamp: new Date().toISOString(),
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] yieldOptimizer error:`, err)
    return {
      type: 'yield',
      action: 'hold',
      targetPool: '',
      expectedImprovement: 0,
      reason: 'yield optimization error — defaulting to hold',
      timestamp: new Date().toISOString(),
    }
  }
}
