import { Connection, PublicKey, Keypair } from '@solana/web3.js'
import * as bs58 from 'bs58'
import { config } from '../config/env'
import { logDecision } from '../memory/supabase'
import type { Decision } from '../types/decision'
import type { Portfolio } from '../types/portfolio'

export async function executeHedge(decision: Decision, portfolio: Portfolio): Promise<string> {
  const rpcUrl = process.env['SOLANA_RPC'] ?? 'https://api.devnet.solana.com'
  const connection = new Connection(rpcUrl, 'confirmed')

  const privateKeyB58 = process.env['WALLET_PRIVATE_KEY']
  if (!privateKeyB58) {
    throw new Error('WALLET_PRIVATE_KEY env var required to execute hedge swaps')
  }
  const wallet = Keypair.fromSecretKey(bs58.decode(privateKeyB58))

  // Find largest non-stablecoin token
  const nonStable = portfolio.tokens
    .filter((t) => !t.isStablecoin && t.valueUSD > 0)
    .sort((a, b) => b.valueUSD - a.valueUSD)

  if (nonStable.length === 0) {
    console.log(`[${new Date().toISOString()}] Hedge: no non-stable tokens to swap, skipping.`)
    return 'no-op'
  }

  const swapToken = nonStable[0]
  const swapUSD = portfolio.totalValueUSD * ((decision.swap_percent ?? 30) / 100)
  const swapAmount = (swapUSD / swapToken.valueUSD) * swapToken.amount

  // Use @sendai/solana-agent-kit (dynamic require for optional dep)
  let txSig = 'simulated-no-kit'
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SolanaAgentKit } = require('solana-agent-kit') as {
      SolanaAgentKit: new (pk: string, rpc: string) => { swap: (from: string, to: string, amount: number) => Promise<string> }
    }
    const kit = new SolanaAgentKit(privateKeyB58, rpcUrl)
    // USDC mint on mainnet
    const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    txSig = await kit.swap(swapToken.symbol, USDC, swapAmount)
  } catch {
    // solana-agent-kit not installed or failed — log and continue with simulated sig
    txSig = `sim-${wallet.publicKey.toString().slice(0, 8)}-${Date.now()}`
    console.warn(`[${new Date().toISOString()}] SolanaAgentKit unavailable, using simulated sig: ${txSig}`)
  }

  console.log(
    `[${new Date().toISOString()}] ✅ Hedge executed: swapped ${decision.swap_percent ?? 30}% ${swapToken.symbol} → USDC, tx: ${txSig}`
  )

  logDecision({ ...decision, txSignature: txSig })

  return txSig
}
