import axios, { AxiosInstance } from 'axios';
import { Alert, DashboardStats, AlertFilter, TimelinePoint } from '../types';

class APIService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Dashboard & Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get('/stats/overview');
    return response.data;
  }

  async getThreatStats() {
    const response = await this.client.get('/stats/threats');
    return response.data;
  }

  async getTopIPs() {
    const response = await this.client.get('/stats/ips');
    return response.data;
  }

  async getProtocolStats() {
    const response = await this.client.get('/stats/protocols');
    return response.data;
  }

  async getThreatTimeline(timeRange: string = '24h'): Promise<TimelinePoint[]> {
    const response = await this.client.get(`/stats/timeline?range=${timeRange}`);
    return response.data;
  }

  // Alerts CRUD
  async getAlerts(page: number = 1, limit: number = 20): Promise<any> {
    const response = await this.client.get('/alerts', {
      params: { page, limit },
    });
    return response.data;
  }

  async getAlertById(id: number): Promise<Alert> {
    const response = await this.client.get(`/alerts/${id}`);
    return response.data;
  }

  async filterAlerts(filters: AlertFilter): Promise<any> {
    const response = await this.client.post('/alerts/filter', filters);
    return response.data;
  }

  async deleteAlert(id: number): Promise<void> {
    await this.client.delete(`/alerts/${id}`);
  }

  async searchAlerts(query: string): Promise<Alert[]> {
    const response = await this.client.get('/alerts/search', {
      params: { q: query },
    });
    return response.data;
  }

  // Capture control
  async startCapture(interface_name: string): Promise<any> {
    const response = await this.client.post('/capture/start', {
      interface: interface_name,
    });
    return response.data;
  }

  async stopCapture(): Promise<any> {
    const response = await this.client.post('/capture/stop');
    return response.data;
  }

  async getCaptureStatus(): Promise<any> {
    const response = await this.client.get('/capture/status');
    return response.data;
  }

  async uploadPCAP(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/capture/upload-pcap', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Export
  async exportAlerts(format: 'json' | 'csv' | 'pdf'): Promise<Blob> {
    const response = await this.client.get(`/export/alerts?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async generateReport(): Promise<Blob> {
    const response = await this.client.get('/export/report', {
      responseType: 'blob',
    });
    return response.data;
  }

  // Health
  async getHealth(): Promise<any> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export default new APIService();
