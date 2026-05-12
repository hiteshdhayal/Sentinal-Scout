import type { Decision } from '../types/decision'

const MAX_MEMORY = 10
let memoryStore: Decision[] = []
let initialized = false

export function initializeLiquidMind(): void {
  memoryStore = []
  initialized = true
  console.log(`[${new Date().toISOString()}] 🧠 LiquidMind memory initialized`)
}

export function rememberDecision(decision: Decision): void {
  if (!initialized) initializeLiquidMind()
  memoryStore.push(decision)
  if (memoryStore.length > MAX_MEMORY) {
    memoryStore.shift()
  }
}

export function getRecentContext(): string {
  if (memoryStore.length === 0) return ''
  return JSON.stringify(memoryStore, null, 2)
}

export function getLastDecision(): Decision | null {
  return memoryStore.length > 0 ? memoryStore[memoryStore.length - 1] : null
}
