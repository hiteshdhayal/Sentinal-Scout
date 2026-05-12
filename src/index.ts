import { config } from './config/env'
import { initializeLiquidMind } from './memory/liquidmind'
import { startHealthServer } from './health/server'
import { startRiskLoop } from './loops/riskLoop'
import { startYieldLoop } from './loops/yieldLoop'

const wallet = config.WALLET_ADDRESS
const truncated = `${wallet.slice(0, 6)}...${wallet.slice(-6)}`

console.log(`
╔═══════════════════════════════════════════╗
║          SENTINEL-SCOUT  v0.1.0           ║
║   Autonomous Solana Portfolio Guardian    ║
╚═══════════════════════════════════════════╝
`)
console.log(`[${new Date().toISOString()}] 🦀 Starting agent`)
console.log(`[${new Date().toISOString()}] 👛 Wallet: ${truncated}`)
console.log(`[${new Date().toISOString()}] ⚙️  Mode: ${config.AGENT_MODE}`)
console.log(`[${new Date().toISOString()}] ⏱️  Risk scan every ${config.RISK_INTERVAL_MIN}min, Yield scan every ${config.YIELD_INTERVAL_MIN}min`)

initializeLiquidMind()
startHealthServer()

void startRiskLoop()
void startYieldLoop()

function shutdown(signal: string) {
  console.log(`\n[${new Date().toISOString()}] 🛑 Received ${signal} — shutting down gracefully`)
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
