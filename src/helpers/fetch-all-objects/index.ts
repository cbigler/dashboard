import fetchAllPages from '../fetch-all-pages/index';
import objectSnakeToCamel from '../object-snake-to-camel/index';
import core from '../../client/core';
import { DensityDoorway } from '../../types';

const CACHE = {};

function generateCacheKey(method, url, params, body) {
  return `${method} ${url} ${JSON.stringify(params)} ${JSON.stringify(body)}`;
}

type FetchAllObjectsOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS',
  params: object,
  body: object,

  cache: boolean,
  cacheExpiryTimeMs: number,
}

export default async function fetchAllObjects<T = any>(url, options={}) {
  const opts: FetchAllObjectsOptions = {
    cache: true,
    cacheExpiryTimeMs: 5000,
    method: 'GET',
    params: {},
    body: {},
    ...options,
  };

  const cacheKey = generateCacheKey(opts.method, url, opts.params, opts.body);

  let responseData;
  if (opts.cache && CACHE[cacheKey]) {
    // Use cached value
    responseData = CACHE[cacheKey];
  } else {
    // Value not cached, make request and add to cache if cache should be used
    responseData = await fetchAllPages(async page => {
      const response = await core()[opts.method.toLowerCase()](
        url,
        {...opts.params, page, page_size: 5000},
        opts.body,
      );
      return response.data;
    });
    if (opts.cache) {
      CACHE[cacheKey] = responseData;

      // After the specified amount of time, remove this entry from the cache
      setTimeout(() => {
        delete CACHE[cacheKey];
      }, opts.cacheExpiryTimeMs);
    }
  }

  return responseData.map(i => objectSnakeToCamel<T>(i));
}

export async function fetchObject<T = any>(url, options={}) {
  const opts: FetchAllObjectsOptions = {
    cache: true,
    cacheExpiryTimeMs: 5000,
    method: 'GET',
    params: {},
    body: {},
    ...options,
  };

  const cacheKey = generateCacheKey(opts.method, url, opts.params, opts.body);

  let response;
  if (opts.cache && CACHE[cacheKey]) {
    // Use cached value
    response = CACHE[cacheKey];
  } else {
    // Value not cached, make request and add to cache if cache should be used
    response = await core()[opts.method.toLowerCase()](url, opts.params, opts.body);
    if (opts.cache) {
      CACHE[cacheKey] = response;

      // After the specified amount of time, remove this entry from the cache
      setTimeout(() => {
        delete CACHE[cacheKey];
      }, opts.cacheExpiryTimeMs);
    }
  }

  return objectSnakeToCamel<T>(response.data);
}
