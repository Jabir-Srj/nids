import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import './index.css'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'alerts', label: 'Alerts', icon: '🚨' },
    { id: 'packets', label: 'Packets', icon: '📦' },
    { id: 'geomap', label: 'GeoMap', icon: '🌍' },
    { id: 'network', label: 'Network', icon: '🔗' },
    { id: 'filters', label: 'Filters', icon: '🔍' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="text-2xl">🛡️</div>
            {sidebarOpen && <span className="font-bold text-lg">NIDS v3.0</span>}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              title={item.label}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-300 hover:bg-gray-700"
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold">
              {menuItems.find((item) => item.id === currentPage)?.label}
            </h1>
            <p className="text-gray-400 text-sm">Real-time Network Intrusion Detection</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">System Status</p>
              <p className="text-green-400 font-semibold">🟢 Online</p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          {currentPage === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Welcome to NIDS v3.0</h2>
              <p className="text-gray-400">Loading dashboard...</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Total Alerts', value: '0', icon: '🚨' },
                  { title: 'Critical', value: '0', icon: '🔴' },
                  { title: 'Blocked', value: '0', icon: '🛡️' },
                  { title: 'Uptime', value: '100%', icon: '✅' },
                ].map((card, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="text-4xl mb-2">{card.icon}</p>
                    <p className="text-gray-400 text-sm">{card.title}</p>
                    <p className="text-2xl font-bold mt-2">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentPage !== 'dashboard' && (
            <div className="text-center text-gray-400">
              <p className="text-xl">Page: {currentPage}</p>
              <p className="text-sm mt-2">Component loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
