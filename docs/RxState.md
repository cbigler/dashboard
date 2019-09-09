# State management with RxJS

The dashboard is migrating to a state management pattern built on RxJS. There is a global stream of "actions" together with a number of "stores" (streams that update and emit application state in response to actions).

All of this stuff is typed, so the first thing to work on when building new state-management functionality is a set of types or interfaces.

## Interfaces

The `interfaces/` folder has modules that define the types of actions. In order to statically-typecheck your actions and their payloads, follow the conventions in this folder and define a union type for actions:

```TypeScript
// interfaces/foo.ts

import { DensityFoo } from "../types";

export enum FooActionTypes {
  FOO_LOAD = 'FOO_LOAD',
  FOO_PUSH = 'FOO_PUSH',
  ...
};

export type FooAction = {
  type: FooActionTypes.FOO_LOAD,
} | {
  type: FooActionTypes.FOO_PUSH,
  payload: DensityFoo,
};
```

If this is a new module, add this union type to the top-level `GlobalAction` union type in `interfaces/index.ts`:

```TypeScript
// interfaces/index.ts

export type GlobalAction =
  AlertAction |
  UserAction |
  FooAction;
```

## Actions

Components that dispatch actions can import the `useRxDispatch` hook, and call `dispatch` directly (or define a helper):

```TypeScript
// components/FooComponent.tsx

import React from 'react';
import { DensityFoo } from "../types";
import { FooActionTypes } from '../../interfaces/foo';
import useRxDispatch from '../../helpers/use-rx-dispatch';

export default function FooComponent({ foo }: { foo: DensityFoo }) {
  const dispatch = useRxDispatch();
  return (
    <button onClick={() => dispatch({ type: FooActionTypes.FOO_PUSH, payload: foo })}>
      Click Me!
    </button>
  );
}
```

For complex, reusable, and/or async dispatch, define helper functions in an `rx-actions/foo/` subfolder. These helpers should be passed `dispatch` as their first argument:

```TypeScript
// rx-actions/foo/create.ts

import fetchAllObjects from '../../helpers/fetch-all-objects';
import { DensityFoo } from '../../types';
import { DispatchType } from '../../interfaces';
import { FooActionTypes } from '../../interfaces/alerts';

export default async function fooRead(dispatch: DispatchType) {
  dispatch({ type: FooActionTypes.FOO_READ });
  try {
    const foos = await fetchAllObjects<DensityFoo>(`/v2/foos`);
    dispatch({ type: FooActionTypes.FOO_SET, foos });
  } catch (error) {
    dispatch({ type: FooActionTypes.FOO_ERROR, error });
  }
}
```

## Stores

All dispatched actions are emitted by a global action stream. All stores subscribe to this stream and update any state that they "own". Stores can respond to any action at all, and do not always have to be 1-1 with a group of actions.

The `createRxStore` function takes a type parameter for the store state type, an `initialState` argument of this type, and a reducer function. _NOTE: If the reducer function returns `undefined`, the store will not emit updated state_.

If a type parameter is provided, components will receive typed objects when they subscribe.

```TypeScript
// rx-stores/quux.ts

import { FooActionTypes } from '../interfaces/alerts';
import createRxStore from './index';

export interface QuuxState {
  status: 'LOADING' | 'COMPLETE' | 'ERROR',
  data: Array<DensityFoo>,
  error: any
}

const initialState: QuuxState = {
  status: 'LOADING',
  data: null,
  error: null,
};

export default createRxStore<QuuxState>(initialState, (state, action) => {
  switch (action.type) {
    case FooActionTypes.FOO_SET:
      return {
        ...state,
        status: 'COMPLETE',
        data: action.payload,
      };

    case FooActionTypes.FOO_ERROR:
      return {
        ...state,
        status: 'ERROR',
        error: action.payload
      };
  }
});
```

## Subscribe/Connect

Components that need to use store state can import the `useRxStore` hook, which subscribes to a StoreSubject on mount, and returns its current value. The component automatically re-renders when a new value is emitted:

```TypeScript
// components/BarComponent.tsx

import React from 'react';
import useRxStore from '../../helpers/use-rx-store';
import quuxStore from '../../rx-stores/quux';

export default function BarComponent() {
  const { data } = useRxStore(quuxStore);
  return (
    <ul>
      {data.map(foo => <li>{foo.name}</li>)}
    </ul>
  );
}
```

Components can define their own custom input streams with the `useRxObservable` hook. These streams can select, memoize, debounce, etc:

```TypeScript
// components/BazComponent.tsx

import React from 'react';
import { flatMap, distinctUntilChanged } from 'rxjs/operators';
import { useRxObservable } from '../../helpers/use-rx-store';
import quuxStore from '../../rx-stores/quux';

const statusSelector = state => state.status;
const statusStream = quuxStore.pipe(
  flatMap(statusSelector),
  distinctUntilChanged(),
);

export default function BazComponent() {
  const status = useRxObservable(statusStream, statusSelector(quuxStore.value));
  return <h1>{status}</h1>;
}
```

## Debugging

Set `localStorage.debug = 'rx:*';` in your browser console to see debug messages for dispatched actions and store updates. This will also include the `'rx:legacy-actions'` log-level which will print all Redux actions (see below).

To only see new actions, use `localStorage.debug = 'rx:action,rx:state,rx:info';`

## Interop with Redux

While we're still porting parts of the dashboard from Redux, all actions dispatched to Redux will also be emitted by the RxJS action stream. Conversely, all actions sent using the `useRxDispatch` hook will be sent to the Redux store.

There are a few caveats around "thunk actions" with this interoperability:

- First, thunk actions are not used in the new pattern and will be ignored by RxJS.
- As a consequence, thunk actions dispatched using `useRxDispatch` will not return values to the caller even if the call is awaited.
