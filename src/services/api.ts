import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Define the base configuration for API
const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // 15 seconds
};

// Create axios instance with the configuration
const apiClient = axios.create(apiConfig);

// Request interceptor for adding auth token, etc.
apiClient.interceptors.request.use(
  (config) => {
    // You can add authorization token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const { response } = error;
    console.error('API response error:', {
      url: error.config?.url,
      status: response?.status,
      data: response?.data,
    });
    return Promise.reject(error);
  }
);

// Generic GET function
export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.get(url, config);
    return response.data;
  } catch (error) {
    console.error(`GET request failed for ${url}:`, error);
    throw error;
  }
};

// Generic POST function
export const post = async <T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.post(url, data, config);
    return response.data;
  } catch (error) {
    console.error(`POST request failed for ${url}:`, error);
    throw error;
  }
};

// Generic PUT function
export const put = async <T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.put(url, data, config);
    return response.data;
  } catch (error) {
    console.error(`PUT request failed for ${url}:`, error);
    throw error;
  }
};

// Generic DELETE function
export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient.delete(url, config);
    return response.data;
  } catch (error) {
    console.error(`DELETE request failed for ${url}:`, error);
    throw error;
  }
};

// Export the raw axios instance for advanced use cases
export default apiClient;