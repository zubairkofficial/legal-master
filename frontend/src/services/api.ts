import Helpers from "@/config/helpers";
import axios from "axios";
// Define Base API URL
const BASE_URL = Helpers.apiUrl || "https://api.example.com";

// Log the actual API URL for debugging
console.log('API is configured with BASE_URL:', BASE_URL);

// Create an Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from Zustand store or localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Making API request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default api;
