# Action creators 

Action creators are located within `src/actions`. Use subfolders as required to nest hierarchically and
attempt to use the names `list`, `update`, `delete`, `read`, and `create` (CRUD) when possible.

Action names should be constants and be defined in the file with their action creator. If an action
has multiple action creators, they should be in the same file (ie, one file per action not action
creator).

Action names should be predictable. An action in `src/actions/foo/bar/baz.js` should have the name
`FOO_BAR_BAZ`.

In the case of a thunk (such as a data loading, or something else that happens in an async fashion),
it may make sense to `default`ly export the thunk and either provide the deferred action as a named
export or keep it private.

```
src/actions/
├── spaces
│   ├── count.js
│   ├── list.js
│   └── update.js
└── doorways
    ├── list.js
    └── update.js
```

## Route transition actions
When the user navigates to a new route, the application usually needs to perform some sort of
action, such as data fetching or some calculations. A special type of action, called a **route
transition**, allows custom code to run when a route is navigated to. Typically, these actions
present themselves as [thunks](https://redux.js.org/advanced/async-actions#async-action-creators),
though this is just a convention and these actions could very well be normal actions too.

A great example of this is the
[dev-token-list](https://github.com/DensityCo/dashboard/blob/trunk/src/actions/route-transition/dev-token-list.js)
route transition, which is called on the `dev/tokens` route, which can be [found near the bottom of
the index.js file in this project](https://github.com/DensityCo/dashboard/blob/trunk/src/index.js).
When the `dev-token-list` route transition is called, an ajax call is made to the accounts api to
get all tokens associated with a user account (this is the `accounts.tokens.list` function call).
On completion, the set action is dispatched that effects the tokens
[collection](https://github.com/DensityCo/dashboard/tree/trunk/src/reducers#collection-reducers),
which effectively updates the collection to contain the new tokens returned in the ajax call.
