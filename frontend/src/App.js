import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, Suspense, lazy, useEffect } from 'react';
import { Menu, X, Shield, Bell, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import './index.css';
import React from 'react';
// Lazy load components
const DashboardV2 = lazy(() => import('./components/DashboardV2'));
const AlertList = lazy(() => import('./components/AlertList'));
const Analytics = lazy(() => import('./components/Analytics'));
const Settings = lazy(() => import('./components/Settings'));
const PacketInspector = lazy(() => import('./components/PacketInspector'));
const GeoMap = lazy(() => import('./components/GeoMap'));
const NetworkTopology = lazy(() => import('./components/NetworkTopology'));
const AdvancedFilters = lazy(() => import('./components/AdvancedFilters'));
const Rules = lazy(() => import('./components/Rules'));
const ThreatIntel = lazy(() => import('./components/ThreatIntel'));
const SystemHealth = lazy(() => import('./components/SystemHealth'));
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
            return (_jsxs("div", { className: "p-8 text-center", children: [_jsx("p", { className: "text-red-600 font-bold mb-4", children: "\u26A0\uFE0F Component Error" }), _jsx("p", { className: "text-gray-600 mb-4", children: this.state.error?.message }), _jsx("button", { onClick: () => this.setState({ hasError: false }), className: "px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all duration-200", children: "Retry" })] }));
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
    ];
    const renderContent = () => {
        switch (currentPage) {
            case 'dashboard':
                return _jsx(DashboardV2, {});
            case 'alerts':
                return _jsx(AlertList, {});
            case 'packets':
                return _jsx(PacketInspector, {});
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
                return _jsx(DashboardV2, {});
        }
    };
    const currentMenuItem = menuItems.find((item) => item.id === currentPage);
    return (_jsxs("div", { className: "flex h-screen bg-[#FAFAF8] text-[#1a1a1a] overflow-hidden", children: [_jsxs("div", { className: `${sidebarOpen ? 'w-64' : 'w-20'} border-r transition-all duration-300 flex flex-col`, style: {
                    backgroundColor: 'rgb(245, 243, 240)',
                    borderColor: 'rgb(229, 227, 224)',
                }, children: [_jsx("div", { className: "h-16 px-4 flex items-center border-b transition-colors duration-200", style: { borderColor: 'rgb(229, 227, 224)' }, children: _jsxs("div", { className: "flex items-center gap-3 w-full", children: [_jsx("div", { className: "flex items-center justify-center w-10 h-10 text-white rounded-lg shadow-md", style: { backgroundColor: '#d97706' }, children: _jsx(Shield, { size: 20, className: "font-bold" }) }), sidebarOpen && (_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "font-serif-display text-base font-bold", style: { color: '#1a1a1a' }, children: "NIDS v3.0" }), _jsx("p", { className: "text-xs truncate font-code", style: { color: '#6b6b6b' }, children: "Network Guard" })] }))] }) }), _jsx("nav", { className: "flex-1 p-2 space-y-1 overflow-y-auto", children: menuItems.map((item) => (_jsxs("button", { onClick: () => setCurrentPage(item.id), className: `w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${currentPage === item.id ? 'font-semibold shadow-sm' : ''}`, style: {
                                backgroundColor: currentPage === item.id
                                    ? 'rgba(217, 119, 6, 0.1)'
                                    : 'transparent',
                                color: currentPage === item.id ? '#d97706' : '#6b6b6b',
                            }, title: item.label, children: [_jsx("span", { className: "text-lg flex-shrink-0", children: item.icon }), sidebarOpen && (_jsx("div", { className: "flex-1 text-left min-w-0", children: _jsx("span", { className: "text-sm truncate", children: item.label }) })), sidebarOpen && item.hasCount && alertCount > 0 && (_jsx("span", { className: "flex-shrink-0 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white rounded-full shadow-sm animate-soft-pulse", style: { backgroundColor: '#f97316' }, children: alertCount > 99 ? '99+' : alertCount })), !sidebarOpen && item.hasCount && alertCount > 0 && (_jsx("div", { className: "absolute top-1 right-1 w-2.5 h-2.5 rounded-full shadow-md animate-soft-pulse", style: { backgroundColor: '#f97316' } }))] }, item.id))) }), _jsx("div", { className: "p-3 border-t transition-colors duration-200", style: { borderColor: 'rgb(229, 227, 224)' }, children: _jsx("button", { onClick: () => setSidebarOpen(!sidebarOpen), className: "w-full flex items-center justify-center p-2 rounded-md transition-all duration-200", style: {
                                color: '#6b6b6b',
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(217, 119, 6, 0.08)';
                                e.currentTarget.style.color = '#d97706';
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#6b6b6b';
                            }, title: sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar', children: sidebarOpen ? _jsx(X, { size: 18 }) : _jsx(Menu, { size: 18 }) }) })] }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsxs("div", { className: "h-16 border-b px-8 flex items-center justify-between flex-shrink-0 transition-colors duration-200", style: {
                            backgroundColor: 'rgb(245, 243, 240)',
                            borderColor: 'rgb(229, 227, 224)',
                        }, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-2xl", children: currentMenuItem?.icon }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-serif-display font-bold", style: { color: '#1a1a1a' }, children: currentMenuItem?.label }), _jsx("p", { className: "text-xs font-code", style: { color: '#6b6b6b' }, children: "Real-time Network Intrusion Detection" })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-md border", style: {
                                            backgroundColor: 'rgba(217, 119, 6, 0.08)',
                                            borderColor: 'rgba(217, 119, 6, 0.2)',
                                        }, children: [_jsx("div", { className: "w-2 h-2 rounded-full animate-soft-pulse", style: { backgroundColor: '#d97706' } }), _jsx("span", { className: "text-sm font-semibold font-code", style: { color: '#d97706' }, children: "Online" })] }), _jsxs("button", { className: "p-2 rounded-md transition-all duration-200", style: {
                                            color: '#6b6b6b',
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(217, 119, 6, 0.08)';
                                            e.currentTarget.style.color = '#d97706';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#6b6b6b';
                                        }, children: [_jsx(Bell, { size: 18 }), alertCount > 0 && (_jsx("div", { className: "absolute top-5 right-14 w-2 h-2 rounded-full animate-soft-pulse", style: { backgroundColor: '#f97316' } }))] }), _jsxs("div", { className: "relative", children: [_jsx("button", { onClick: () => setShowUserMenu(!showUserMenu), className: "p-2 rounded-md transition-all duration-200", style: {
                                                    color: '#6b6b6b',
                                                }, onMouseEnter: (e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(217, 119, 6, 0.08)';
                                                    e.currentTarget.style.color = '#d97706';
                                                }, onMouseLeave: (e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = '#6b6b6b';
                                                }, children: _jsx(User, { size: 18 }) }), showUserMenu && (_jsxs("div", { className: "absolute right-0 mt-2 w-48 rounded-lg border shadow-lg overflow-hidden z-50 animate-scale-in", style: {
                                                    backgroundColor: 'rgb(255, 255, 255)',
                                                    borderColor: 'rgb(229, 227, 224)',
                                                }, children: [_jsxs("div", { className: "p-3 border-b", style: {
                                                            backgroundColor: 'rgb(245, 243, 240)',
                                                            borderColor: 'rgb(229, 227, 224)',
                                                        }, children: [_jsx("p", { className: "text-sm font-semibold", style: { color: '#1a1a1a' }, children: "Jabir" }), _jsx("p", { className: "text-xs font-code", style: { color: '#6b6b6b' }, children: "Admin" })] }), _jsxs("button", { className: "w-full px-4 py-2 text-sm text-left transition-colors duration-200 flex items-center gap-2", style: {
                                                            color: '#2d2d2d',
                                                        }, onMouseEnter: (e) => {
                                                            e.currentTarget.style.backgroundColor = 'rgb(245, 243, 240)';
                                                        }, onMouseLeave: (e) => {
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                        }, children: [_jsx(SettingsIcon, { size: 16 }), "Profile Settings"] }), _jsxs("button", { className: "w-full px-4 py-2 text-sm text-left transition-colors duration-200 flex items-center gap-2 border-t", style: {
                                                            color: '#2d2d2d',
                                                            borderColor: 'rgb(229, 227, 224)',
                                                        }, onMouseEnter: (e) => {
                                                            e.currentTarget.style.backgroundColor = 'rgb(245, 243, 240)';
                                                        }, onMouseLeave: (e) => {
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                        }, children: [_jsx(LogOut, { size: 16 }), "Logout"] })] }))] })] })] }), _jsx("div", { className: "flex-1 overflow-auto p-8", style: { backgroundColor: '#FAFAF8' }, children: _jsx(ErrorBoundary, { children: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: renderContent() }) }) })] })] }));
}
export default App;
//# sourceMappingURL=App.js.map