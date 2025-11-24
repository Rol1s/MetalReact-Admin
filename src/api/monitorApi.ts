import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.nikamet.pro/monitor';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления admin password
api.interceptors.request.use((config) => {
  const adminPassword = localStorage.getItem('admin_password');
  if (adminPassword) {
    config.headers['X-Admin-Password'] = adminPassword;
  }
  return config;
});

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      localStorage.removeItem('admin_password');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  telegram_id: number;
  username: string;
  first_name: string;
  last_name?: string;
  created_at: string;
  is_premium: boolean;
  premium_until?: string;
  is_banned: boolean;
  cards_count?: number;
  pins_count?: number;
}

export interface Pin {
  id: number;
  author_id: number;
  text: string;
  price: number;
  type: string;
  created_at: string;
  expires_at: string;
  is_blocked: boolean;
  views_count?: number;
  responses_count?: number;
}

export interface Card {
  id: number;
  author_id: number;
  length: number;
  metal_type: string;
  created_at: string;
}

export interface Service {
  name: string;
  status: string;
  port: number;
  cpu_percent?: number;
  memory_mb?: number;
  uptime_seconds?: number;
  response_time_ms?: number;
  running: boolean;
  priority: string;
}

export interface DashboardStats {
  total_users: number;
  premium_users: number;
  new_users_today: number;
  total_cards: number;
  total_pins: number;
  active_pins: number;
  total_responses: number;
  health_score: number;
}

// API Methods

// Auth
export const verifyPassword = (password: string) => {
  return api.post('/auth/verify', { password });
};

// Users
export const getUsers = (page: number, limit: number, filter?: string, search?: string) => {
  return api.get('/users', { params: { page, limit, filter, search } });
};

export const getUserDetails = (telegramId: number) => {
  return api.get(`/users/${telegramId}`);
};

export const grantPremium = (telegramId: number, days: number) => {
  return api.post(`/users/${telegramId}/premium`, null, { params: { days } });
};

export const revokePremium = (telegramId: number) => {
  return api.delete(`/users/${telegramId}/premium`);
};

export const banUser = (telegramId: number) => {
  return api.post(`/users/${telegramId}/ban`);
};

export const unbanUser = (telegramId: number) => {
  return api.delete(`/users/${telegramId}/ban`);
};

// Pins
export const getPins = (page: number, limit: number, status?: string, author?: number) => {
  return api.get('/pins', { params: { page, limit, status, author } });
};

export const getPinDetails = (pinId: number) => {
  return api.get(`/pins/${pinId}`);
};

export const updatePin = (pinId: number, data: { text?: string; price?: number; hours?: number }) => {
  return api.put(`/pins/${pinId}`, null, { params: data });
};

export const deletePin = (pinId: number) => {
  return api.delete(`/pins/${pinId}`);
};

export const extendPin = (pinId: number, hours: number) => {
  return api.post(`/pins/${pinId}/extend`, null, { params: { hours } });
};

export const blockPin = (pinId: number) => {
  return api.post(`/pins/${pinId}/block`);
};

export const unblockPin = (pinId: number) => {
  return api.delete(`/pins/${pinId}/block`);
};

export const getPinResponses = (pinId: number) => {
  return api.get(`/pins/${pinId}/responses`);
};

export const deleteResponse = (responseId: number) => {
  return api.delete(`/responses/${responseId}`);
};

// Cards
export const getCards = (page: number, limit: number, author?: number) => {
  return api.get('/cards', { params: { page, limit, author } });
};

export const getCardDetails = (cardId: number) => {
  return api.get(`/cards/${cardId}`);
};

export const deleteCard = (cardId: number) => {
  return api.delete(`/cards/${cardId}`);
};

// Services
export const getAllServices = () => {
  return api.get('/services');
};

export const restartService = (serviceName: string) => {
  return api.post(`/services/${serviceName}/restart`);
};

export const restartCriticalServices = () => {
  return api.post('/services/restart-critical');
};

// Analytics
export const getDashboardAnalytics = () => {
  return api.get<DashboardStats>('/analytics/dashboard');
};

export const getUsersGrowth = (period: string = '7d') => {
  return api.get('/analytics/users-growth', { params: { period } });
};

export const getTopUsers = (limit: number = 10) => {
  return api.get('/analytics/top-users', { params: { limit } });
};

// Logs
export const getUserActionLogs = (hours: number = 24, limit: number = 100) => {
  return api.get('/logs/user-actions', { params: { hours, limit } });
};

export const getParserActivityLogs = (hours: number = 24, limit: number = 100) => {
  return api.get('/logs/parser-activity', { params: { hours, limit } });
};

export default api;

