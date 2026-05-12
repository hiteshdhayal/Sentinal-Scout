import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from '../config/env'
import type { Decision } from '../types/decision'

let supabase: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY)
  }
  return supabase
}

export function logDecision(decision: Decision): void {
  // Fire-and-forget — never await, never throw
  getClient()
    .from('decisions')
    .insert({
      wallet: config.WALLET_ADDRESS,
      action: decision.action,
      risk_score: decision.risk ?? null,
      reason: decision.reason,
      tx_signature: decision.txSignature ?? null,
      created_at: decision.timestamp,
    })
    .then(
      ({ error }) => {
        if (error) {
          console.error(`[${new Date().toISOString()}] Supabase log error:`, error.message)
        }
      },
      (err: unknown) => {
        console.error(`[${new Date().toISOString()}] Supabase unexpected error:`, err)
      }
    )
}
