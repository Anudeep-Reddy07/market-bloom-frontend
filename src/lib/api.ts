import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export interface SignupData {
  name: string;
  email: string;
  password: string;
  userType: 'buyer' | 'seller';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Product {
  name: string;
  price: number;
  category: string;
}

export interface ShopData {
  shopName: string;
  location: string;
  products: Product[];
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    userType: 'buyer' | 'seller';
  };
}

export const authAPI = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },
  
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};

export const shopAPI = {
  getShops: async () => {
    const response = await api.get('/shop');
    return response.data;
  },
  
  createShop: async (data: ShopData) => {
    const response = await api.post('/shop', data);
    return response.data;
  },
};

export default api;
