import execa from 'execa'
import type { Portfolio } from '../types/portfolio'

export async function getPortfolio(walletAddress: string): Promise<Portfolio> {
  try {
    await execa('zerion-cli', ['--version'])
  } catch {
    throw new Error('zerion-cli not found. Install with: npm install -g zerion-cli')
  }

  try {
    const result = await execa('zerion-cli', [
      'wallet', 'analyze', walletAddress, '--format', 'json',
    ])
    const raw = JSON.parse(result.stdout) as Record<string, unknown>

    // Map zerion-cli output to our Portfolio type
    const portfolio: Portfolio = {
      walletAddress,
      totalValueUSD: (raw['totalValueUSD'] as number) ?? 0,
      tokens: Array.isArray(raw['tokens'])
        ? (raw['tokens'] as Array<Record<string, unknown>>).map((t) => ({
            symbol: String(t['symbol'] ?? ''),
            amount: Number(t['amount'] ?? 0),
            valueUSD: Number(t['valueUSD'] ?? 0),
            priceChangePercent24h: Number(t['priceChangePercent24h'] ?? 0),
            isStablecoin: Boolean(t['isStablecoin'] ?? false),
          }))
        : [],
      lpPositions: Array.isArray(raw['lpPositions'])
        ? (raw['lpPositions'] as Array<Record<string, unknown>>).map((p) => ({
            poolId: String(p['poolId'] ?? ''),
            poolName: String(p['poolName'] ?? ''),
            valueUSD: Number(p['valueUSD'] ?? 0),
            apy: Number(p['apy'] ?? 0),
          }))
        : [],
      fetchedAt: new Date().toISOString(),
    }
    return portfolio
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Zerion CLI failed: ${message}`)
  }
}
