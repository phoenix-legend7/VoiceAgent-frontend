import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 100000,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response);
    return Promise.reject(error);
  }
);

export const handleAxiosError = (msg: string, e: unknown) => {
  const error = e as AxiosError;
  
  // Handle different types of error response data
  let errorMessage = 'Unknown error occurred';
  
  if (error.response?.data) {
    const data = error.response.data;
    
    // Check if data has a detail property (common API error format)
    if (typeof data === 'object' && data !== null && 'detail' in data) {
      const error = (data as { detail: string | Array<any> }).detail;
      if (typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      } else {
        errorMessage = error;
      }
    } 
    // Check if data is a string
    else if (typeof data === 'string') {
      errorMessage = data;
    }
    // Check if data has a message property
    else if (typeof data === 'object' && data !== null && 'message' in data) {
      errorMessage = (data as { message: string }).message;
    }
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  toast.error(`${msg}: ${errorMessage}`);
}

export default axiosInstance;
