# SENTINEL-SCOUT

> Autonomous Solana portfolio guardian — the buff crab watches your wallet so you don't have to.

---

## Install

```bash
npm install -g sentinelscout
sentinelscout setup
sentinelscout start
```

---

## How It Works

- **Risk loop**: Every 15 min, pulls your portfolio via Zerion CLI, scores risk with Claude Sonnet, and swaps into USDC if risk exceeds your threshold.
- **Yield loop**: Every 60 min, scans Meteora LP pools via LPAgent, and migrates your position to the highest-APY pool if improvement is above your threshold.
- **Social**: After every action, generates a build-in-public tweet via Claude and posts to X and Telegram automatically.

---

## CLI Commands

| Command                   | Description                                             |
|---------------------------|---------------------------------------------------------|
| `sentinelscout setup`     | Interactive setup wizard — configure API keys & thresholds |
| `sentinelscout start`     | Start the agent natively via PM2                        |
| `sentinelscout stop`      | Stop the native PM2 agent                               |
| `sentinelscout logs`      | Stream live agent logs (PM2)                            |
| `sentinelscout status`    | Print agent status table                                |
| `sentinelscout update`    | Update the agent via npm                                |
| `sentinelscout config`    | Reconfigure — pre-populated with existing values        |

---

## Config Options

| Variable               | Default       | Description                                    |
|------------------------|---------------|------------------------------------------------|
| `WALLET_ADDRESS`       | —             | Solana wallet to monitor                       |
| `WALLET_PRIVATE_KEY`   | —             | **REQUIRED.** Base58 private key for trades/migrations |
| `SOLANA_RPC`           | `devnet`      | Solana RPC URL (e.g., devnet or mainnet)       |
| `ANTHROPIC_API_KEY`    | —             | Claude API key for AI decisions                |
| `ZERION_API_KEY`       | —             | Zerion CLI integration key                     |
| `LPAGENT_API_KEY`      | —             | LPAgent.io API key for pool data               |
| `TELEGRAM_BOT_TOKEN`   | —             | Telegram bot for alerts                        |
| `TELEGRAM_CHAT_ID`     | —             | Telegram chat to send alerts to                |
| `X_API_KEY`            | —             | X (Twitter) API credentials                    |
| `SUPABASE_URL`         | —             | Supabase project URL for decision logging      |
| `RISK_THRESHOLD`       | `70`          | Score 0-100; hedge when exceeded               |
| `YIELD_IMPROVEMENT_PCT`| `20`          | Min APY % improvement to trigger migration     |
| `AGENT_MODE`           | `autonomous`  | `autonomous` = execute trades, `notify` = alerts only |
| `RISK_INTERVAL_MIN`    | `15`          | Minutes between risk scans                     |
| `YIELD_INTERVAL_MIN`   | `60`          | Minutes between yield scans                    |

---

## Requirements

- **Node.js** 18+
- **zerion-cli** installed globally (REQUIRED): `npm install -g zerion-cli`

---

## Supabase Table

Create a `decisions` table in your Supabase project:

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

---

## License

MIT © 2025 SentinelScout
