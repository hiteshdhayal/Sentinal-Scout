import { config } from '../config/env'
import type { Pool } from '../types/portfolio'

export async function getPools(): Promise<Pool[]> {
  try {
    const response = await fetch(
      'https://api.lpagent.io/v1/pools?chain=solana',
      {
        headers: {
          Authorization: `Bearer ${config.LPAGENT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    if (!response.ok) {
      const body = await response.text()
      throw new Error(`HTTP ${response.status}: ${body}`)
    }
    const data = await response.json() as { pools?: Pool[] } | Pool[]
    // Handle both { pools: [...] } and [...] response shapes
    const pools: Pool[] = Array.isArray(data)
      ? data
      : (data as { pools?: Pool[] }).pools ?? []
    return pools
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`LPAgent API failed: ${message}`)
  }
}
