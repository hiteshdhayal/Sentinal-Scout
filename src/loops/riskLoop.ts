import { config } from '../config/env'
import { RISK_INTERVAL_MS } from '../config/thresholds'
import { getPortfolio } from '../integrations/zerion'
import { scoreRisk } from '../brain/riskScorer'
import { executeHedge } from '../actions/hedgeSwap'
import { postUpdate } from '../actions/shipPost'
import { logDecision } from '../memory/supabase'
import { rememberDecision } from '../memory/liquidmind'

let lastRiskRun = Date.now()

export function getNextRiskScanMs(): number {
  return Math.max(0, RISK_INTERVAL_MS - (Date.now() - lastRiskRun))
}

export async function startRiskLoop(): Promise<void> {
  const run = async () => {
    lastRiskRun = Date.now()
    const ts = new Date().toISOString()
    console.log(`[${ts}] 🔍 Risk loop running...`)

    let portfolio
    try {
      portfolio = await getPortfolio(config.WALLET_ADDRESS)
    } catch (err) {
      console.error(`[${ts}] Risk loop: getPortfolio failed:`, err)
      return
    }

    const decision = await scoreRisk(portfolio)
    rememberDecision(decision)
    console.log(`[${ts}] Risk score: ${decision.risk} — action: ${decision.action} — ${decision.reason}`)

    if (decision.action === 'hedge' && config.AGENT_MODE === 'autonomous') {
      try {
        const txSig = await executeHedge(decision, portfolio)
        decision.txSignature = txSig
      } catch (err) {
        console.error(`[${ts}] Risk loop: executeHedge failed:`, err)
      }
    }

    try {
      await postUpdate(decision, portfolio)
    } catch (err) {
      console.error(`[${ts}] Risk loop: postUpdate failed:`, err)
    }

    logDecision(decision)
  }

  void run()
  setInterval(() => void run(), RISK_INTERVAL_MS)
}
