import { useState, Suspense, lazy, useEffect } from 'react'
import { Menu, X, Shield, Bell, User, LogOut, Settings as SettingsIcon } from 'lucide-react'
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
          <p className="text-red-600 font-bold mb-4">⚠️ Component Error</p>
          <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all duration-200"
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
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20 animate-pulse"></div>
            <div className="absolute inset-1 rounded-full border-3 border-transparent border-t-cyan-500 border-r-blue-500 animate-spin"></div>
          </div>
        </div>
        <p className="mt-4 text-slate-600 font-mono text-sm">Initializing...</p>
      </div>
    </div>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [alertCount, setAlertCount] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Fetch real alert count
  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/alerts')
        if (response.ok) {
          const data = await response.json()
          const count = Array.isArray(data) ? data.length : data.alerts?.length || 0
          setAlertCount(count)
        }
      } catch (e) {
        console.log('Error fetching alerts:', e)
      }
    }

    fetchAlertCount()
    const interval = setInterval(fetchAlertCount, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'alerts', label: 'Alerts', icon: '🚨', hasCount: true },
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

  const currentMenuItem = menuItems.find((item) => item.id === currentPage)

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } border-r border-slate-200 bg-white backdrop-blur-xl bg-opacity-95 transition-all duration-300 flex flex-col shadow-lg`}
      >
        {/* Logo */}
        <div className="h-16 px-4 flex items-center border-b border-slate-200">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg">
              <Shield size={20} className="font-bold" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="font-black text-sm truncate bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">NIDS v3.0</p>
                <p className="text-xs text-slate-500 truncate font-mono">Network Guard</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                currentPage === item.id
                  ? 'bg-gradient-to-r from-cyan-100 to-blue-100 text-slate-900 font-semibold shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={item.label}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <div className="flex-1 text-left min-w-0">
                  <span className="text-sm truncate">{item.label}</span>
                </div>
              )}
              {sidebarOpen && item.hasCount && alertCount > 0 && (
                <span className="flex-shrink-0 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-md animate-pulse">
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
              {!sidebarOpen && item.hasCount && alertCount > 0 && (
                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-lg animate-pulse"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="h-16 border-b border-slate-200 bg-white backdrop-blur-xl bg-opacity-95 px-8 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentMenuItem?.icon}</span>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{currentMenuItem?.label}</h1>
              <p className="text-xs text-slate-500 font-mono">Real-time Network Intrusion Detection</p>
            </div>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center gap-3">
            {/* Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse shadow-lg"></div>
              <span className="text-sm text-emerald-700 font-semibold font-mono">Online</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:shadow-md">
              <Bell size={18} />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-lg animate-pulse"></span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <User size={18} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden z-50 backdrop-blur-xl bg-opacity-95">
                  <div className="p-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                    <p className="text-sm font-bold text-slate-900">Jabir</p>
                    <p className="text-xs text-slate-500 font-mono">Admin</p>
                  </div>
                  <button className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
                    <SettingsIcon size={16} />
                    Profile Settings
                  </button>
                  <button className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 border-t border-slate-200">
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>{renderContent()}</Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

export default App
