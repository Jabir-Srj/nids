import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const analyticsData = [
  { hour: '00:00', threats: 5, packets: 1200, accuracy: 94.2 },
  { hour: '01:00', threats: 8, packets: 1900, accuracy: 95.1 },
  { hour: '02:00', threats: 3, packets: 1600, accuracy: 96.3 },
  { hour: '03:00', threats: 12, packets: 2100, accuracy: 94.8 },
  { hour: '04:00', threats: 4, packets: 1800, accuracy: 97.2 },
  { hour: '05:00', threats: 15, packets: 2400, accuracy: 96.5 },
]

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Threat Trends */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4">Threat Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="hour" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#f3f4f6' }}
            />
            <Legend />
            <Bar dataKey="threats" fill="#ef4444" name="Threats Detected" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detection Accuracy */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4">ML Detection Accuracy</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="hour" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[90, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#f3f4f6' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 5 }}
              name="Accuracy (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Packet Analysis */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4">Packet Volume Analysis</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="hour" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#f3f4f6' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="packets"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 5 }}
              name="Packets (hundreds)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400">Average Accuracy</p>
          <p className="text-3xl font-bold mt-2">95.68%</p>
          <p className="text-xs text-green-400 mt-2">+1.2% this hour</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400">Total Threats Detected</p>
          <p className="text-3xl font-bold mt-2">47</p>
          <p className="text-xs text-red-400 mt-2">+3 since last hour</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400">Avg Packets/Hour</p>
          <p className="text-3xl font-bold mt-2">1,850</p>
          <p className="text-xs text-blue-400 mt-2">+145 vs yesterday</p>
        </div>
      </div>
    </div>
  )
}
