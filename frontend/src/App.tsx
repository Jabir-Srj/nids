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
    <div className="flex h-screen bg-[#FAFAF8] text-[#1a1a1a] overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } border-r transition-all duration-300 flex flex-col`}
        style={{
          backgroundColor: 'rgb(245, 243, 240)',
          borderColor: 'rgb(229, 227, 224)',
        }}
      >
        {/* Logo */}
        <div
          className="h-16 px-4 flex items-center border-b transition-colors duration-200"
          style={{ borderColor: 'rgb(229, 227, 224)' }}
        >
          <div className="flex items-center gap-3 w-full">
            <div
              className="flex items-center justify-center w-10 h-10 text-white rounded-lg shadow-md"
              style={{ backgroundColor: '#d97706' }}
            >
              <Shield size={20} className="font-bold" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="font-serif-display text-base font-bold" style={{ color: '#1a1a1a' }}>
                  NIDS v3.0
                </p>
                <p
                  className="text-xs truncate font-code"
                  style={{ color: '#6b6b6b' }}
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
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                currentPage === item.id ? 'font-semibold shadow-sm' : ''
              }`}
              style={{
                backgroundColor:
                  currentPage === item.id
                    ? 'rgba(217, 119, 6, 0.1)'
                    : 'transparent',
                color:
                  currentPage === item.id ? '#d97706' : '#6b6b6b',
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
                  className="flex-shrink-0 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white rounded-full shadow-sm animate-soft-pulse"
                  style={{ backgroundColor: '#f97316' }}
                >
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
              {!sidebarOpen && item.hasCount && alertCount > 0 && (
                <div
                  className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full shadow-md animate-soft-pulse"
                  style={{ backgroundColor: '#f97316' }}
                ></div>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div
          className="p-3 border-t transition-colors duration-200"
          style={{ borderColor: 'rgb(229, 227, 224)' }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-md transition-all duration-200"
            style={{
              color: '#6b6b6b',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(217, 119, 6, 0.08)';
              e.currentTarget.style.color = '#d97706';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b6b6b';
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
            backgroundColor: 'rgb(245, 243, 240)',
            borderColor: 'rgb(229, 227, 224)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentMenuItem?.icon}</span>
            <div>
              <h1
                className="text-lg font-serif-display font-bold"
                style={{ color: '#1a1a1a' }}
              >
                {currentMenuItem?.label}
              </h1>
              <p
                className="text-xs font-code"
                style={{ color: '#6b6b6b' }}
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
                backgroundColor: 'rgba(217, 119, 6, 0.08)',
                borderColor: 'rgba(217, 119, 6, 0.2)',
              }}
            >
              <div
                className="w-2 h-2 rounded-full animate-soft-pulse"
                style={{ backgroundColor: '#d97706' }}
              ></div>
              <span
                className="text-sm font-semibold font-code"
                style={{ color: '#d97706' }}
              >
                Online
              </span>
            </div>

            {/* Notifications */}
            <button
              className="p-2 rounded-md transition-all duration-200"
              style={{
                color: '#6b6b6b',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(217, 119, 6, 0.08)';
                e.currentTarget.style.color = '#d97706';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6b6b6b';
              }}
            >
              <Bell size={18} />
              {alertCount > 0 && (
                <div
                  className="absolute top-5 right-14 w-2 h-2 rounded-full animate-soft-pulse"
                  style={{ backgroundColor: '#f97316' }}
                ></div>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 rounded-md transition-all duration-200"
                style={{
                  color: '#6b6b6b',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(217, 119, 6, 0.08)';
                  e.currentTarget.style.color = '#d97706';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b6b6b';
                }}
              >
                <User size={18} />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-lg border shadow-lg overflow-hidden z-50 animate-scale-in"
                  style={{
                    backgroundColor: 'rgb(255, 255, 255)',
                    borderColor: 'rgb(229, 227, 224)',
                  }}
                >
                  <div
                    className="p-3 border-b"
                    style={{
                      backgroundColor: 'rgb(245, 243, 240)',
                      borderColor: 'rgb(229, 227, 224)',
                    }}
                  >
                    <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>
                      Jabir
                    </p>
                    <p className="text-xs font-code" style={{ color: '#6b6b6b' }}>
                      Admin
                    </p>
                  </div>
                  <button
                    className="w-full px-4 py-2 text-sm text-left transition-colors duration-200 flex items-center gap-2"
                    style={{
                      color: '#2d2d2d',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgb(245, 243, 240)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <SettingsIcon size={16} />
                    Profile Settings
                  </button>
                  <button
                    className="w-full px-4 py-2 text-sm text-left transition-colors duration-200 flex items-center gap-2 border-t"
                    style={{
                      color: '#2d2d2d',
                      borderColor: 'rgb(229, 227, 224)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgb(245, 243, 240)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
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
          style={{ backgroundColor: '#FAFAF8' }}
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
