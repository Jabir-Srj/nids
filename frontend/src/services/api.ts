import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const alertsAPI = {
  getAll: (limit = 50) => api.get(`/alerts?limit=${limit}`),
  getById: (id: string) => api.get(`/alerts/${id}`),
  create: (data: any) => api.post('/alerts', data),
  update: (id: string, data: any) => api.put(`/alerts/${id}`, data),
  delete: (id: string) => api.delete(`/alerts/${id}`),
  export: (format: 'json' | 'csv') => api.get(`/alerts/export/${format}`),
}

export const statsAPI = {
  overview: () => api.get('/stats/overview'),
  byTime: (hours = 24) => api.get(`/stats/by-time?hours=${hours}`),
  bySeverity: () => api.get('/stats/by-severity'),
  byThreatType: () => api.get('/stats/by-threat-type'),
  performance: () => api.get('/stats/performance'),
}

export const rulesAPI = {
  getAll: () => api.get('/rules'),
  getById: (id: string) => api.get(`/rules/${id}`),
  create: (data: any) => api.post('/rules', data),
  update: (id: string, data: any) => api.put(`/rules/${id}`, data),
  delete: (id: string) => api.delete(`/rules/${id}`),
  toggle: (id: string, enabled: boolean) => api.put(`/rules/${id}/toggle`, { enabled }),
}

export const captureAPI = {
  start: (interface_name?: string) => api.post('/capture/start', { interface_name }),
  stop: () => api.post('/capture/stop'),
  status: () => api.get('/capture/status'),
  interfaces: () => api.get('/capture/interfaces'),
  packets: (limit = 100) => api.get(`/capture/packets?limit=${limit}`),
}

export const mlAPI = {
  predict: (features: any) => api.post('/ml/predict', features),
  accuracy: () => api.get('/ml/accuracy'),
  status: () => api.get('/ml/status'),
}

export const healthAPI = {
  check: () => api.get('/health'),
}

export default api
