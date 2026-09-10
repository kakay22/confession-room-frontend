import axios from "axios";

const api = axios.create({
    // baseURL: "http://127.0.0.1:8000/api/",
    baseURL: import.meta.env.VITE_API_URL,
});

// Add access token to every request
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("access");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Automatically refresh expired access tokens
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        // If access token expired
        if (
            error.response?.status === 401 &&
            !originalRequest?._retry &&
            !originalRequest?.url?.includes("auth/login/") &&
            !originalRequest?.url?.includes("auth/refresh/")
        ) {
            originalRequest._retry = true;

            const refreshToken =
                localStorage.getItem("refresh");

            if (!refreshToken) {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");

                window.location.href = "/login";

                return Promise.reject(error);
            }

            try {
                const response = await axios.post(
                    "http://127.0.0.1:8000/api/auth/refresh/",
                    {
                        refresh: refreshToken,
                    }
                );

                const newAccessToken =
                    response.data.access;

                localStorage.setItem(
                    "access",
                    newAccessToken
                );

                // Update Authorization header
                originalRequest.headers =
                    originalRequest.headers || {};

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                // Retry original request
                return api(originalRequest);

            } catch (refreshError) {
                console.error(
                    "TOKEN REFRESH FAILED:",
                    refreshError.response?.data ||
                        refreshError
                );

                localStorage.removeItem("access");
                localStorage.removeItem("refresh");

                window.location.href = "/login";

                return Promise.reject(
                    refreshError
                );
            }
        }

        return Promise.reject(error);
    }
);

export default api;