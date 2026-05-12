import { config } from '../config/env'

export async function sendAlert(message: string): Promise<void> {
  const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    })
    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Telegram API ${response.status}: ${body}`)
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Telegram sendAlert error:`, err)
    // Do not re-throw — posting failure must never crash the agent
  }
}
