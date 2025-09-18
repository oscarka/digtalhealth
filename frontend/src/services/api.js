import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('收到响应:', response.data);
    return response.data;
  },
  (error) => {
    console.error('API错误:', error);
    return Promise.reject(error);
  }
);

// API接口
export const healthAPI = {
  // 健康检查
  healthCheck: () => api.get('/health'),
  
  // 用户相关
  getUsers: () => api.get('/api/users'),
  getUser: (id) => api.get(`/api/users/${id}`),
  
  // 音频相关
  getAudioRecords: () => api.get('/api/audio'),
  getAudioRecord: (id) => api.get(`/api/audio/${id}`),
  uploadAudio: (formData) => api.post('/api/audio/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // 健康分析相关
  getHealthAnalyses: () => api.get('/api/analysis'),
  getHealthAnalysis: (id) => api.get(`/api/analysis/${id}`),
  startAnalysis: (audioId) => api.post('/api/analysis/start', { audio_id: audioId }),
  
  // 健康简历相关
  getHealthProfiles: () => api.get('/api/health-profile'),
  getHealthProfile: (id) => api.get(`/api/health-profile/${id}`),
  
  // 报告相关
  getReports: () => api.get('/api/reports'),
  getReport: (id) => api.get(`/api/reports/${id}`),
  generateReport: (planId) => api.post('/api/reports/generate', { plan_id: planId }),
  
  // 健康简历系统
  uploadAudioForResume: (file, userId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    return api.post('/api/health-resume/upload-audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getHealthResume: (userId) => api.get(`/api/health-resume/resume/${userId}`),
  addHealthEvent: (userId, eventData) => api.post(`/api/health-resume/resume/${userId}/add-event`, eventData),
  getResumeThemes: (userId) => api.get(`/api/health-resume/resume/${userId}/themes`),
  getThemeTimeline: (userId, theme) => api.get(`/api/health-resume/resume/${userId}/timeline/${theme}`),
  analyzeHealthResume: (userId, analysisType) => api.post(`/api/health-resume/resume/${userId}/analyze`, { analysis_type: analysisType }),
};

export default api;
