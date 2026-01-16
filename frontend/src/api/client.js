import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL, STORAGE_KEYS } from '../constants/config';

console.log('API Client initialized with URL:', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh for auth endpoints to prevent loops
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh-token');

    // If 401 and not already retried and not auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          // axios response.data = { success: true, data: { tokens: {...} } }
          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;

          await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Clear tokens and redirect to login
        await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCOUNT);

        // Will be handled by auth state in the app
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
