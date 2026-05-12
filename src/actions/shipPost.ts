import Anthropic from '@anthropic-ai/sdk'
import { TwitterApi } from 'twitter-api-v2'
import { config } from '../config/env'
import { sendAlert } from '../integrations/telegram'
import { TWEET_WRITER_SYSTEM } from '../brain/prompts'
import type { Decision } from '../types/decision'
import type { Portfolio } from '../types/portfolio'

const anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY })

function getTwitterClient(): TwitterApi {
  return new TwitterApi({
    appKey: config.X_API_KEY,
    appSecret: config.X_API_SECRET,
    accessToken: config.X_ACCESS_TOKEN,
    accessSecret: config.X_ACCESS_SECRET,
  })
}

async function generateTweetText(decision: Decision, portfolioSummary: object): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: TWEET_WRITER_SYSTEM,
    messages: [{ role: 'user', content: JSON.stringify({ decision, portfolioSummary }) }],
  })
  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return text.trim().slice(0, 240)
}

export async function postUpdate(decision: Decision, portfolio: Portfolio): Promise<void> {
  const portfolioSummary = {
    totalValueUSD: portfolio.totalValueUSD,
    tokenCount: portfolio.tokens.length,
    lpPositionCount: portfolio.lpPositions.length,
    topToken: portfolio.tokens[0]?.symbol ?? 'N/A',
  }

  let tweetText = ''
  try {
    tweetText = await generateTweetText(decision, portfolioSummary)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] shipPost: Claude tweet generation failed:`, err)
    tweetText = `Risk score ${decision.risk ?? 'N/A'} — action: ${decision.action}. ${decision.reason} #Solana #BuildInPublic`
  }

  // Post to X
  try {
    const client = getTwitterClient()
    await client.v2.tweet(tweetText)
    console.log(`[${new Date().toISOString()}] 🐦 Tweet posted: ${tweetText.slice(0, 60)}...`)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] shipPost: Twitter post failed:`, err)
  }

  // Send to Telegram (sendAlert already handles its own errors)
  await sendAlert(tweetText)
}

export async function postYieldUpdate(decision: Decision): Promise<void> {
  let tweetText = ''
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: TWEET_WRITER_SYSTEM,
      messages: [{ role: 'user', content: JSON.stringify(decision) }],
    })
    tweetText = response.content[0].type === 'text'
      ? response.content[0].text.trim().slice(0, 240)
      : ''
  } catch (err) {
    console.error(`[${new Date().toISOString()}] shipPost: yield tweet generation failed:`, err)
    tweetText = `Yield scan complete — action: ${decision.action}. ${decision.reason} #Solana #BuildInPublic`
  }

  try {
    const client = getTwitterClient()
    await client.v2.tweet(tweetText)
    console.log(`[${new Date().toISOString()}] 🐦 Yield tweet posted: ${tweetText.slice(0, 60)}...`)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] shipPost: yield Twitter post failed:`, err)
  }

  await sendAlert(tweetText)
}
