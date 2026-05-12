export class LiquidMindMemory {
  // Implementation: Eliza-style memory storage for sessions
  static async logDecision(decision: any) {
    console.log('🧠 Memory logged:', decision.reason);
  }
}
