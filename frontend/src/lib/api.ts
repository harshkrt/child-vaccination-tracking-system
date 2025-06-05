import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_URL } from '../constants'; // Adjust the path if your constants file is elsewhere

// Define a type for your API error response structure if you have a consistent one
interface ApiErrorResponse {
  msg?: string; // From your backend, e.g., res.status(400).json({ msg: "Invalid Credentials" });
  message?: string; // Common alternative error message key
  // Add other potential error properties if your backend sends them
}

const api = axios.create({
  baseURL: API_URL, // e.g., http://localhost:5000/api if API_URL is /api
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // If you are using httpOnly cookies for tokens and backend is on different port/domain during dev
});

// Request Interceptor: To add the JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token'); // Or however you store your token
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    // Handle request error here
    console.error('Axios request error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: To handle global responses, like 401 for unauthorized
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Axios response error status:', error.response.status);
      console.error('Axios response error data:', error.response.data);

      if (error.response.status === 401) {
        // Handle Unauthorized Access (e.g., token expired or invalid)
        console.warn('Unauthorized access (401). Token might be invalid or expired.');
        // Clear the stored token and user info
        localStorage.removeItem('token');

        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {

          // Better approach: dispatch a custom event that a top-level component listens to
          const event = new CustomEvent('auth-unauthorized');
          window.dispatchEvent(event);
          console.log("Dispatched 'auth-unauthorized' event.");
        }
      } else if (error.response.status === 403) {
        // Handle Forbidden Access
        console.warn('Forbidden access (403). User does not have permission.');
      }

    } else if (error.request) {
      console.error('Axios no response error:', error.request);
      return Promise.reject(new Error("Network error: No response received from server. Please check your connection."));
    } else {
      console.error('Axios setup error:', error.message);
    }
    
    if (error.response && error.response.data) {
        const errorData = error.response.data;
        const message = errorData.msg || errorData.message || error.message;
        return Promise.reject(new Error(message));
    }

    return Promise.reject(error);
  }
);

export default api;