import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, Suspense, lazy, useEffect } from 'react';
import { Menu, X, Shield, Bell, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import './index.css';
import React from 'react';
// Lazy load components
const DashboardV2 = lazy(() => import('./components/DashboardV2'));
const DashboardV3 = lazy(() => import('./components/DashboardV3'));
const AlertList = lazy(() => import('./components/AlertList'));
const AlertsPanelV2 = lazy(() => import('./components/AlertsPanelV2'));
const Analytics = lazy(() => import('./components/Analytics'));
const Settings = lazy(() => import('./components/Settings'));
const PacketInspector = lazy(() => import('./components/PacketInspector'));
const GeoMap = lazy(() => import('./components/GeoMap'));
const NetworkTopology = lazy(() => import('./components/NetworkTopology'));
const NetworkTopologyV2 = lazy(() => import('./components/NetworkTopologyV2'));
const AdvancedFilters = lazy(() => import('./components/AdvancedFilters'));
const Rules = lazy(() => import('./components/Rules'));
const ThreatIntel = lazy(() => import('./components/ThreatIntel'));
const SystemHealth = lazy(() => import('./components/SystemHealth'));
const ThreatTimeline = lazy(() => import('./components/ThreatTimeline'));
// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Component Error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs("div", { className: "p-8 text-center", children: [_jsx("p", { style: { color: '#f97316' }, className: "font-bold mb-4", children: "\u26A0\uFE0F Component Error" }), _jsx("p", { style: { color: '#6b6b6b' }, className: "mb-4", children: this.state.error?.message }), _jsx("button", { onClick: () => this.setState({ hasError: false }), className: "px-4 py-2 text-white rounded-md font-semibold transition-all duration-200", style: {
                            backgroundColor: '#d97706',
                        }, onMouseEnter: (e) => {
                            e.currentTarget.style.backgroundColor = '#c46e0f';
                        }, onMouseLeave: (e) => {
                            e.currentTarget.style.backgroundColor = '#d97706';
                        }, children: "Retry" })] }));
        }
        return this.props.children;
    }
}
// Loading fallback
function LoadingSpinner() {
    return (_jsx("div", { className: "flex items-center justify-center h-96", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "inline-block", children: _jsxs("div", { className: "relative w-12 h-12", children: [_jsx("div", { className: "absolute inset-0 rounded-full opacity-20 animate-pulse", style: {
                                    backgroundColor: '#d97706',
                                } }), _jsx("div", { className: "absolute inset-1 rounded-full border-3 border-transparent border-t-[#d97706] border-r-[#f97316] animate-spin", style: { borderTopColor: '#d97706', borderRightColor: '#f97316' } })] }) }), _jsx("p", { className: "mt-4 font-code text-sm", style: { color: '#6b6b6b' }, children: "Initializing..." })] }) }));
}
function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [alertCount, setAlertCount] = useState(0);
    const [showUserMenu, setShowUserMenu] = useState(false);
    // Fetch real alert count
    useEffect(() => {
        const fetchAlertCount = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/alerts');
                if (response.ok) {
                    const data = await response.json();
                    const count = Array.isArray(data) ? data.length : data.alerts?.length || 0;
                    setAlertCount(count);
                }
            }
            catch (e) {
                console.log('Error fetching alerts:', e);
            }
        };
        fetchAlertCount();
        const interval = setInterval(fetchAlertCount, 10000); // Update every 10 seconds
        return () => clearInterval(interval);
    }, []);
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
    ];
    const renderContent = () => {
        switch (currentPage) {
            case 'dashboard':
                return _jsx(DashboardV3, {});
            case 'alerts-v2':
                return _jsx(AlertsPanelV2, {});
            case 'alerts':
                return _jsx(AlertList, {});
            case 'packets':
                return _jsx(PacketInspector, {});
            case 'timeline':
                return _jsx(ThreatTimeline, {});
            case 'network-v2':
                return _jsx(NetworkTopologyV2, {});
            case 'rules':
                return _jsx(Rules, {});
            case 'threat-intel':
                return _jsx(ThreatIntel, {});
            case 'geomap':
                return _jsx(GeoMap, {});
            case 'network':
                return _jsx(NetworkTopology, {});
            case 'filters':
                return _jsx(AdvancedFilters, {});
            case 'analytics':
                return _jsx(Analytics, {});
            case 'health':
                return _jsx(SystemHealth, {});
            case 'settings':
                return _jsx(Settings, {});
            default:
                return _jsx(DashboardV3, {});
        }
    };
    const currentMenuItem = menuItems.find((item) => item.id === currentPage);
    return (_jsxs("div", { className: "flex h-screen bg-cyber-dark text-white overflow-hidden", children: [_jsxs("div", { className: `${sidebarOpen ? 'w-64' : 'w-20'} border-r transition-all duration-300 flex flex-col`, style: {
                    backgroundColor: 'rgba(10, 14, 39, 0.8)',
                    borderColor: 'rgba(0, 217, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                }, children: [_jsx("div", { className: "h-16 px-4 flex items-center border-b transition-colors duration-200", style: { borderColor: 'rgba(0, 217, 255, 0.15)' }, children: _jsxs("div", { className: "flex items-center gap-3 w-full", children: [_jsx("div", { className: "flex items-center justify-center w-10 h-10 text-white rounded-lg", style: {
                                        backgroundColor: 'rgba(0, 217, 255, 0.2)',
                                        boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
                                    }, children: _jsx(Shield, { size: 20, className: "font-bold" }) }), sidebarOpen && (_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "font-bold text-base text-neon-cyan glow", children: "NIDS v3.0" }), _jsx("p", { className: "text-xs truncate font-mono", style: { color: '#9ca3af' }, children: "Network Guard" })] }))] }) }), _jsx("nav", { className: "flex-1 p-2 space-y-1 overflow-y-auto", children: menuItems.map((item) => (_jsxs("button", { onClick: () => setCurrentPage(item.id), className: `w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200`, style: {
                                backgroundColor: currentPage === item.id
                                    ? 'rgba(0, 217, 255, 0.15)'
                                    : 'transparent',
                                color: currentPage === item.id ? '#00D9FF' : '#9ca3af',
                            }, title: item.label, children: [_jsx("span", { className: "text-lg flex-shrink-0", children: item.icon }), sidebarOpen && (_jsx("div", { className: "flex-1 text-left min-w-0", children: _jsx("span", { className: "text-sm truncate", children: item.label }) })), sidebarOpen && item.hasCount && alertCount > 0 && (_jsx("span", { className: "flex-shrink-0 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white rounded-full animate-pulse-glow", style: { backgroundColor: '#FF006E' }, children: alertCount > 99 ? '99+' : alertCount })), !sidebarOpen && item.hasCount && alertCount > 0 && (_jsx("div", { className: "absolute top-1 right-1 w-2.5 h-2.5 rounded-full animate-pulse-glow", style: { backgroundColor: '#FF006E' } }))] }, item.id))) }), _jsx("div", { className: "p-3 border-t transition-colors duration-200", style: { borderColor: 'rgba(0, 217, 255, 0.15)' }, children: _jsx("button", { onClick: () => setSidebarOpen(!sidebarOpen), className: "w-full flex items-center justify-center p-2 rounded-md transition-all duration-200", style: {
                                color: '#9ca3af',
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)';
                                e.currentTarget.style.color = '#00D9FF';
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#9ca3af';
                            }, title: sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar', children: sidebarOpen ? _jsx(X, { size: 18 }) : _jsx(Menu, { size: 18 }) }) })] }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsxs("div", { className: "h-16 border-b px-8 flex items-center justify-between flex-shrink-0 transition-colors duration-200", style: {
                            backgroundColor: 'rgba(10, 14, 39, 0.8)',
                            borderColor: 'rgba(0, 217, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                        }, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-2xl", children: currentMenuItem?.icon }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-bold text-neon-cyan", children: currentMenuItem?.label }), _jsx("p", { className: "text-xs font-mono", style: { color: '#9ca3af' }, children: "Real-time Network Intrusion Detection" })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-md border", style: {
                                            backgroundColor: 'rgba(0, 217, 255, 0.1)',
                                            borderColor: 'rgba(0, 217, 255, 0.2)',
                                        }, children: [_jsx("div", { className: "w-2 h-2 rounded-full animate-pulse-glow", style: { backgroundColor: '#00D9FF' } }), _jsx("span", { className: "text-sm font-semibold font-mono", style: { color: '#00D9FF' }, children: "Online" })] }), _jsxs("button", { className: "p-2 rounded-md transition-all duration-200", style: {
                                            color: '#9ca3af',
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)';
                                            e.currentTarget.style.color = '#00D9FF';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#9ca3af';
                                        }, children: [_jsx(Bell, { size: 18 }), alertCount > 0 && (_jsx("div", { className: "absolute top-5 right-14 w-2 h-2 rounded-full animate-pulse-glow", style: { backgroundColor: '#FF006E' } }))] }), _jsxs("div", { className: "relative", children: [_jsx("button", { onClick: () => setShowUserMenu(!showUserMenu), className: "p-2 rounded-md transition-all duration-200", style: {
                                                    color: '#9ca3af',
                                                }, onMouseEnter: (e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)';
                                                    e.currentTarget.style.color = '#00D9FF';
                                                }, onMouseLeave: (e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = '#9ca3af';
                                                }, children: _jsx(User, { size: 18 }) }), showUserMenu && (_jsxs("div", { className: "absolute right-0 mt-2 w-48 rounded-lg border shadow-lg overflow-hidden z-50 animate-fade-scale", style: {
                                                    backgroundColor: 'rgba(10, 14, 39, 0.9)',
                                                    borderColor: 'rgba(0, 217, 255, 0.15)',
                                                    backdropFilter: 'blur(10px)',
                                                }, children: [_jsxs("div", { className: "p-3 border-b", style: {
                                                            backgroundColor: 'rgba(15, 25, 50, 0.5)',
                                                            borderColor: 'rgba(0, 217, 255, 0.15)',
                                                        }, children: [_jsx("p", { className: "text-sm font-semibold text-neon-cyan", children: "Jabir" }), _jsx("p", { className: "text-xs font-mono", style: { color: '#9ca3af' }, children: "Admin" })] }), _jsxs("button", { className: "w-full px-4 py-2 text-sm text-left transition-colors duration-200 flex items-center gap-2", style: {
                                                            color: '#e0e6ff',
                                                        }, onMouseEnter: (e) => {
                                                            e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)';
                                                        }, onMouseLeave: (e) => {
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                        }, children: [_jsx(SettingsIcon, { size: 16 }), "Profile Settings"] }), _jsxs("button", { className: "w-full px-4 py-2 text-sm text-left transition-colors duration-200 flex items-center gap-2 border-t", style: {
                                                            color: '#e0e6ff',
                                                            borderColor: 'rgba(0, 217, 255, 0.15)',
                                                        }, onMouseEnter: (e) => {
                                                            e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)';
                                                        }, onMouseLeave: (e) => {
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                        }, children: [_jsx(LogOut, { size: 16 }), "Logout"] })] }))] })] })] }), _jsx("div", { className: "flex-1 overflow-auto p-8", style: { backgroundColor: '#0a0e27' }, children: _jsx(ErrorBoundary, { children: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: renderContent() }) }) })] })] }));
}
export default App;
//# sourceMappingURL=App.js.map