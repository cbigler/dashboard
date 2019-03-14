import axios from 'axios';
import { errorHandler } from './index';

let _client = axios.create();
let _slow = false;
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
  goSlow = undefined as boolean | undefined,
  store = undefined as any,
}) {
  if (host !== undefined) {
    _client = axios.create({ baseURL: host });
  }
  if (token !== undefined) {
    _client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  if (impersonateUser) {
    _client.defaults.headers['X-Impersonate-User'] = impersonateUser.id;
  } else {
    delete _client.defaults.headers['X-Impersonate-User'];
  }
  if (goSlow !== undefined) {
    _slow = goSlow;
  }
  if (store !== undefined) {
    _store = store;
  }
}

export function slow() { return _slow; }

export default function client() { return _client; }
