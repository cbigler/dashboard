import { getActiveEnvironments, getGoSlow } from '../../components/environment-switcher/index';
import fields from '../../fields';

import { config as configCore } from '../../client/core';
import { config as configAccounts } from '../../client/accounts';

import { rxDispatch } from '../../rx-stores/index';



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
export function configureClients() {
  const goSlow = getGoSlow();
  const environments: any = getActiveEnvironments(fields);
  const token = localStorage.sessionToken !== undefined ?
    JSON.parse(localStorage.sessionToken) : null;
  const impersonateUser = localStorage.impersonate ?
    (JSON.parse(localStorage.impersonate).selectedUser || {}).id : null;
  configCore(rxDispatch, { host: environments.core, token, impersonateUser, goSlow });
  configAccounts(rxDispatch, { host: environments.accounts, token, impersonateUser });
}
