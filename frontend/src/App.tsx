import { useState, Suspense, lazy, useEffect } from 'react'
import { Menu, X, Shield, Bell, User, LogOut, Settings as SettingsIcon } from 'lucide-react'
import './index.css'
import React from 'react'

// Lazy load components
const DashboardV2 = lazy(() => import('./components/DashboardV2'))
const DashboardV3 = lazy(() => import('./components/DashboardV3'))
const AlertList = lazy(() => import('./components/AlertList'))
const AlertsPanelV2 = lazy(() => import('./components/AlertsPanelV2'))
const Analytics = lazy(() => import('./components/Analytics'))
const Settings = lazy(() => import('./components/Settings'))
const PacketInspector = lazy(() => import('./components/PacketInspector'))
const GeoMap = lazy(() => import('./components/GeoMap'))
const NetworkTopology = lazy(() => import('./components/NetworkTopology'))
const NetworkTopologyV2 = lazy(() => import('./components/NetworkTopologyV2'))
const AdvancedFilters = lazy(() => import('./components/AdvancedFilters'))
const Rules = lazy(() => import('./components/Rules'))
const ThreatIntel = lazy(() => import('./components/ThreatIntel'))
const SystemHealth = lazy(() => import('./components/SystemHealth'))
const ThreatTimeline = lazy(() => import('./components/ThreatTimeline'))

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
          <p style={{ color: '#f97316' }} className="font-bold mb-4">
            ⚠️ Component Error
          </p>
          <p style={{ color: '#6b6b6b' }} className="mb-4">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 text-white rounded-md font-semibold transition-all duration-200"
            style={{
              backgroundColor: '#d97706',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c46e0f';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#d97706';
            }}
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
            <div
              className="absolute inset-0 rounded-full opacity-20 animate-pulse"
              style={{
                backgroundColor: '#d97706',
              }}
            ></div>
            <div
              className="absolute inset-1 rounded-full border-3 border-transparent border-t-[#d97706] border-r-[#f97316] animate-spin"
              style={{ borderTopColor: '#d97706', borderRightColor: '#f97316' }}
            ></div>
          </div>
        </div>
        <p
          className="mt-4 font-code text-sm"
          style={{ color: '#6b6b6b' }}
        >
          Initializing...
        </p>
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
    { id: 'alerts-v2', label: 'Alerts', icon: '🚨', hasCount: true },
    { id: 'timeline', label: 'Threat Timeline', icon: '📅' },
    { id: 'network-v2', label: 'Network', icon: '🔗' },
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
        return <DashboardV3 />
      case 'alerts-v2':
        return <AlertsPanelV2 />
      case 'alerts':
        return <AlertList />
      case 'packets':
        return <PacketInspector />
      case 'timeline':
        return <ThreatTimeline />
      case 'network-v2':
        return <NetworkTopologyV2 />
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
        return <DashboardV3 />
    }
  }

  const currentMenuItem = menuItems.find((item) => item.id === currentPage)

  return (
    <div className="flex h-screen bg-cyber-dark text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } border-r transition-all duration-300 flex flex-col`}
        style={{
          backgroundColor: 'rgba(10, 14, 39, 0.8)',
          borderColor: 'rgba(0, 217, 255, 0.15)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Logo */}
        <div
          className="h-16 px-4 flex items-center border-b transition-colors duration-200"
          style={{ borderColor: 'rgba(0, 217, 255, 0.15)' }}
        >
          <div className="flex items-center gap-3 w-full">
            <div
              className="flex items-center justify-center w-10 h-10 text-white rounded-lg"
              style={{
                backgroundColor: 'rgba(0, 217, 255, 0.2)',
                boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
              }}
            >
              <Shield size={20} className="font-bold" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="font-bold text-base text-neon-cyan glow">NIDS v3.0</p>
                <p
                  className="text-xs truncate font-mono"
                  style={{ color: '#9ca3af' }}
                >
                  Network Guard
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200`}
              style={{
                backgroundColor:
                  currentPage === item.id
                    ? 'rgba(0, 217, 255, 0.15)'
                    : 'transparent',
                color:
                  currentPage === item.id ? '#00D9FF' : '#9ca3af',
              }}
              title={item.label}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <div className="flex-1 text-left min-w-0">
                  <span className="text-sm truncate">{item.label}</span>
                </div>
              )}
              {sidebarOpen && item.hasCount && alertCount > 0 && (
                <span
                  className="flex-shrink-0 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white rounded-full animate-pulse-glow"
                  style={{ backgroundColor: '#FF006E' }}
                >
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
              {!sidebarOpen && item.hasCount && alertCount > 0 && (
                <div
                  className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full animate-pulse-glow"
                  style={{ backgroundColor: '#FF006E' }}
                ></div>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div
          className="p-3 border-t transition-colors duration-200"
          style={{ borderColor: 'rgba(0, 217, 255, 0.15)' }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-md transition-all duration-200"
            style={{
              color: '#9ca3af',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)';
              e.currentTarget.style.color = '#00D9FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#9ca3af';
            }}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div
          className="h-16 border-b px-8 flex items-center justify-between flex-shrink-0 transition-colors duration-200"
          style={{
            backgroundColor: 'rgba(10, 14, 39, 0.8)',
            borderColor: 'rgba(0, 217, 255, 0.15)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentMenuItem?.icon}</span>
            <div>
              <h1 className="text-lg font-bold text-neon-cyan">
                {currentMenuItem?.label}
              </h1>
              <p
                className="text-xs font-mono"
                style={{ color: '#9ca3af' }}
              >
                Real-time Network Intrusion Detection
              </p>
            </div>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center gap-3">
            {/* Status */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border"
              style={{
                backgroundColor: 'rgba(0, 217, 255, 0.1)',
                borderColor: 'rgba(0, 217, 255, 0.2)',
              }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse-glow"
                style={{ backgroundColor: '#00D9FF' }}
              ></div>
              <span
                className="text-sm font-semibold font-mono"
                style={{ color: '#00D9FF' }}
              >
                Online
              </span>
            </div>

            {/* Notifications */}
            <button
              className="p-2 rounded-md transition-all duration-200"
              style={{
                color: '#9ca3af',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)';
                e.currentTarget.style.color = '#00D9FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              <Bell size={18} />
              {alertCount > 0 && (
                <div
                  className="absolute top-5 right-14 w-2 h-2 rounded-full animate-pulse-glow"
                  style={{ backgroundColor: '#FF006E' }}
                ></div>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 rounded-md transition-all duration-200"
                style={{
                  color: '#9ca3af',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)';
                  e.currentTarget.style.color = '#00D9FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                <User size={18} />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-lg border shadow-lg overflow-hidden z-50 animate-fade-scale"
                  style={{
                    backgroundColor: 'rgba(10, 14, 39, 0.9)',
                    borderColor: 'rgba(0, 217, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div
                    className="p-3 border-b"
                    style={{
                      backgroundColor: 'rgba(15, 25, 50, 0.5)',
                      borderColor: 'rgba(0, 217, 255, 0.15)',
                    }}
                  >
                    <p className="text-sm font-semibold text-neon-cyan">Jabir</p>
                    <p className="text-xs font-mono" style={{ color: '#9ca3af' }}>
                      Admin
                    </p>
                  </div>
                  <button
                    className="w-full px-4 py-2 text-sm text-left transition-colors duration-200 flex items-center gap-2"
                    style={{
                      color: '#e0e6ff',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as any).style.backgroundColor = 'rgba(0, 217, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as any).style.backgroundColor = 'transparent';
                    }}
                  >
                    <SettingsIcon size={16} />
                    Profile Settings
                  </button>
                  <button
                    className="w-full px-4 py-2 text-sm text-left transition-colors duration-200 flex items-center gap-2 border-t"
                    style={{
                      color: '#e0e6ff',
                      borderColor: 'rgba(0, 217, 255, 0.15)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as any).style.backgroundColor = 'rgba(0, 217, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as any).style.backgroundColor = 'transparent';
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div
          className="flex-1 overflow-auto p-8"
          style={{ backgroundColor: '#0a0e27' }}
        >
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>{renderContent()}</Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

export default App
