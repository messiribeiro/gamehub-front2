import axios from 'axios';

// Configuração base para o axios
const api = axios.create({
  baseURL: 'https://gamehub-back-706779899193.us-central1.run.app',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
