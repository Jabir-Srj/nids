// Helper to make API calls with fallback to mock data
import { mockAlerts, mockStats, mockRules, mockGeoData, mockNetworkTopology, mockPackets } from './mockData';
export async function fetchWithFallback(apiFn, fallbackData, dataExtractor = (r) => r.data) {
    try {
        const response = await apiFn();
        return dataExtractor(response);
    }
    catch (error) {
        console.warn('API call failed, using fallback data:', error);
        return fallbackData;
    }
}
export const mockDataMap = {
    alerts: mockAlerts,
    stats: mockStats,
    rules: mockRules,
    geoData: mockGeoData,
    networkTopology: mockNetworkTopology,
    packets: mockPackets,
};
export default fetchWithFallback;
//# sourceMappingURL=fetchWithFallback.js.map