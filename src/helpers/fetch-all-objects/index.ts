import fetchAllPages from '../fetch-all-pages/index';
import objectSnakeToCamel from '../object-snake-to-camel/index';
import core from '../../client/core';

const CACHE = {};

function generateCacheKey(url, params, body) {
  return `${url} ${JSON.stringify(params)} ${JSON.stringify(body)}`;
}

type FetchAllObjectsOptions = {
  params?: object,
  body?: object,

  cache?: boolean,
  cacheExpiryTimeMs?: number,
}

export default async function fetchAllObjects<T = any>(
  url,
  options: FetchAllObjectsOptions = {}
): Promise<Array<T>> {
  const opts: FetchAllObjectsOptions = {
    cache: true,
    cacheExpiryTimeMs: 5000,
    params: {},
    body: {},
    ...options,
  };

  const cacheKey = generateCacheKey(url, opts.params, opts.body);

  let responseData;
  if (opts.cache && CACHE[cacheKey]) {
    // Use cached value
    responseData = CACHE[cacheKey];
  } else {
    // Value not cached, make request and add to cache if cache should be used
    responseData = await fetchAllPages(async page => {
      const response = await core().get(url, {
        params: { ...opts.params, page, page_size: 5000 }
      });
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

  return responseData.map(i => typeof i === 'object' ? objectSnakeToCamel<T>(i) : i);
}

export async function fetchObject<T = any>(
  url,
  options: FetchAllObjectsOptions = {}
): Promise<T>  {
  const opts: FetchAllObjectsOptions = {
    cache: true,
    cacheExpiryTimeMs: 5000,
    params: {},
    body: {},
    ...options,
  };

  const cacheKey = generateCacheKey(url, opts.params, opts.body);

  let response;
  if (opts.cache && CACHE[cacheKey]) {
    // Use cached value
    response = CACHE[cacheKey];
  } else {
    // Value not cached, make request and add to cache if cache should be used
    response = await core().get(url, { params: opts.params });
    if (opts.cache) {
      CACHE[cacheKey] = response;

      // After the specified amount of time, remove this entry from the cache
      setTimeout(() => {
        delete CACHE[cacheKey];
      }, opts.cacheExpiryTimeMs);
    }
  }

  return typeof response.data === 'object' ? objectSnakeToCamel<T>(response.data) : response.data;
}
