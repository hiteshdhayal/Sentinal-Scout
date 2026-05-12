import * as dotenv from 'dotenv'
import { z } from 'zod'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const EnvSchema = z.object({
  WALLET_ADDRESS: z.string().min(32).max(44),
  WALLET_PRIVATE_KEY: z.string().min(32).max(88),
  SOLANA_RPC: z.string().url().default('https://api.mainnet-beta.solana.com'),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  ZERION_API_KEY: z.string().min(1),
  LPAGENT_API_KEY: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().includes(':'),
  TELEGRAM_CHAT_ID: z.string().regex(/^\d+$/),
  X_API_KEY: z.string().min(1),
  X_API_SECRET: z.string().min(1),
  X_ACCESS_TOKEN: z.string().min(1),
  X_ACCESS_SECRET: z.string().min(1),
  SUPABASE_URL: z.string().url().startsWith('https://'),
  SUPABASE_ANON_KEY: z.string().min(1),
  RISK_THRESHOLD: z.coerce.number().int().min(0).max(100).default(70),
  YIELD_IMPROVEMENT_PCT: z.coerce.number().int().min(0).max(100).default(20),
  AGENT_MODE: z.enum(['autonomous', 'notify']).default('autonomous'),
  RISK_INTERVAL_MIN: z.coerce.number().int().positive().default(15),
  YIELD_INTERVAL_MIN: z.coerce.number().int().positive().default(60),
})

type EnvConfig = z.infer<typeof EnvSchema>

function loadConfig(): EnvConfig {
  const result = EnvSchema.safeParse(process.env)
  if (!result.success) {
    const errors = result.error.errors
    for (const err of errors) {
      const field = err.path.join('.')
      console.error(`[SentinelScout] ❌ Missing or invalid env var: ${field} — ${err.message}`)
    }
    process.exit(1)
  }
  return result.data
}

export const config = loadConfig()
