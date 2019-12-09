import { pathToRegexp } from 'path-to-regexp';
import createRouter, { RouteResolver } from './router';


describe('router', () => {
  describe('adding a route with no parameters', () => {
    const router = createRouter();
    const resolveRoute: RouteResolver = jest.fn();
    const route = router.addRoute('foo', resolveRoute);
    it('should return a valid route', () => {
      expect(route).toBeDefined();
    })
    expect(route.path).toBe('foo');
    expect(route.generate()).toBe('foo');
  })
  describe('adding a route with a parameter', () => {
    const router = createRouter();
    const resolver: RouteResolver = jest.fn();
    const route = router.addRoute('foo/:id', resolver);
    it('should return a valid route', () => {
      expect(route).toBeDefined();
    })
    it('should store the original path string', () => {
      expect(route.path).toBe('foo/:id');
    })
    it('should be able to realize a path given a value for the parameter', () => {
      expect(route.generate({id: '123'})).toBe('foo/123');
    })
  })
})