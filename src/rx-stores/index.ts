import { Subject, BehaviorSubject } from 'rxjs';
import { GlobalAction } from '../types/rx-actions';

// Debug message helpers
import debug from 'debug';
const infoLog = debug('rx:info');
const storeLog = debug('rx:store');
const actionLog = debug('rx:action');
const legacyActionLog = debug('rx:legacy-action');

// StoreSubject is a BehaviorSubject that obfuscates the "value" accessor
export class StoreSubject<S> extends BehaviorSubject<S> {
  public imperativelyGetValue = () => {
    return super.getValue();
  };
  public getValue = () => {
    throw new Error(
      'You\'re trying to read the value of a StoreSubject directly. If you ' +
      'want to access this store\'s state, pipe and/or subscribe to it. If ' +
      'you really need to to access the state from imperative code, use the' +
      '`.imperativelyGetValue()` method.'
    );
  }
}

// LEGACY: "define rules that ... enforce a strict interface between existing
// and modern code so it [is] easy to understand their relationship"
// From https://slack.engineering/rebuilding-slack-on-the-desktop-308d6fe94ae4
let reduxStore;

// LEGACY: get the redux store as an observable that emits state updates
let rxStoreSubscriptionUnsubscribe;
export type ReduxState = Any<FixInRefactor>;
export let RxReduxStore = new StoreSubject<ReduxState>({});

// Global action stream for the dashboard
export const actions = new Subject<GlobalAction>();

// Reducer functions can return this symbol to skip updating
export const skipUpdate = Symbol('skipUpdate');

// Helper to create stores for this application
export default function createRxStore<T>(
  displayName: string,
  initialState: T,
  reducer: (state: T, action: GlobalAction) => T | typeof skipUpdate,
) {

  // StoreSubject is a special variant of an RxJS BehaviorSubject
  const store = new StoreSubject(initialState);

  // Subscribe to the global action stream
  actions.subscribe((action: GlobalAction) => {
    
    // Run the reducer function using the store's value and the next action
    const state = reducer(store.imperativelyGetValue(), action);

    // Tricky convention, skip update if state is a special symbol
    if (state !== skipUpdate) {
      storeLog(displayName, state);
      store.next(state);
    }
  });
  return store;
}

// Helper to dispatch (wrapped by useDispatch hook)
export function rxDispatch(action: GlobalAction) {
  // Don't dispatch thunks to RxJS
  if (typeof action === 'function') {
    infoLog('RxJS ignoring thunk action...', action);
  } else {
    actionLog(action.type, action);
    actions.next(action);
  }

  // LEGACY: dispatch every action to redux too
  if (reduxStore) {
    const reduxAction = { ...action, legacyReduxAction: true };
    reduxStore.dispatch(reduxAction as (GlobalAction & {legacyReduxAction: true}));
  }
}


// LEGACY: redux middleware to listen for "old" actions
// These might be thunks! But the .type property will be null
export function rxLegacyReduxMiddleware() {
  return next => action => {
    legacyActionLog(action.type, action);
    if (!action.legacyReduxAction) {
      actions.next(action);
    }
    return next(action);
  };
}

// LEGACY: save the redux store for interop
export function rxLegacyReduxSetStore(store) {
  if (rxStoreSubscriptionUnsubscribe) { rxStoreSubscriptionUnsubscribe(); }
  reduxStore = store;
  rxStoreSubscriptionUnsubscribe = reduxStore.subscribe(() => {
    RxReduxStore.next(reduxStore.getState());
  });
}
