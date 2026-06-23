import axios from 'axios'
import { jwtDecode } from "jwt-decode";

const apiUrl = import.meta.env.VITE_API_URL;

const axiosRaw = axios.create({ baseURL: apiUrl });

const api = axios.create({
    baseURL: apiUrl,
});

let isRefreshing = false;
let failedQueue = [];
let refreshTimeout = null;

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

const scheduleRefresh = (decoded) => {
    if (refreshTimeout) clearTimeout(refreshTimeout);
    const expiresIn = decoded.exp - Date.now() / 1000;
    const refreshAt = Math.max((expiresIn - 60) * 1000, 0);
    refreshTimeout = setTimeout(() => tryRefresh(), refreshAt);
};

const tryRefresh = async () => {
    const refreshToken = localStorage.getItem('refresh');
    if (!refreshToken) {
        logout();
        return null;
    }

    try {
        const res = await axiosRaw.post("api/token/refresh/", { refresh: refreshToken });
        localStorage.setItem('access', res.data.access);
        if (res.data.refresh) {
            localStorage.setItem('refresh', res.data.refresh);
        }
        const decoded = jwtDecode(res.data.access);
        scheduleRefresh(decoded);
        return res.data.access;
    } catch {
        logout();
        return null;
    }
};

const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    if (refreshTimeout) clearTimeout(refreshTimeout);
    window.location.href = '/login';
};

api.interceptors.request.use(
    async (config) => {
        if (config.url?.includes('token/refresh')) {
            return config;
        }

        const token = localStorage.getItem('access');
        if (!token) return config;

        try {
            const decoded = jwtDecode(token);
            const now = Date.now() / 1000;

            if (decoded.exp < now) {
                if (!isRefreshing) {
                    isRefreshing = true;
                    const newToken = await tryRefresh();
                    isRefreshing = false;
                    processQueue(null, newToken);
                }

                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    config.headers.Authorization = `Bearer ${token}`;
                    return config;
                });
            }

            scheduleRefresh(decoded);
            config.headers.Authorization = `Bearer ${token}`;
        } catch {
            // Invalid token — let it through, response interceptor will handle 401
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (originalRequest.url?.includes('token/refresh')) {
            logout();
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (!isRefreshing) {
            isRefreshing = true;
            const newToken = await tryRefresh();
            isRefreshing = false;
            processQueue(null, newToken);
        }

        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
        });
    }
);

export default api
