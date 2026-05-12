import { config } from '../config/env'
import { YIELD_INTERVAL_MS, YIELD_IMPROVEMENT_PCT } from '../config/thresholds'
import { getPools } from '../integrations/lpagent'
import { findBestPool } from '../brain/yieldOptimizer'
import { migrateTo } from '../actions/migrateLP'
import { postYieldUpdate } from '../actions/shipPost'
import { logDecision } from '../memory/supabase'
import { rememberDecision } from '../memory/liquidmind'
import { getPortfolio } from '../integrations/zerion'
import type { LPPosition, Portfolio } from '../types/portfolio'

let lastYieldRun = Date.now()

export function getNextYieldScanMs(): number {
  return Math.max(0, YIELD_INTERVAL_MS - (Date.now() - lastYieldRun))
}

export async function startYieldLoop(): Promise<void> {
  const run = async () => {
    lastYieldRun = Date.now()
    const ts = new Date().toISOString()
    console.log(`[${ts}] 🌾 Yield loop running...`)

    let pools
    try {
      pools = await getPools()
    } catch (err) {
      console.error(`[${ts}] Yield loop: getPools failed:`, err)
      return
    }

    const decision = await findBestPool(pools)
    rememberDecision(decision)
    console.log(
      `[${ts}] Yield recommendation: ${decision.action} → ${decision.targetPool ?? 'hold'} (+${decision.expectedImprovement ?? 0}% APY)`
    )

    if (
      decision.action === 'migrate' &&
      (decision.expectedImprovement ?? 0) > YIELD_IMPROVEMENT_PCT &&
      config.AGENT_MODE === 'autonomous' &&
      decision.targetPool
    ) {
      try {
        let portfolio: Portfolio | null = null
        try {
          portfolio = await getPortfolio(config.WALLET_ADDRESS)
        } catch (err) {
          console.warn(`[${ts}] Yield loop: getPortfolio failed, using fallback position for migration`)
        }

        const currentPosition: LPPosition = portfolio?.lpPositions?.[0] ?? {
          poolId: 'current-pool',
          poolName: 'Current Pool',
          valueUSD: 0,
          apy: 0,
        }

        if (!portfolio?.lpPositions?.length) {
          console.warn(`[${ts}] Yield loop: No actual LP positions found to migrate, skipping execution.`)
        } else {
          const txSig = await migrateTo(decision.targetPool, currentPosition)
          decision.txSignature = txSig
        }
      } catch (err) {
        console.error(`[${ts}] Yield loop: migrateTo failed:`, err)
      }
    }

    try {
      await postYieldUpdate(decision)
    } catch (err) {
      console.error(`[${ts}] Yield loop: postYieldUpdate failed:`, err)
    }

    logDecision(decision)
  }

  void run()
  setInterval(() => void run(), YIELD_INTERVAL_MS)
}
