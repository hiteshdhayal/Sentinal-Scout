#!/usr/bin/env node
import { Command } from 'commander'
import * as clack from '@clack/prompts'
import chalk from 'chalk'
import figlet from 'figlet'
import ora from 'ora'

import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'

const program = new Command()
program.name('sentinelscout').description('Autonomous Solana portfolio guardian agent').version('0.1.0')

// ─── Helpers ────────────────────────────────────────────────────────────────

function getPackageDir(): string {
  const dir = path.resolve(__dirname, '..')
  if (path.basename(dir) === 'dist') {
    return path.resolve(dir, '..')
  }
  return dir
}

function readExistingEnv(envPath: string): Record<string, string> {
  if (!fs.existsSync(envPath)) return {}
  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  const vars: Record<string, string> = {}
  for (const line of lines) {
    const match = line.match(/^([A-Z_]+)=(.*)$/)
    if (match) vars[match[1]] = match[2]
  }
  return vars
}

function writeEnv(values: Record<string, string | number>, envPath: string): void {
  const lines = [
    '# SentinelScout configuration',
    `WALLET_ADDRESS=${values['WALLET_ADDRESS']}`,
    `WALLET_PRIVATE_KEY=${values['WALLET_PRIVATE_KEY']}`,
    `SOLANA_RPC=${values['SOLANA_RPC']}`,
    `ANTHROPIC_API_KEY=${values['ANTHROPIC_API_KEY']}`,
    `ZERION_API_KEY=${values['ZERION_API_KEY']}`,
    `LPAGENT_API_KEY=${values['LPAGENT_API_KEY']}`,
    `TELEGRAM_BOT_TOKEN=${values['TELEGRAM_BOT_TOKEN']}`,
    `TELEGRAM_CHAT_ID=${values['TELEGRAM_CHAT_ID']}`,
    `X_API_KEY=${values['X_API_KEY']}`,
    `X_API_SECRET=${values['X_API_SECRET']}`,
    `X_ACCESS_TOKEN=${values['X_ACCESS_TOKEN']}`,
    `X_ACCESS_SECRET=${values['X_ACCESS_SECRET']}`,
    `SUPABASE_URL=${values['SUPABASE_URL']}`,
    `SUPABASE_ANON_KEY=${values['SUPABASE_ANON_KEY']}`,
    `RISK_THRESHOLD=${values['RISK_THRESHOLD']}`,
    `YIELD_IMPROVEMENT_PCT=${values['YIELD_IMPROVEMENT_PCT']}`,
    `AGENT_MODE=${values['AGENT_MODE']}`,
    `RISK_INTERVAL_MIN=${values['RISK_INTERVAL_MIN']}`,
    `YIELD_INTERVAL_MIN=${values['YIELD_INTERVAL_MIN']}`,
  ]
  fs.writeFileSync(envPath, lines.join('\n') + '\n')
}

async function runWizard(existing: Record<string, string>): Promise<Record<string, string | number>> {
  // Banner
  const banner = figlet.textSync('SentinelScout', { font: 'ANSI Shadow' })
  console.log(chalk.green(banner))
  console.log(chalk.gray('Autonomous Solana portfolio guardian. Let the buff crab trade for you.\n'))

  clack.intro(chalk.bgGreen(chalk.black(' SentinelScout Setup Wizard ')))

  const walletAddress = await clack.text({
    message: 'Solana wallet address',
    placeholder: existing['WALLET_ADDRESS'] ?? '7xKf...',
    initialValue: existing['WALLET_ADDRESS'] ?? '',
    validate: (v) => {
      if (!v || v.length < 32 || v.length > 44) return 'Must be a valid base58 address (32-44 chars)'
    },
  })
  if (clack.isCancel(walletAddress)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const privateKey = await clack.password({
    message: 'Solana wallet private key (base58)',
    validate: (v) => {
      if (!v || v.length < 32 || v.length > 88) return 'Must be a valid private key'
    },
  })
  if (clack.isCancel(privateKey)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const solanaRpc = await clack.text({
    message: 'Solana RPC URL',
    placeholder: 'https://api.mainnet-beta.solana.com',
    initialValue: existing['SOLANA_RPC'] ?? 'https://api.mainnet-beta.solana.com',
    validate: (v) => {
      if (!v.startsWith('http')) return 'Must be a valid HTTP/HTTPS URL'
    },
  })
  if (clack.isCancel(solanaRpc)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const anthropicKey = await clack.text({
    message: 'Anthropic API key',
    placeholder: 'sk-ant-...',
    initialValue: existing['ANTHROPIC_API_KEY'] ?? '',
    validate: (v) => { if (!v.startsWith('sk-ant-')) return 'Must start with sk-ant-' },
  })
  if (clack.isCancel(anthropicKey)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const zerionKey = await clack.text({
    message: 'Zerion API key',
    placeholder: 'zerion_...',
    initialValue: existing['ZERION_API_KEY'] ?? '',
    validate: (v) => { if (!v) return 'Required' },
  })
  if (clack.isCancel(zerionKey)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const lpagentKey = await clack.text({
    message: 'LPAgent API key',
    placeholder: 'lpagent_...',
    initialValue: existing['LPAGENT_API_KEY'] ?? '',
    validate: (v) => { if (!v) return 'Required' },
  })
  if (clack.isCancel(lpagentKey)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const telegramToken = await clack.text({
    message: 'Telegram bot token',
    placeholder: '123456789:AAF...',
    initialValue: existing['TELEGRAM_BOT_TOKEN'] ?? '',
    validate: (v) => { if (!v.includes(':')) return 'Must contain a colon (BotFather token format)' },
  })
  if (clack.isCancel(telegramToken)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const telegramChatId = await clack.text({
    message: 'Telegram chat ID',
    placeholder: '-100123456789',
    initialValue: existing['TELEGRAM_CHAT_ID'] ?? '',
    validate: (v) => { if (!/^-?\d+$/.test(v)) return 'Must be a numeric chat ID' },
  })
  if (clack.isCancel(telegramChatId)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const xApiKey = await clack.text({
    message: 'X (Twitter) API key',
    initialValue: existing['X_API_KEY'] ?? '',
    validate: (v) => { if (!v) return 'Required' },
  })
  if (clack.isCancel(xApiKey)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const xApiSecret = await clack.text({
    message: 'X (Twitter) API secret',
    initialValue: existing['X_API_SECRET'] ?? '',
    validate: (v) => { if (!v) return 'Required' },
  })
  if (clack.isCancel(xApiSecret)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const xAccessToken = await clack.text({
    message: 'X (Twitter) access token',
    initialValue: existing['X_ACCESS_TOKEN'] ?? '',
    validate: (v) => { if (!v) return 'Required' },
  })
  if (clack.isCancel(xAccessToken)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const xAccessSecret = await clack.text({
    message: 'X (Twitter) access secret',
    initialValue: existing['X_ACCESS_SECRET'] ?? '',
    validate: (v) => { if (!v) return 'Required' },
  })
  if (clack.isCancel(xAccessSecret)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const supabaseUrl = await clack.text({
    message: 'Supabase project URL',
    placeholder: 'https://xyzabc.supabase.co',
    initialValue: existing['SUPABASE_URL'] ?? '',
    validate: (v) => { if (!v.startsWith('https://')) return 'Must start with https://' },
  })
  if (clack.isCancel(supabaseUrl)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const supabaseKey = await clack.text({
    message: 'Supabase anon key',
    initialValue: existing['SUPABASE_ANON_KEY'] ?? '',
    validate: (v) => { if (!v) return 'Required' },
  })
  if (clack.isCancel(supabaseKey)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const riskThreshold = await clack.select({
    message: 'Risk threshold',
    options: [
      { value: '50', label: '50 — Conservative (hedge early)' },
      { value: '70', label: '70 — Balanced (recommended)' },
      { value: '85', label: '85 — Aggressive (hold longer)' },
    ],
    initialValue: existing['RISK_THRESHOLD'] ?? '70',
  })
  if (clack.isCancel(riskThreshold)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const yieldPct = await clack.select({
    message: 'Yield improvement threshold to trigger migration',
    options: [
      { value: '10', label: '10% — Migrate frequently' },
      { value: '20', label: '20% — Balanced (recommended)' },
      { value: '30', label: '30% — Only significant improvements' },
    ],
    initialValue: existing['YIELD_IMPROVEMENT_PCT'] ?? '20',
  })
  if (clack.isCancel(yieldPct)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const agentMode = await clack.select({
    message: 'Agent mode',
    options: [
      { value: 'autonomous', label: 'autonomous — Executes trades automatically' },
      { value: 'notify', label: 'notify — Sends alerts only, no execution' },
    ],
    initialValue: existing['AGENT_MODE'] ?? 'autonomous',
  })
  if (clack.isCancel(agentMode)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const riskInterval = await clack.select({
    message: 'Risk scan interval',
    options: [
      { value: '5', label: '5 min — Frequent' },
      { value: '15', label: '15 min — Balanced (recommended)' },
      { value: '30', label: '30 min — Relaxed' },
    ],
    initialValue: existing['RISK_INTERVAL_MIN'] ?? '15',
  })
  if (clack.isCancel(riskInterval)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const yieldInterval = await clack.select({
    message: 'Yield scan interval',
    options: [
      { value: '30', label: '30 min — Frequent' },
      { value: '60', label: '60 min — Balanced (recommended)' },
      { value: '120', label: '120 min — Relaxed' },
    ],
    initialValue: existing['YIELD_INTERVAL_MIN'] ?? '60',
  })
  if (clack.isCancel(yieldInterval)) { clack.cancel('Setup cancelled'); process.exit(0) }

  const confirmed = await clack.confirm({ message: 'Ready to deploy your agent?' })
  if (clack.isCancel(confirmed) || !confirmed) { clack.cancel('Setup cancelled'); process.exit(0) }

  return {
    WALLET_ADDRESS: walletAddress as string,
    WALLET_PRIVATE_KEY: privateKey as string,
    SOLANA_RPC: solanaRpc as string,
    ANTHROPIC_API_KEY: anthropicKey as string,
    ZERION_API_KEY: zerionKey as string,
    LPAGENT_API_KEY: lpagentKey as string,
    TELEGRAM_BOT_TOKEN: telegramToken as string,
    TELEGRAM_CHAT_ID: telegramChatId as string,
    X_API_KEY: xApiKey as string,
    X_API_SECRET: xApiSecret as string,
    X_ACCESS_TOKEN: xAccessToken as string,
    X_ACCESS_SECRET: xAccessSecret as string,
    SUPABASE_URL: supabaseUrl as string,
    SUPABASE_ANON_KEY: supabaseKey as string,
    RISK_THRESHOLD: riskThreshold as string,
    YIELD_IMPROVEMENT_PCT: yieldPct as string,
    AGENT_MODE: agentMode as string,
    RISK_INTERVAL_MIN: riskInterval as string,
    YIELD_INTERVAL_MIN: yieldInterval as string,
  }
}

async function printStatus(): Promise<void> {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3001/health', (res) => {
      let data = ''
      res.on('data', (chunk: Buffer) => { data += chunk.toString() })
      res.on('end', () => {
        try {
          const s = JSON.parse(data) as {
            status: string; wallet: string; mode: string; lastDecision: { reason: string; action: string; risk?: number; timestamp: string } | null;
            uptimeSeconds: number; nextRiskScanMs: number; nextYieldScanMs: number
          }
          const uptime = `${Math.floor(s.uptimeSeconds / 3600)}h ${Math.floor((s.uptimeSeconds % 3600) / 60)}m`
          const lastAction = s.lastDecision
            ? `${s.lastDecision.action}${s.lastDecision.risk !== undefined ? ` (risk=${s.lastDecision.risk})` : ''} — ${s.lastDecision.reason}`
            : 'None yet'
          console.log(chalk.green('\nSentinelScout — RUNNING\n'))
          console.log(`  ${chalk.gray('Wallet     ')}  ${s.wallet}`)
          console.log(`  ${chalk.gray('Mode       ')}  ${s.mode}`)
          console.log(`  ${chalk.gray('Last action')}  ${lastAction}`)
          console.log(`  ${chalk.gray('Next risk  ')}  in ${Math.round(s.nextRiskScanMs / 1000 / 60)} min`)
          console.log(`  ${chalk.gray('Next yield ')}  in ${Math.round(s.nextYieldScanMs / 1000 / 60)} min`)
          console.log(`  ${chalk.gray('Uptime     ')}  ${uptime}\n`)
        } catch {
          console.log(chalk.yellow('Agent is running but health response was malformed.'))
        }
        resolve()
      })
    })
    req.on('error', () => {
      console.log(chalk.red('Agent is not running. Use `sentinelscout start`.'))
      resolve()
    })
    req.setTimeout(3000, () => {
      req.destroy()
      console.log(chalk.red('Agent is not running. Use `sentinelscout start`.'))
      resolve()
    })
  })
}

// ─── Commands ────────────────────────────────────────────────────────────────

program
  .command('setup')
  .description('Interactive setup wizard — configure your agent')
  .action(async () => {
    const values = await runWizard({})
    const envPath = path.join(process.cwd(), '.env')
    writeEnv(values, envPath)
    fs.writeFileSync(
      path.join(process.cwd(), 'sentinel.config.json'),
      JSON.stringify({ version: '0.1.0', configuredAt: new Date().toISOString(), wallet: values['WALLET_ADDRESS'], mode: values['AGENT_MODE'] }, null, 2)
    )
    clack.outro(chalk.green('Agent configured. Run `sentinelscout start` to deploy.'))
  })

program
  .command('config')
  .description('Reconfigure the agent — pre-populated with existing values')
  .action(async () => {
    const envPath = path.join(process.cwd(), '.env')
    const existing = readExistingEnv(envPath)
    const values = await runWizard(existing)
    writeEnv(values, envPath)
    fs.writeFileSync(
      path.join(process.cwd(), 'sentinel.config.json'),
      JSON.stringify({ version: '0.1.0', configuredAt: new Date().toISOString(), wallet: values['WALLET_ADDRESS'], mode: values['AGENT_MODE'] }, null, 2)
    )
    clack.outro(chalk.green('Config updated. Restart the agent with `sentinelscout start`.'))
  })

program
  .command('start')
  .description('Start the agent (native Node.js)')
  .action(async () => {
    const { spawn } = await import('child_process');
    const fs = await import('fs');
    const path = await import('path');
    
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      console.error(chalk.red('❌ .env not found. Run `sentinelscout setup` first.'));
      process.exit(1);
    }

    // Load .env manually
    const dotenv = await import('dotenv');
    const envConfig = dotenv.config({ path: envPath });
    if (envConfig.error) {
      console.error(chalk.red('❌ Failed to load .env file.'));
      process.exit(1);
    }

    const scriptPath = path.join(getPackageDir(), 'dist', 'src', 'index.js');
    const agent = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, ...envConfig.parsed }
    });

    agent.on('close', (code) => {
      process.exit(code ?? 0);
    });
  });



program
  .command('status')
  .description('Show agent status')
  .action(async () => {
    await printStatus()
  })



program.parse(process.argv)
