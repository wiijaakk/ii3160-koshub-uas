import axios from 'axios';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Accommodation,
  Booking,
  CreateBookingData,
  LaundryService,
  CreateLaundryData,
  CateringOrder,
  CreateCateringData,
  CateringMenu,
  Notification,
} from '../types';
import { UUID } from 'crypto';

// API Base URLs
const ACCOMMODATION_API = process.env.NEXT_PUBLIC_ACCOMMODATION_API || 'http://localhost:3000';
const LIVING_SUPPORT_API = process.env.NEXT_PUBLIC_LIVING_SUPPORT_API || 'http://localhost:3010';

// Create axios instances
const accommodationAxios = axios.create({
  baseURL: ACCOMMODATION_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

const livingSupportAxios = axios.create({
  baseURL: LIVING_SUPPORT_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptors to add auth token
const addAuthInterceptor = (apiInstance: any) => {
  apiInstance.interceptors.request.use(
    (config: any) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('API Request:', config.method?.toUpperCase(), config.url, config.headers);
      return config;
    },
    (error: any) => {
      console.error('Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  apiInstance.interceptors.response.use(
    (response: any) => {
      console.log('API Response:', response.status, response.config.url, response.data);
      return response;
    },
    (error: any) => {
      console.log('FULL ERROR OBJECT:', error.response);
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
      return Promise.reject(error);
    }
  );
};

addAuthInterceptor(accommodationAxios);
addAuthInterceptor(livingSupportAxios);

// ============= Authentication API =============
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await accommodationAxios.post('/auth/login', credentials);
    // Transform backend response to expected format
    if (data.session && data.session.access_token) {
      return {
        access_token: data.session.access_token,
        expires_in: data.session.expires_in || 3600,
        user: data.session.user,
      };
    }
    return data;
  },

  register: async (registerData: RegisterData): Promise<AuthResponse> => {
    const { data } = await accommodationAxios.post('/auth/register', registerData);
    // Transform backend response to expected format
    if (data.session && data.session.access_token) {
      return {
        access_token: data.session.access_token,
        expires_in: data.session.expires_in || 3600,
        user: data.session.user,
      };
    }
    return data;
  },

  changePassword: async (newPassword: string): Promise<{ message: string }> => {
    const { data } = await accommodationAxios.put('/auth/change-password', {
      new_password: newPassword,
    });
    return data;
  },
};

// ============= User API =============
export const userApi = {
  getById: async (userId: UUID): Promise<User> => {
    const { data } = await accommodationAxios.get(`/users/${userId}`);
    return data;
  },
};

// ============= Accommodation API =============
export const accommodationApi = {
  getAll: async (): Promise<Accommodation[]> => {
    const { data } = await accommodationAxios.get('/accommodations');
    return data;
  },

  getById: async (id: number): Promise<Accommodation> => {
    const { data } = await accommodationAxios.get(`/accommodations/${id}`);
    return data;
  },

  create: async (accommodation: Omit<Accommodation, 'accommodation_id'>): Promise<Accommodation> => {
    const { data } = await accommodationAxios.post('/accommodations', accommodation);
    return data;
  },

  update: async (id: number, accommodation: Partial<Accommodation>): Promise<Accommodation> => {
    const { data } = await accommodationAxios.put(`/accommodations/${id}`, accommodation);
    return data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const { data } = await accommodationAxios.delete(`/accommodations/${id}`);
    return data;
  },
};

export const bookingApi = {
  getAll: async (): Promise<Booking[]> => {
    const { data } = await accommodationAxios.get('/bookings');
    return data;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    const { data } = await accommodationAxios.get('/bookings');
    return data;
  },

  getById: async (id: UUID): Promise<Booking> => {
    const { data } = await accommodationAxios.get(`/bookings/${id}`);
    return data;
  },

  create: async (bookingData: CreateBookingData): Promise<Booking> => {
    const { data } = await accommodationAxios.post('/bookings', bookingData);
    return data;
  },

  updateStatus: async (
    id: number,
    status: 'PENDING' | 'SUCCESS' | 'CANCELLED',
    accommodationId: number
  ): Promise<Booking> => {
    const { data } = await accommodationAxios.put(
      `/bookings/${id}`,
      { status, accommodation_id: accommodationId }
    );
    return data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const { data } = await accommodationAxios.delete(`/bookings/${id}`);
    return data;
  },
};

// ============= Laundry Service API =============
export const laundryApi = {
  getAll: async (): Promise<LaundryService[]> => {
    const { data } = await livingSupportAxios.get('/api/laundry');
    return data;
  },

  getById: async (id: number): Promise<LaundryService> => {
    const { data } = await livingSupportAxios.get(`/api/laundry/${id}`);
    return data;
  },

  createOrder: async (laundryData: CreateLaundryData & { booking_id: number } ): Promise<LaundryService> => {
    console.log('Creating laundry order with data:', laundryData);
    const { data } = await livingSupportAxios.post('/api/laundry', laundryData);
    return data;
  },

  create: async (laundryData: CreateLaundryData): Promise<LaundryService> => {
    const { data } = await livingSupportAxios.post('/api/laundry', laundryData);
    return data;
  },

  update: async (id: number, updateData: Partial<CreateLaundryData>): Promise<LaundryService> => {
    const { data } = await livingSupportAxios.put(`/api/laundry/${id}`, updateData);
    return data;
  },

  updateStatus: async (
    id: number,
    status: LaundryService['status'],
    delivery_date?: string,
    delivery_time?: string
  ): Promise<LaundryService> => {
    const { data } = await livingSupportAxios.put(`/api/laundry/${id}/status`, {
      status,
      delivery_date,
      delivery_time,
    });
    return data;
  },

  cancel: async (id: number): Promise<{ message: string }> => {
    const { data } = await livingSupportAxios.delete(`/api/laundry/${id}`);
    return data;
  },
};

// ============= Catering Service API =============
export const cateringApi = {
  getMenu: async (): Promise<CateringMenu> => {
    console.log('Fetching menu from:', LIVING_SUPPORT_API + '/api/catering/menu');
    const { data } = await livingSupportAxios.get('/api/catering/menu');
    console.log('Raw menu response:', data);
    // If backend returns { menu: {...} }, extract it
    const menu = data.menu || data;
    console.log('Extracted menu:', menu);
    return menu;
  },

  getAll: async (): Promise<CateringOrder[]> => {
    const { data } = await livingSupportAxios.get('/api/catering');
    return data;
  },

  getById: async (id: number): Promise<CateringOrder> => {
    const { data } = await livingSupportAxios.get(`/api/catering/${id}`);
    return data;
  },

  createOrder: async (cateringData: CreateCateringData & { booking_id: number }): Promise<CateringOrder> => {
    const { data } = await livingSupportAxios.post('/api/catering', cateringData);
    return data;
  },

  create: async (cateringData: CreateCateringData): Promise<CateringOrder> => {
    const { data } = await livingSupportAxios.post('/api/catering', cateringData);
    return data;
  },

  update: async (id: number, updateData: Partial<CreateCateringData>): Promise<CateringOrder> => {
    const { data } = await livingSupportAxios.put(`/api/catering/${id}`, updateData);
    return data;
  },

  updateStatus: async (id: number, status: CateringOrder['status']): Promise<CateringOrder> => {
    const { data } = await livingSupportAxios.put(`/api/catering/${id}/status`, { status });
    return data;
  },

  cancel: async (id: number): Promise<{ message: string }> => {
    const { data } = await livingSupportAxios.delete(`/api/catering/${id}`);
    return data;
  },
};

export const notificationApi = {
  getAll: async (isRead?: boolean, limit = 50): Promise<Notification[]> => {
    const params: any = { limit };
    if (isRead !== undefined) {
      params.is_read = isRead;
    }
    const { data } = await livingSupportAxios.get('/api/notifications', { params });
    return data;
  },

  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const { data } = await livingSupportAxios.get('/api/notifications/unread-count');
    return data;
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const { data } = await livingSupportAxios.put(`/api/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    const { data } = await livingSupportAxios.put('/api/notifications/read-all');
    return data;
  },
};
