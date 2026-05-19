import axios from 'axios';
import { message } from 'antd';
import { authUtils } from './auth';
import { API_BASE_URL } from './constants';

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const getErrorText = (data, fallback = '请求失败') => {
  if (!data) return fallback;

  const details = Array.isArray(data.errors) && data.errors.length > 0
    ? data.errors.join('; ')
    : '';

  return details ? `${data.message || fallback}: ${details}` : (data.message || fallback);
};

request.interceptors.request.use(
  (config) => {
    const token = authUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    const res = response.data;

    if (!res.success) {
      const errorText = getErrorText(res, 'Error');
      message.error(errorText);
      return Promise.reject(new Error(errorText));
    }

    return res;
  },
  (error) => {
    console.error('Response error:', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      requestData: error.config?.data,
      status: error.response?.status,
      responseData: error.response?.data
    });

    if (error.response) {
      const { status, data } = error.response;
      const errorText = getErrorText(data);

      if (status === 401) {
        message.error(errorText || '未授权，请重新登录');
        authUtils.clearAuth();
        window.location.href = '/login';
      } else {
        message.error(errorText);
      }
    } else if (error.request) {
      message.error('网络错误，请检查您的连接');
    } else {
      message.error(error.message || '请求失败');
    }

    return Promise.reject(error);
  }
);

export default request;
