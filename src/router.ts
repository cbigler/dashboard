// Altered version of conduit
import pathToRegexp, { Path, PathFunction } from 'path-to-regexp';
import debounce from 'lodash/debounce';


export type RouteResolver = (...params: string[]) => Promise<void>

type Route = {
  path: Path,
  regexp: RegExp,
  generate: PathFunction,
  resolve: RouteResolver,
}

// Create a router instance
export default function createRouter() {

  // Array of routes
  const routes: Route[] = [];

  function addRoute(path, resolve: RouteResolver) {
    const route: Route = {
      path: path,
      regexp: pathToRegexp(path),
      generate: pathToRegexp.compile(path),
      resolve,
    };
    routes.push(route);
    return route;
  }

  function checkPath(path: string) {
    return routes.reduce((acc: Route | null, next) => {
      return next.regexp.test(path) ? next : acc;
    }, null);
  }

  function navigate(path: string, params) {
    const route = checkPath(path);
    if (route) {
      window.location.hash = '/' + route.generate(params);
      return true;
    } else {
      console.warn('Path not found. Make sure it has been added with `addRoute()`');
      return false;
    }
  }

  async function handle() {
    const path = window.location.hash.slice(1).replace(/(^\/|\/$)/, '');
    const route = checkPath(path);
    if (route) {
      let params: string[];
      const parsedParams = route.regexp.exec(path);
      if (!parsedParams) {
        params = [];
      } else {
        params = parsedParams.slice(1);
      }
      try {
        await route.resolve(...params);
      } catch (err) {
        console.error('Failed to resolve route', err);
        return false;
      }
      return true;
    } else {
      console.warn('Route to ' + path + ' not found!');
      return false
    }
  }

  // Listen for hash changes
  window.addEventListener('hashchange', debounce(async function () {
    await handle();
  }, 250, {leading: true}));

  // Public API
  return {
    addRoute,
    handle,
    navigate,
  };
}
