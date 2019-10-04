import axios from 'axios';
import { errorHandler } from './index';

let _client = axios.create();

export function config(dispatch, {
  host = undefined as string | undefined,
  token = undefined as string | undefined,
  impersonateUser = undefined as string | undefined,
}) {
  if (host !== undefined) {
    _client = axios.create({ baseURL: host });
    _client.interceptors.response.use(
      response => response,
      error => errorHandler(dispatch, error)
    );
  }
  if (token !== undefined) {
    _client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  if (impersonateUser !== undefined) {
    if (impersonateUser) { _client.defaults.headers['X-Impersonate-User'] = impersonateUser; }
    else { delete _client.defaults.headers['X-Impersonate-User']; }
  }
}

export default function client() { return _client; }
