import { startRiskLoop } from './agent/riskLoop';
import { startYieldLoop } from './agent/yieldLoop';

console.log('🚀 Starting SentinelScout Autonomous Agent...');

// Start the 15-minute Risk Monitoring Loop (Zerion)
startRiskLoop();

// Start the 60-minute Yield Optimization Loop (LPAgent)
startYieldLoop();
