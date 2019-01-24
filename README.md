<img src="https://densityco.github.io/assets/images/dashboard-logo.4031835b.svg" height="50" /> <br />

[![CircleCI](https://circleci.com/gh/DensityCo/web-dashboard.svg?style=shield&circle-token=1b5ece9522df300da10bcedd91a24b6f066b9049)](https://circleci.com/gh/DensityCo/web-dashboard)
[![Dependency
Status](https://david-dm.org/densityco/nicss.svg)](https://david-dm.org/densityco/web-dashboard)
![License](https://img.shields.io/badge/License-MIT-green.svg)

Density is a modern infrastructure for counting people. The Dashboard is a tool on top of the software platform, exposing insights through live and trend data, and allowing you to manage your account and installs.

Density's core product is our API. While it is [thoroughly documented](http://docs.density.io), we're open sourcing our Dashboard as a guide to integrating our API and data into a tangible product; providing usage patterns that we're confident in.

The Dashboard depends on a couple of other in-house built dependencies:
- [`@density/charts`](https://github.com/densityco/charts) - an open-source library of visualizations and diagrams used by the Dashboard as well as other internal Density systems. [Here's a preview.](https://charts-preview.density.rodeo/d07e08dd8eb188c33d058dd96ceab9c0a7ac3abd/)
- [`@density/ui`](https://github.com/densityco/ui) - an open-source library of react-based ui components with html fallbacks. This is the ui toolkit we use throughout most of our Density tools. [Here's a preview.](https://ui-preview.density.rodeo/master/)
- [`@density/client`](https://github.com/densityco/client-js) - A javascript-based api client built using [clientele](https://github.com/DensityCo/clientele), an api client generator. This allows us to more clearly express the intent of an api call by using a syntax such as `api.spaces.get({id: 'spc_XXX'})` instead of a long ajax call.
- [`@density/conduit`](https://github.com/densityco/conduit) - A redux-based micro router for react applications.

We also have forked a couple open source npm packages and added density-specific changes - a few are `node-sass-json-importer` and `react-dates`.

## Getting Started
This project uses `create-react-app` to build the frontend code, and `npm` to manage dependencies.
```sh
# Verify you're running a node version >= 8
node -v
v8.11.1

# Download code
git clone git@github.com:densityco/dashboard.git
cd dashboard/

# Install dependencies
npm i

# Start it up!
npm start

# Run the tests
npm test
```

### Environment variables
None of these variables are required. They enable optional features that are useful in production.
- `REACT_APP_GA_TRACKING_CODE`: Optional google analytics tracking code for tracking metrics.
- `REACT_APP_MIXPANEL_TOKEN`: Optional mixpanel token for tracking user interactions.
- `REACT_APP_ENVIRONMENT`: Optional parameter to set which set of APIs to use (production vs staging). Used by CircleCi and in `src/index.js`.

### Configuring the dashboard to communicate with staging or local deveopment services (advanced)
The dashboard contains an interface for changing which servers it communicates with for logging in,
fetching data like spaces, doorways, or tokens, and sending logs to the telemetry system.

To open the environment switcher, press these keys in order: <code>!</code>, <code>!</code>,
<code>&#96;</code>, <code> </code>.

### Logging
Logs are periodically sent up to our telemetry servers for analysis and debugging purposes. However,
if you'd like to see logs in the javascript console for local debugging, read on.

The dashboard uses a package called [`debug`](https://npmjs.com/debug) to manage its logging. By
default, these logs are hidden. To show them, you'll need to set a flag in localStorage and reload
the page. This can be done by running something like this in the javascript console:
`localStorage.debug = 'density:*'; location.reload()`. To read more about the `density:*` syntax,
[read the `debug` documentation](https://www.npmjs.com/package/debug#wildcards)

## How would I add `<insert feature here>`?

### Adding a new page
In order to add a new page, create one of each of these:

- Create the new page with the `npm make-component`
  [utility](https://github.com/DensityCo/dashboard/tree/trunk/utilities):
```sh
dashboard/ $ npm run make-component
npm make-component v0.27.5
$ ./utilities/make-component
Let's make a new component.
Enter the name of your component, in dash-case: hello-world
* Copying template to components/hello-world...
* Replacing placeholders with variations of hello-world...
* Adding styles to central stylesheet...
You have a new component in src/components/hello-world:
* src/components/hello-world/index.js contains your component code.
* src/components/hello-world/_styles.scss contains your component styles.
* Press enter to open the documentation in your $EDITOR...
* Done.
dashboard/ $
```

- A new [route transition
  action](https://github.com/DensityCo/dashboard/tree/trunk/src/actions#route-transition-actions)
  which will be dispatched when the user navigates to the route. This conventionally should be a
  file in the `src/actions/route-transition` directory that looks something like this:
```javascript
export const ROUTE_TRANSITION_HELLO_WORLD = 'ROUTE_TRANSITION_HELLO_WORLD';

export default function routeTransitionHelloWorld(param) {
  return async dispatch => {
    // To start with, dispatch the route transition action.
    dispatch({ type: ROUTE_TRANSITION_HELLO_WORLD });

    // Then, perform any other asynchronous data fetching, calculation, or anything else you need in
    order to properly render the page. Once complete, dispatch this data in actions to cause a
    reducer to update (which will then cause your component to re-render.)
  }
}
```

- A new entry in the [active-page
  reducer](https://github.com/DensityCo/dashboard/blob/trunk/src/reducers/active-page/index.js).
  This reducer should react to the `ROUTE_TRANSITION_*` action and update its state to reflect the
  currently active page.
```
import { ROUTE_TRANSITION_HELLO_WORLD } from '../../actions/route-transitions/hello-world';

/* ... */

export default function activePage(state=initialState, action) {
  switch (action.type) {
  /* ... */
  case ROUTE_TRANSITION_HELLO_WORLD: /* track when the user navigates to the hello world page */
    return 'HELLO_WORLD';
  /* ... */
  }
}
```

- Add a new entry to the `ActivePage` component in
  [src/components/app/index.js](https://github.com/DensityCo/dashboard/blob/trunk/src/components/app/index.js)
  that maps the value set in the previous step (`"HELLO_WORLD"`) to the component to render for that
  page.
```javascript
import HelloWorld from '../hello-world/index';
/* ... */

function ActivePage({activePage, settings}) {
  switch (activePage) {
  /* ... */
  case "HELLO_WORLD":
    return <HelloWorld />;
  /* ... */
  }
}

/* ... */
```

- A new entry for the route on the router in `src/index.js`. The callback used as the second
  argument returns an action to dispatch (conventionally, this would be the [route transition
  action](https://github.com/DensityCo/dashboard/tree/trunk/src/actions#route-transition-actions)
  you created in the previous step) :
```javascript
import routeTransitionHelloWorld from '../../actions/route-transitions/hello-world';

/* ... */

router.addRoute('hello/world/:param', param => {
  return helloWorldRouteTransition(param);
});
```

To sum it up, here's what happens step-by-step when the user navigates to `#/hello/world/foo`:
- The callback in `router.addRoute` is fired, which returns a route transition action that is
  dispatched.
- The route transition dispatches the `ROUTE_TRANSITION_HELLO_WORLD` action, which causes the
  `activePage` reducer to be updated so that it now contains the value `"HELLO_WORLD"`
- The `ActivePage` component is rerendered, which uses the `"HELLO_WORLD"` value to know to render
  the `HelloWorld` component.
- The `HelloWorld` component is rendered.

## Note on undocumented APIs
Since this dashboard does a number of tasks other than just displaying spaces, it uses a number of
internal services that aren't mentioned in our [API documentation](http://docs.density.io). While
you can use the undocumented endpoints, we only support our documented endpoints and make no
guarantees on the long term stability or existance of our undocumented software.

## Core Concepts
- [**Actions**](src/actions/): [Redux actions](https://redux.js.org/basics/actions) and action creators - data payloads and functions (vanilla and thunks) that create actions.
- [**Reducers**](src/reducers/): [Redux reducers](https://redux.js.org/basics/reducers) - functions that update the state based on provided actions.
- [**Components**](src/components/): The hierarchy of modules that build the UI.
- [**Helpers**](src/helpers/): Pure, reusable functions.
- [**Utilities**](utilities/): Template-based code + directory structure generators for core concepts.

## Learning
Documentation is sprinkled throughout the project's modules, focused on usage and design patterns.

We'll be continuing to build out this documentation to aid developers interested in integrating Density into their product.

If there are any questions about implementation, design patterns, or clarification is desired on any
part of the dashboard codebase, don't hesitate to reach out by [creating an
issue](https://github.com/DensityCo/dashboard/issues/new) or [sending an email to our developers].
