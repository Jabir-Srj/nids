import { useState, Suspense, lazy } from 'react'
import { Menu, X, Shield, Bell, User, LogOut, ChevronDown } from 'lucide-react'
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
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all"
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
          <div className="w-12 h-12 rounded-full border-4 border-blue-200/30 border-t-blue-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-400">Loading component...</p>
      </div>
    </div>
  )
}

// Notification Badge
function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-red-600 to-red-700 rounded-full">
      {count > 9 ? '9+' : count}
    </span>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [alertCount] = useState(12)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', color: 'from-blue-500 to-blue-600' },
    { id: 'alerts', label: 'Alerts', icon: '🚨', color: 'from-red-500 to-red-600', count: alertCount },
    { id: 'packets', label: 'Packets', icon: '📦', color: 'from-purple-500 to-purple-600' },
    { id: 'rules', label: 'Rules', icon: '📋', color: 'from-green-500 to-green-600' },
    { id: 'threat-intel', label: 'Threat Intel', icon: '🎯', color: 'from-yellow-500 to-yellow-600' },
    { id: 'geomap', label: 'GeoMap', icon: '🌍', color: 'from-cyan-500 to-cyan-600' },
    { id: 'network', label: 'Network', icon: '🔗', color: 'from-indigo-500 to-indigo-600' },
    { id: 'filters', label: 'Filters', icon: '🔍', color: 'from-pink-500 to-pink-600' },
    { id: 'analytics', label: 'Analytics', icon: '📈', color: 'from-orange-500 to-orange-600' },
    { id: 'health', label: 'Health', icon: '💚', color: 'from-emerald-500 to-emerald-600' },
    { id: 'settings', label: 'Settings', icon: '⚙️', color: 'from-gray-500 to-gray-600' },
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

  const currentMenuItem = menuItems.find((item) => item.id === currentPage)

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-72' : 'w-24'
        } bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 flex flex-col shadow-2xl`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
              <Shield size={24} className="text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <p className="font-bold text-lg bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                  NIDS v3.0
                </p>
                <p className="text-xs text-gray-400">Network Protection</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentPage === item.id
                  ? `bg-gradient-to-r ${item.color} shadow-lg shadow-blue-500/20 text-white`
                  : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
              }`}
              title={item.label}
            >
              <span className={`text-xl transition-transform ${currentPage === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              {sidebarOpen && (
                <>
                  <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                  {item.count && item.count > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500/80 rounded-full">
                      {item.count}
                    </span>
                  )}
                </>
              )}
              {currentPage === item.id && sidebarOpen && (
                <div className="absolute right-2 w-1 h-6 bg-white rounded-full shadow-lg"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-700/50 backdrop-blur-sm space-y-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 text-gray-300 hover:text-white transition-all group"
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            {sidebarOpen ? (
              <>
                <ChevronDown size={18} className="group-hover:rotate-180 transition-transform" />
              </>
            ) : (
              <Menu size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-800/95 to-slate-700/95 backdrop-blur-xl border-b border-slate-700/50 px-8 py-5 flex items-center justify-between sticky top-0 z-40 shadow-xl">
          <div>
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-gradient-to-br ${currentMenuItem?.color} rounded-lg shadow-lg`}>
                <span className="text-2xl">{currentMenuItem?.icon}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{currentMenuItem?.label}</h1>
                <p className="text-sm text-gray-400">Real-time Network Intrusion Detection System</p>
              </div>
            </div>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center gap-6">
            {/* Notifications */}
            <button className="relative p-2 text-gray-300 hover:text-white transition-colors group">
              <div className="p-2.5 rounded-lg bg-slate-700/30 group-hover:bg-slate-700/50 transition-all">
                <Bell size={20} />
              </div>
              <NotificationBadge count={alertCount} />
            </button>

            {/* Status */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-medium text-emerald-400">System Online</span>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2.5 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 text-gray-300 hover:text-white transition-all flex items-center gap-2"
              >
                <User size={18} />
                <ChevronDown size={16} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl rounded-lg border border-slate-700/50 shadow-2xl overflow-hidden">
                  <div className="p-3 border-b border-slate-700/50">
                    <p className="text-sm font-medium">Jabir</p>
                    <p className="text-xs text-gray-400">Admin</p>
                  </div>
                  <button className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white transition-colors flex items-center gap-2">
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
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
