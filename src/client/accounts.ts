import axios from 'axios';
import { errorHandler } from './index';

let _client = axios.create();
let _store = null;

// Response interceptor for handling errors
_client.interceptors.response.use(
  response => response,
  error => errorHandler(error, _store)
);

export function config({
  host = undefined as string | undefined,
  token = undefined as string | undefined,
  impersonateUser = undefined as {id: string} | undefined,
  store = undefined as any,
}) {
  if (host !== undefined) {
    _client = axios.create({ baseURL: host });
  }
  if (token !== undefined) {
    _client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  if (impersonateUser) {
    _client.defaults.headers.common['X-Impersonate-User'] = impersonateUser;
  } else {
    delete _client.defaults.headers.common['X-Impersonate-User'];
  }
  if (store !== undefined) {
    _store = store;
  }
}

export default function client() { return _client; }
