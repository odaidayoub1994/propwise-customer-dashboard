import axios from 'axios';
import { API_URL } from '@/config/env.config';

const fetcher = axios.create({
  baseURL: API_URL,
});

export default fetcher;
