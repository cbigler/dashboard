import { Subject, BehaviorSubject } from 'rxjs';
import { GlobalAction } from '../types/rx-actions';

// Debug message helpers
import debug from 'debug';
const infoLog = debug('rx:info');
const storeLog = debug('rx:store');
const actionLog = debug('rx:action');

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

// Global action stream for the dashboard
export const actions = new Subject<GlobalAction>();

// Reducer functions can return this symbol to skip updating
export const skipUpdate = Symbol('skipUpdate');

export type Reducer<T, A> = (state: T, action: A) => T | typeof skipUpdate

// Helper to create stores for this application
export default function createRxStore<T>(
  displayName: string,
  initialState: T,
  reducer: Reducer<T, GlobalAction>,
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
}
