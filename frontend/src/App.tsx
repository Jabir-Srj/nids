import { useState, Suspense, lazy } from 'react'
import { Menu, X } from 'lucide-react'
import './index.css'
import React from 'react'

// Lazy load components
const DashboardV2 = lazy(() => import('./components/DashboardV2'))
const AlertList = lazy(() => import('./components/AlertList'))
const Analytics = lazy(() => import('./components/Analytics'))
const Settings = lazy(() => import('./components/Settings'))
const PacketInspector = lazy(() => import('./components/PacketInspector'))
const GeoMap = lazy(() => import('./components/GeoMap'))
const NetworkTopology = lazy(() => import('./components/NetworkTopology'))
const AdvancedFilters = lazy(() => import('./components/AdvancedFilters'))
const Rules = lazy(() => import('./components/Rules'))
const ThreatIntel = lazy(() => import('./components/ThreatIntel'))
const SystemHealth = lazy(() => import('./components/SystemHealth'))

// Error Boundary Component
class ErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Component Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <p className="text-red-500 font-bold mb-4">⚠️ Component Error</p>
          <p className="text-gray-400 mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Loading fallback
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-blue-600 animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-400">Loading component...</p>
      </div>
    </div>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'alerts', label: 'Alerts', icon: '🚨' },
    { id: 'packets', label: 'Packets', icon: '📦' },
    { id: 'rules', label: 'Rules', icon: '📋' },
    { id: 'threat-intel', label: 'Threat Intel', icon: '🎯' },
    { id: 'geomap', label: 'GeoMap', icon: '🌍' },
    { id: 'network', label: 'Network', icon: '🔗' },
    { id: 'filters', label: 'Filters', icon: '🔍' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'health', label: 'Health', icon: '💚' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardV2 />
      case 'alerts':
        return <AlertList />
      case 'packets':
        return <PacketInspector />
      case 'rules':
        return <Rules />
      case 'threat-intel':
        return <ThreatIntel />
      case 'geomap':
        return <GeoMap />
      case 'network':
        return <NetworkTopology />
      case 'filters':
        return <AdvancedFilters />
      case 'analytics':
        return <Analytics />
      case 'health':
        return <SystemHealth />
      case 'settings':
        return <Settings />
      default:
        return <DashboardV2 />
    }
  }

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
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>{renderContent()}</Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

export default App
