import axios from 'axios';
import { errorHandler } from './index';

let _client = axios.create();
let _slow = false;

// Response interceptor for handling errors
_client.interceptors.response.use(response => response, errorHandler);

export function config({
  host = undefined as string | undefined,
  token = undefined as string | undefined,
  impersonateUser = undefined as {id: string} | undefined,
  goSlow = undefined as boolean | undefined
}) {
  if (host !== undefined) {
    _client = axios.create({ baseURL: host });
  }
  if (token !== undefined) {
    _client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  if (impersonateUser !== undefined) {
    _client.defaults.headers.common['X-Impersonate-User'] = impersonateUser;
  }
  if (goSlow !== undefined) {
    _slow = goSlow;
  }
}

export function slow() { return _slow; }

export default function client() { return _client; }
