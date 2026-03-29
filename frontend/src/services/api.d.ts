declare const api: import("axios").AxiosInstance;
export declare const alertsAPI: {
    getAll: (limit?: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getById: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (data: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: string, data: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    export: (format: "json" | "csv") => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const statsAPI: {
    overview: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    byTime: (hours?: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    bySeverity: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    byThreatType: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    performance: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const rulesAPI: {
    getAll: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getById: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (data: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: string, data: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    toggle: (id: string, enabled: boolean) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const captureAPI: {
    start: (interface_name?: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    stop: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    status: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    interfaces: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    packets: (limit?: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const mlAPI: {
    predict: (features: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    accuracy: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    status: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const healthAPI: {
    check: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export default api;
//# sourceMappingURL=api.d.ts.map