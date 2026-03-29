import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader, Save } from 'lucide-react';
export default function AISettings() {
    const [providers, setProviders] = useState({});
    const [activeProvider, setActiveProvider] = useState('ollama');
    const [configStatus, setConfigStatus] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    // Form state
    const [formData, setFormData] = useState({
        api_key: '',
        base_url: 'http://localhost:11434',
        custom_url: 'https://your-api.com/v1/chat/completions',
    });
    // Fetch providers and config
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log('Fetching AI providers...');
                // Fetch available providers
                const providersRes = await fetch('http://localhost:5000/api/ai/providers');
                console.log('Providers response status:', providersRes.status);
                if (!providersRes.ok) {
                    throw new Error(`Provider fetch failed: ${providersRes.status}`);
                }
                const data = await providersRes.json();
                console.log('Providers data:', data);
                if (!data.providers) {
                    throw new Error('No providers in response');
                }
                setProviders(data.providers);
                setActiveProvider(data.active_provider || 'ollama');
                // Fetch current config
                const configRes = await fetch('http://localhost:5000/api/ai/config');
                console.log('Config response status:', configRes.status);
                if (configRes.ok) {
                    const config = await configRes.json();
                    console.log('Config data:', config);
                    setActiveProvider(config.active_provider || 'ollama');
                    const status = {};
                    if (config.providers) {
                        Object.entries(config.providers).forEach(([key, val]) => {
                            status[key] = val.configured;
                        });
                    }
                    setConfigStatus(status);
                }
                setLoading(false);
                setError(null);
            }
            catch (error) {
                console.error('Failed to fetch AI config:', error);
                setError(String(error));
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    const handleSaveConfig = async () => {
        try {
            const payload = {
                provider: activeProvider,
                config: {},
            };
            if (activeProvider === 'ollama') {
                payload.config.base_url = formData.base_url;
            }
            else if (activeProvider === 'lmstudio') {
                payload.config.base_url = formData.base_url;
            }
            else if (activeProvider === 'custom') {
                payload.config.base_url = formData.custom_url;
                payload.config.api_key = formData.api_key;
            }
            else {
                payload.config.api_key = formData.api_key;
            }
            const response = await fetch('http://localhost:5000/api/ai/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                setMessage({ type: 'success', text: `AI provider configured: ${activeProvider}` });
                setConfigStatus((prev) => ({ ...prev, [activeProvider]: true }));
                setTimeout(() => setMessage(null), 3000);
            }
            else {
                setMessage({ type: 'error', text: 'Failed to save configuration' });
            }
        }
        catch (error) {
            setMessage({ type: 'error', text: `Error: ${error}` });
        }
    };
    const checkHealth = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/ai/health');
            if (response.ok) {
                const data = await response.json();
                if (data.available) {
                    setMessage({ type: 'success', text: `${activeProvider} is connected!` });
                }
                else {
                    setMessage({ type: 'error', text: `${activeProvider} not configured` });
                }
                setTimeout(() => setMessage(null), 3000);
            }
        }
        catch (error) {
            setMessage({ type: 'error', text: `Connection check failed: ${error}` });
        }
    };
    if (error) {
        return (_jsxs("div", { className: "bg-red-900/20 border border-red-700 rounded-lg p-6 text-red-300", children: [_jsx(AlertCircle, { className: "w-6 h-6 mb-2" }), _jsx("p", { className: "font-semibold", children: "Error loading AI settings" }), _jsx("p", { className: "text-sm mt-2", children: error })] }));
    }
    if (loading) {
        return (_jsxs("div", { className: "bg-gray-800 rounded-lg p-8 text-center border border-gray-700", children: [_jsx(Loader, { className: "w-8 h-8 animate-spin mx-auto text-blue-400 mb-2" }), _jsx("p", { className: "text-gray-400", children: "Loading AI settings..." })] }));
    }
    const providerEntries = Object.entries(providers);
    console.log('Provider entries:', providerEntries);
    if (providerEntries.length === 0) {
        return (_jsxs("div", { className: "bg-yellow-900/20 border border-yellow-700 rounded-lg p-6 text-yellow-300", children: [_jsx(AlertCircle, { className: "w-6 h-6 mb-2" }), _jsx("p", { className: "font-semibold", children: "No AI providers available" }), _jsx("p", { className: "text-sm mt-2", children: "Backend may not be running or AI service failed to initialize" })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [message && (_jsxs("div", { className: `p-4 rounded-lg flex items-center gap-2 ${message.type === 'success'
                    ? 'bg-green-900/20 border border-green-700 text-green-300'
                    : 'bg-red-900/20 border border-red-700 text-red-300'}`, children: [message.type === 'success' ? (_jsx(CheckCircle, { className: "w-5 h-5" })) : (_jsx(AlertCircle, { className: "w-5 h-5" })), message.text] })), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsx("h2", { className: "text-lg font-bold mb-4", children: "\uD83E\uDD16 AI Provider Selection" }), _jsx("div", { className: "space-y-3", children: providerEntries.map(([key, provider]) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "radio", name: "provider", value: key, checked: activeProvider === key, onChange: () => setActiveProvider(key), className: "w-4 h-4" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: provider.name }), _jsxs("p", { className: "text-xs text-gray-400", children: ["Model: ", provider.model] })] })] }), _jsx("div", { className: "flex items-center gap-2", children: configStatus[key] ? (_jsxs("span", { className: "text-green-400 font-semibold flex items-center gap-1", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), "Configured"] })) : (_jsx("span", { className: "text-gray-400 text-sm", children: "Not configured" })) })] }, key))) })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [_jsxs("h2", { className: "text-lg font-bold mb-4", children: ["\u2699\uFE0F Configure: ", providers[activeProvider]?.name] }), activeProvider === 'ollama' ? (_jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 font-semibold mb-2", children: "Ollama Base URL" }), _jsx("input", { type: "text", value: formData.base_url, onChange: (e) => setFormData({ ...formData, base_url: e.target.value }), placeholder: "http://localhost:11434", className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4" }), _jsxs("p", { className: "text-xs text-gray-400 mb-4", children: ["Download Ollama from", ' ', _jsx("a", { href: "https://ollama.ai", target: "_blank", rel: "noopener noreferrer", className: "text-blue-400 hover:underline", children: "ollama.ai" })] })] })) : activeProvider === 'lmstudio' ? (_jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 font-semibold mb-2", children: "LM Studio Base URL" }), _jsx("input", { type: "text", value: formData.base_url, onChange: (e) => setFormData({ ...formData, base_url: e.target.value }), placeholder: "http://localhost:1234", className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4" }), _jsxs("p", { className: "text-xs text-gray-400 mb-4", children: ["Download LM Studio from", ' ', _jsx("a", { href: "https://lmstudio.ai", target: "_blank", rel: "noopener noreferrer", className: "text-blue-400 hover:underline", children: "lmstudio.ai" }), ". Make sure to enable local server in LM Studio settings."] })] })) : activeProvider === 'custom' ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 font-semibold mb-2", children: "API Endpoint URL" }), _jsx("input", { type: "text", value: formData.custom_url, onChange: (e) => setFormData({ ...formData, custom_url: e.target.value }), placeholder: "https://your-api.com/v1/chat/completions", className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "OpenAI-compatible endpoint URL" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 font-semibold mb-2", children: "API Key (Optional)" }), _jsx("input", { type: "password", value: formData.api_key, onChange: (e) => setFormData({ ...formData, api_key: e.target.value }), placeholder: "Optional API key for authentication", className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" })] })] })) : (_jsxs("div", { children: [_jsx("label", { className: "block text-gray-300 font-semibold mb-2", children: "API Key" }), _jsx("input", { type: "password", value: formData.api_key, onChange: (e) => setFormData({ ...formData, api_key: e.target.value }), placeholder: "Enter your API key", className: "w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4" })] })), _jsxs("div", { className: "flex gap-3 mt-4", children: [_jsxs("button", { onClick: handleSaveConfig, className: "flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors", children: [_jsx(Save, { className: "w-4 h-4" }), "Save Configuration"] }), _jsxs("button", { onClick: checkHealth, className: "flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), "Test Connection"] })] })] })] }));
}
//# sourceMappingURL=AISettings.js.map