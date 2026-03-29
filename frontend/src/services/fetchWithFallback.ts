// Helper to make API calls with fallback to mock data

import { mockAlerts, mockStats, mockRules, mockGeoData, mockNetworkTopology, mockPackets } from './mockData'

export async function fetchWithFallback<T>(
  apiFn: () => Promise<any>,
  fallbackData: T,
  dataExtractor: (response: any) => T = (r) => r.data as T
): Promise<T> {
  try {
    const response = await apiFn()
    return dataExtractor(response)
  } catch (error) {
    console.warn('API call failed, using fallback data:', error)
    return fallbackData
  }
}

export const mockDataMap = {
  alerts: mockAlerts,
  stats: mockStats,
  rules: mockRules,
  geoData: mockGeoData,
  networkTopology: mockNetworkTopology,
  packets: mockPackets,
}

export default fetchWithFallback
