import express from 'express'
import { config } from '../config/env'
import { getLastDecision } from '../memory/liquidmind'
import { getNextRiskScanMs } from '../loops/riskLoop'
import { getNextYieldScanMs } from '../loops/yieldLoop'

const PORT = 3001

export function startHealthServer(): void {
  const app = express()

  app.get('/health', (_req, res) => {
    const wallet = config.WALLET_ADDRESS
    const truncatedWallet = `${wallet.slice(0, 4)}...${wallet.slice(-4)}`

    res.json({
      status: 'running',
      wallet: truncatedWallet,
      mode: config.AGENT_MODE,
      lastDecision: getLastDecision(),
      uptimeSeconds: Math.floor(process.uptime()),
      nextRiskScanMs: getNextRiskScanMs(),
      nextYieldScanMs: getNextYieldScanMs(),
    })
  })

  app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] 🏥 Health server running on http://localhost:${PORT}/health`)
  })
}
