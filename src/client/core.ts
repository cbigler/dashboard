import axios from 'axios';
import { errorHandler } from './index';

let _client = axios.create();
let _slow = false;

type CoreClientConfigOptions = {
  host?: string,
  token?: string,
  impersonateUser?: string,
  goSlow?: boolean
}

export function config(dispatch: Any<FixInRefactor>, options: CoreClientConfigOptions) {
  const {
    host,
    token,
    impersonateUser,
    goSlow,
  } = options;

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
