Here's a detailed README for your SentinelScout project:

```markdown
# 🦀 SentinelScout

> **Autonomous Solana Portfolio Guardian** — Let the buff crab trade for you while you touch grass.

[![npm version](https://badge.fury.io/js/sentinelscout.svg)](https://www.npmjs.com/package/sentinelscout)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 Overview

SentinelScout is an **autonomous AI agent** that monitors your Solana portfolio, detects risk, and optimizes yield — all without human intervention. It leverages:

- **Zerion CLI** for real-time portfolio risk analysis
- **LPAgent.io** for Meteora LP pool yield scanning
- **Claude (Anthropic)** for intelligent decision making
- **Solana Agent Kit** for on-chain execution
- **Supabase** for transparent decision logging

## 🚀 Quick Install

```bash
npm install -g sentinelscout
sentinelscout setup
sentinelscout start
```

Or run without installing:

```bash
npx sentinelscout setup
npx sentinelscout start
```

## 🧠 How It Works

### 🔴 Risk Monitoring Loop (Default: every 15 min)

1. **Fetch Portfolio** → Uses Zerion CLI to pull your wallet's token balances and LP positions
2. **AI Risk Scoring** → Claude analyzes your portfolio (memecoin exposure, volatility, concentration risk)
3. **Decision** → If risk score exceeds your threshold (default 70):
   - **Autonomous Mode**: Swaps 30% of the riskiest token → USDC
   - **Notify Mode**: Only sends alerts via Telegram/X
4. **Social Posting** → Auto-tweets the action with #Solana #BuildInPublic

### 🟢 Yield Optimization Loop (Default: every 60 min)

1. **Scan Meteora Pools** → Fetches all active LP pools via LPAgent.io API
2. **AI Yield Analysis** → Claude compares APYs, TVL, and token pairs
3. **Migration Decision** → If better pool offers APY improvement > threshold (default 20%):
   - Exits current LP position
   - Enters the higher-yield pool
4. **Build in Public** → Posts migration details to X and Telegram

## 🔧 Detailed Integration Guides

### 1. Zerion CLI Integration

**What it does**: Provides real-time wallet portfolio data including token balances, USD values, 24h price changes, and LP positions.

**Installation** (required for SentinelScout to work):
```bash
npm install -g zerion-cli
```

**Verification**:
```bash
zerion-cli wallet analyze YOUR_WALLET_ADDRESS --format json
```

**API Key**: Get one at [developers.zerion.io](https://developers.zerion.io)

**How SentinelScout uses it**:
- Fetches your complete portfolio every risk scan
- Identifies stablecoins vs volatile assets
- Tracks LP position values and APYs
- Provides 24h price change data for risk calculation

### 2. LPAgent.io Integration

**What it does**: Aggregates Meteora liquidity pool data including APY, TVL, fee tiers, and token pairs across Solana.

**API Endpoint Used**: `https://api.lpagent.io/v1/pools?chain=solana`

**API Key**: Get one at [lpagent.io](https://lpagent.io)

**How SentinelScout uses it**:
- Fetches all active Meteora pools every yield scan
- Sorts pools by APY and TVL
- Provides data for Claude to identify optimal migration targets
- Ensures you're always in the highest-yielding pool

**Data Structure**:
```typescript
interface Pool {
  id: string;        // Meteora pool address
  name: string;      // e.g., "SOL-USDC"
  apy: number;       // Annual Percentage Yield
  tvl: number;       // Total Value Locked (USD)
  token0: string;    // First token symbol
  token1: string;    // Second token symbol
  chain: string;     // "solana"
}
```

### 3. Solana Agent Kit (Trade Execution)

**What it does**: Provides low-level Solana transaction building for swaps and LP management.

**Used for**:
- **Risk Hedge**: Swapping volatile tokens → USDC via Jupiter
- **LP Migration**: Exiting current Meteora positions and entering new ones

**Installation** (will be auto-installed with SentinelScout):
```bash
npm install @sendai/solana-agent-kit
```

**Required Environment Variables**:
```bash
WALLET_PRIVATE_KEY=your_base58_private_key
SOLANA_RPC=https://api.mainnet-beta.solana.com
```

**Note**: If Solana Agent Kit is not available, SentinelScout falls back to simulated transactions (safe for testing).

### 4. Claude (Anthropic) AI Integration

**What it does**: Powers all intelligent decision making in SentinelScout.

**Two AI Models Used**:

#### Risk Scorer
```typescript
// Input: Your portfolio JSON
// Output: Decision object
{
  "risk": 74,           // 0-100 score
  "action": "hedge",    // hedge or hold
  "swap_percent": 30,   // % to convert to USDC
  "reason": "High memecoin exposure with -15% 24h change"
}
```

#### Yield Optimizer
```typescript
// Input: Array of Meteora pools
// Output: Migration decision
{
  "migrate": true,
  "targetPool": "pool_address",
  "expectedImprovement": 25.3,  // APY improvement %
  "reason": "Moving from SOL-USDC (12% APY) to SOL-USDT (15% APY)"
}
```

#### Tweet Writer
```typescript
// Input: Decision summary
// Output: AI-generated tweet under 240 chars
"Risk score 74 — hedging 30% JTO → USDC. Staying defensive. #Solana #BuildInPublic"
```

**API Key**: Get one at [console.anthropic.com](https://console.anthropic.com) (requires Claude access)

### 5. Supabase Integration (Transparency Logging)

**What it does**: Logs every decision to a public database for auditability.

**Table Schema**:
```sql
create table decisions (
  id uuid primary key default gen_random_uuid(),
  wallet text not null,
  action text not null,
  risk_score int,
  reason text,
  tx_signature text,
  created_at timestamptz default now()
);
```

**Why this matters**: Anyone can query your decision history, making the agent fully transparent.

**Setup**:
1. Create free Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL above in the SQL editor
3. Copy your project URL and anon key to `.env`

## 🎮 CLI Commands

| Command | Description |
|---------|-------------|
| `sentinelscout setup` | Interactive wizard – configure all API keys |
| `sentinelscout start` | Launch the autonomous agent |
| `sentinelscout status` | Show current agent status (risk/next scans) |
| `sentinelscout config` | Reconfigure with existing values pre-filled |

## ⚙️ Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `WALLET_ADDRESS` | — | Your Solana wallet address |
| `WALLET_PRIVATE_KEY` | — | Private key (for executing trades) |
| `SOLANA_RPC` | mainnet-beta | Solana RPC endpoint |
| `ANTHROPIC_API_KEY` | — | Claude API key |
| `ZERION_API_KEY` | — | Zerion CLI key |
| `LPAGENT_API_KEY` | — | LPAgent.io API key |
| `RISK_THRESHOLD` | 70 | 0-100 – hedge when exceeded |
| `YIELD_IMPROVEMENT_PCT` | 20 | Minimum APY % to trigger migration |
| `AGENT_MODE` | autonomous | `autonomous` or `notify` |
| `RISK_INTERVAL_MIN` | 15 | Minutes between risk scans |
| `YIELD_INTERVAL_MIN` | 60 | Minutes between yield scans |

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     SentinelScout CLI                        │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │  Risk Loop   │      │  Yield Loop  │                     │
│  │  (15 min)    │      │  (60 min)    │                     │
│  └──────┬───────┘      └──────┬───────┘                     │
│         │                      │                             │
│         ▼                      ▼                             │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │Zerion CLI    │      │LPAgent API   │                     │
│  │Portfolio     │      │Meteora Pools │                     │
│  └──────┬───────┘      └──────┬───────┘                     │
│         │                      │                             │
│         └──────────┬───────────┘                             │
│                    ▼                                         │
│             ┌──────────────┐                                 │
│             │Claude (AI)   │                                 │
│             │Decision      │                                 │
│             └──────┬───────┘                                 │
│                    │                                         │
│         ┌──────────┼──────────┐                              │
│         ▼          ▼          ▼                              │
│  ┌──────────┐┌──────────┐┌──────────┐                       │
│  │Solana    ││X/Twitter ││Telegram  │                       │
│  │Execution ││Posting   ││Alerts    │                       │
│  └──────────┘└──────────┘└──────────┘                       │
│                                                              │
│                    ┌──────────┐                              │
│                    │ Supabase │                              │
│                    │ Logging  │                              │
│                    └──────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

## 🛡️ Security Notes

- **Private Key Storage**: Your `WALLET_PRIVATE_KEY` is stored in plaintext `.env`. Use a dedicated hot wallet with limited funds.
- **API Keys**: Store securely, never commit to GitHub.
- **RPC Endpoint**: Use your own RPC (Helius, QuickNode) for production to avoid rate limits.

## 🐛 Troubleshooting

### Zerion CLI not found
```bash
npm install -g zerion-cli
which zerion-cli  # Should show path
```

### LPAgent API rate limits
Upgrade your LPAgent plan or reduce `YIELD_INTERVAL_MIN` to 120.

### "Transaction simulation failed"
- Check you have enough SOL for gas fees
- Verify wallet private key is correct
- Try on devnet first: `SOLANA_RPC=https://api.devnet.solana.com`

### Claude API errors
- Ensure your Anthropic account has credits
- API key must start with `sk-ant-`

## 📝 License

MIT © 2025 SentinelScout

## 🙏 Credits

- [Zerion](https://zerion.io) – Portfolio data
- [LPAgent](https://lpagent.io) – Meteora pool data
- [Anthropic](https://anthropic.com) – Claude AI
- [Solana Agent Kit](https://github.com/sendai/solana-agent-kit) – Transaction building

---

**Built for [Colosseum Hackathon](https://colosseum.org)** 🏆

*"Go touch some grass. Let the buff crab trade for you."* 🦀
```

This README includes:
- Detailed Zerion CLI setup and usage
- LPAgent.io API integration explanation
- Solana Agent Kit execution layer
- Claude AI decision-making logic
- Architecture diagram
- Troubleshooting guide
- Security best practices
