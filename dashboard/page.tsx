export default function Dashboard() {
  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-4">SentinelScout Dashboard</h1>
      <p className="text-gray-600 mb-8">Autonomous Agent Status & Yield Performance</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-2">Portfolio Health (Zerion)</h2>
          <div className="h-40 bg-green-50 rounded flex items-center justify-center text-green-600">
            [Chart Placeholder]
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-2">Yield Performance (LPAgent)</h2>
          <div className="h-40 bg-blue-50 rounded flex items-center justify-center text-blue-600">
            [Chart Placeholder]
          </div>
        </div>
      </div>
    </div>
  );
}
