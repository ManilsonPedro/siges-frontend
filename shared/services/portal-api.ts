import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Client Axios dedicado ao Portal do Cliente (FrontOffice) — usa chaves de
// localStorage distintas do sistema interno (dashboard/colaboradores),
// nunca partilha tokens com `shared/services/api.ts`.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const portalApi = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

portalApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("portal_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

portalApi.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("portal_refresh_token");
      if (refreshToken && !(error.config?.url || "").includes("/portal/auth/refresh")) {
        try {
          const { data } = await axios.post(`${API_URL}/api/v1/portal/auth/refresh`, {
            refresh_token: refreshToken,
          });
          localStorage.setItem("portal_access_token", data.access_token);
          localStorage.setItem("portal_refresh_token", data.refresh_token);
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${data.access_token}`;
            return portalApi.request(error.config);
          }
        } catch {
          localStorage.removeItem("portal_access_token");
          localStorage.removeItem("portal_refresh_token");
          window.location.href = "/portal/login";
        }
      } else {
        window.location.href = "/portal/login";
      }
    }
    return Promise.reject(error);
  }
);

export default portalApi;
