import axios from 'axios';
import { errorHandler } from './index';

let _client = axios.create();

type ErrorCollectorClientConfigOptions = {
  host?: string,
  token?: string,
}

export function config(dispatch: Any<FixInRefactor>, options: ErrorCollectorClientConfigOptions) {
  const { host, token } = options;

  if (host !== undefined) {
    _client = axios.create({ baseURL: host });
    _client.interceptors.response.use(
      response => response,
      error => errorHandler(dispatch, error)
    );
  }
  if (token) {
    _client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

export default function client() { return _client; }
