export interface Decision {
  type: 'risk' | 'yield'
  action: 'hold' | 'hedge' | 'migrate'
  risk?: number
  swap_percent?: number
  targetPool?: string
  expectedImprovement?: number
  reason: string
  txSignature?: string
  timestamp: string
}
