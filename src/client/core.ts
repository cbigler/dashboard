import axios from 'axios';
import { errorHandler } from './index';

let _client = axios.create();
let _slow = false;

export function config(dispatch, {
  host = undefined as string | undefined,
  token = undefined as string | undefined,
  impersonateUser = undefined as string | undefined,
  goSlow = undefined as boolean | undefined,
}) {
  if (host !== undefined) {
    _client = axios.create({ baseURL: host });
    _client.interceptors.response.use(
      response => response,
      error => errorHandler(dispatch, error)
    );
  }
  if (impersonateUser !== undefined) {
    if (impersonateUser) { _client.defaults.headers['X-Impersonate-User'] = impersonateUser; }
    else { delete _client.defaults.headers['X-Impersonate-User']; }
  }
  if (goSlow !== undefined) {
    _slow = goSlow;
  }
  if (token) {
    _client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

export function slow() { return _slow; }

export default function client() { return _client; }
