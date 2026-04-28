import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

export const biasApi = {
  evaluate: (data) => api.post('/bias/evaluate', data).then(r => r.data),
  getSamplePairs: (category, limit) => api.get('/bias/sample-pairs', { params: { category, limit } }).then(r => r.data),
};

export const evaluationsApi = {
  list: () => api.get('/evaluations').then(r => r.data),
  get: (id) => api.get(`/evaluations/${id}`).then(r => r.data),
};
