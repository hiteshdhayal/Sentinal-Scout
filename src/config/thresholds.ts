import { config } from './env'

export const RISK_THRESHOLD = config.RISK_THRESHOLD
export const YIELD_IMPROVEMENT_PCT = config.YIELD_IMPROVEMENT_PCT
export const RISK_INTERVAL_MS = config.RISK_INTERVAL_MIN * 60 * 1000
export const YIELD_INTERVAL_MS = config.YIELD_INTERVAL_MIN * 60 * 1000
