// ----------------------------------------------------------------------------
// Set the location of all microservices.
// Here's how it works:
// ----------------------------------------------------------------------------
//
// 1. All microservice names and cofigurations are defined in `fields`. `setServiceLocations` is
// called, passing the active environment names. By setting this initially before the react render
// happens, calls that happen before the render are able to take advantage of the custom
// environments that have been defined.
//
// 2. Developer opens the environment switcher modal, changes an environment variable, then clicks
// "ok". The `EnvironmentSwitcher` component's `onChange` is fired, which calls
// `setServiceLocations`. The locations of all the services update.
//

export default [
  {
    name: 'Core API',
    slug: 'core',
    defaults: {
      'production': 'https://api.density.io/v2',
      'staging': 'https://core-staging.density.io/v2',
      'local': 'http://localhost:8000/v2',
      'env (REACT_APP_CORE_API_URL)': process.env.REACT_APP_CORE_API_URL,
    },
    default: process.env.REACT_APP_ENVIRONMENT || 'production',
  },
  {
    name: 'Accounts API',
    slug: 'accounts',
    defaults: {
      'production': 'https://accounts.density.io/v1',
      'staging': 'https://accounts-staging.density.io/v1',
      'local': 'http://localhost:8001/v1',
      'env (REACT_APP_ACCOUNTS_API_URL)': process.env.REACT_APP_ACCOUNTS_API_URL,
    },
    default: process.env.REACT_APP_ENVIRONMENT || 'production',
  },
];
