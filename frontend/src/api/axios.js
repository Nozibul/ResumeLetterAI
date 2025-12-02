/**
 * @file axios.js
 * @author Nozibul Islams
 */
import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Response interceptor (for error handling)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error
      return Promise.reject(error);
    } else if (error.request) {
        // Request made but no response
        error.message = 'Network error. Please check your connection.';
        return Promise.reject(error);
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

export default apiClient;