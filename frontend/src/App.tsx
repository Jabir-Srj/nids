import { useState, Suspense, lazy, useEffect } from 'react'
import { Menu, X, Shield, Bell, User, LogOut, ChevronDown, Settings as SettingsIcon } from 'lucide-react'
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
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
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
          <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-black animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600">Loading...</p>
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
    <div className="flex h-screen bg-white text-gray-950 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } border-r border-gray-200 bg-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 px-4 flex items-center border-b border-gray-200">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-lg">
              <Shield size={20} />
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm truncate">NIDS v3.0</p>
                <p className="text-xs text-gray-500 truncate">Network Guard</p>
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
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-gray-100 text-gray-950 font-medium'
                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
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
                <span className="flex-shrink-0 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-white bg-red-600 rounded-full">
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
              {!sidebarOpen && item.hasCount && alertCount > 0 && (
                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="h-16 border-b border-gray-200 bg-white px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentMenuItem?.icon}</span>
            <div>
              <h1 className="text-lg font-semibold text-gray-950">{currentMenuItem?.label}</h1>
              <p className="text-xs text-gray-500">Real-time Network Intrusion Detection</p>
            </div>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center gap-4">
            {/* Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={18} />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 text-gray-600 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User size={18} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <p className="text-sm font-medium text-gray-950">Jabir</p>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                  <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <SettingsIcon size={16} />
                    Profile Settings
                  </button>
                  <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-200">
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>{renderContent()}</Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

export default App
