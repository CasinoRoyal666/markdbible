import axios from 'axios'
import { jwtDecode } from "jwt-decode";

const apiUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: apiUrl,
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        // look for token in local storage
        const token = localStorage.getItem('access');

        if (token) {
            // check if expired
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
                console.log("Token Expired");
                //there will be logic for refreshing token but for now just delete an old for user redir. to login page
                localStorage.removeItem('access');
                window.location.href = '/login';
            } else {
                // if ok add Authorization header
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api