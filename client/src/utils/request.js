import axios from 'axios';
import { message } from 'antd';
import { authUtils } from './auth';
import { API_BASE_URL } from './constants';

// Create axios instance
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
request.interceptors.request.use(
  (config) => {
    // Add token to headers
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

// Response interceptor
request.interceptors.response.use(
  (response) => {
    const res = response.data;

    // If the custom code is not success, it is judged as an error
    if (!res.success) {
      message.error(res.message || 'Error');
      return Promise.reject(new Error(res.message || 'Error'));
    }

    return res;
  },
  (error) => {
    console.error('Response error:', error);

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          message.error('未授权，请重新登录');
          authUtils.clearAuth();
          window.location.href = '/login';
          break;
        case 403:
          message.error('拒绝访问');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error(data?.message || '请求失败');
      }
    } else if (error.request) {
      message.error('网络错误，请检查您的连接');
    } else {
      message.error('请求失败');
    }

    return Promise.reject(error);
  }
);

export default request;
