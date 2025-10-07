import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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

interface JWTPayload {
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
    const token = response.data.token;
    const decoded = jwtDecode<JWTPayload>(token);
    return {
      token,
      user: decoded.user,
    };
  },
  
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    const token = response.data.token;
    const decoded = jwtDecode<JWTPayload>(token);
    return {
      token,
      user: decoded.user,
    };
  },
};

export interface Review {
  _id?: string;
  shopId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface ShopWithReviews extends ShopData {
  _id: string;
  owner: string;
  averageRating?: number;
  reviews?: Review[];
}

export const shopAPI = {
  getShops: async (location?: string, latitude?: number, longitude?: number) => {
    const params: any = {};
    if (location) params.location = location;
    if (latitude && longitude) {
      params.lat = latitude;
      params.lng = longitude;
    }
    const response = await api.get('/shop', { params });
    return response.data;
  },
  
  createShop: async (data: ShopData) => {
    const response = await api.post('/shop', data);
    return response.data;
  },

  updateShop: async (shopId: string, data: Partial<ShopData>) => {
    const response = await api.put(`/shop/${shopId}`, data);
    return response.data;
  },

  deleteShop: async (shopId: string) => {
    const response = await api.delete(`/shop/${shopId}`);
    return response.data;
  },

  getMyShop: async () => {
    const response = await api.get('/shop/my-shop');
    return response.data;
  },

  addProduct: async (shopId: string, product: Product) => {
    const response = await api.post(`/shop/${shopId}/products`, product);
    return response.data;
  },

  updateProduct: async (shopId: string, productId: string, product: Partial<Product>) => {
    const response = await api.put(`/shop/${shopId}/products/${productId}`, product);
    return response.data;
  },

  deleteProduct: async (shopId: string, productId: string) => {
    const response = await api.delete(`/shop/${shopId}/products/${productId}`);
    return response.data;
  },
};

export const reviewAPI = {
  getReviews: async (shopId: string) => {
    const response = await api.get(`/reviews/${shopId}`);
    return response.data;
  },

  addReview: async (data: Omit<Review, '_id' | 'createdAt'>) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  deleteReview: async (reviewId: string) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

export default api;
