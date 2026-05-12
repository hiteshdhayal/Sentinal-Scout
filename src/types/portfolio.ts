export interface Portfolio {
  walletAddress: string
  totalValueUSD: number
  tokens: Array<{
    symbol: string
    amount: number
    valueUSD: number
    priceChangePercent24h: number
    isStablecoin: boolean
  }>
  lpPositions: Array<{
    poolId: string
    poolName: string
    valueUSD: number
    apy: number
  }>
  fetchedAt: string
}

export interface LPPosition {
  poolId: string
  poolName: string
  valueUSD: number
  apy: number
}

export interface Pool {
  id: string
  name: string
  apy: number
  tvl: number
  token0: string
  token1: string
  chain: string
}
