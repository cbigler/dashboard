import { Subject, BehaviorSubject } from 'rxjs';
import { GlobalAction } from '../interfaces';

// Debug message helpers
import debug from 'debug';
const infoLog = debug('rx:info');
const storeLog = debug('rx:store');
const actionLog = debug('rx:action');
const legacyActionLog = debug('rx:legacy-action');

// LEGACY: "define rules that ... enforce a strict interface between existing
// and modern code so it [is] easy to understand their relationship"
// From https://slack.engineering/rebuilding-slack-on-the-desktop-308d6fe94ae4
let reduxStore;

// Global action stream
export const actions = new Subject<GlobalAction>();

// Helper to create stores
export default function createRxStore<T>(
  initialState: T,
  reducer: (state: T, action: GlobalAction) => T | undefined,
  displayName: string = typeof initialState,
) {
  const store = new BehaviorSubject(initialState);
  actions.subscribe((action: GlobalAction) => {
    const result = reducer(store.value, action);
    // Tricky convention here, store state cannot be primitive undefined!!!
    if (result !== undefined) {
      storeLog(displayName, result);
      store.next(result);
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
  reduxStore.dispatch(action);
}


// LEGACY: redux middleware to listen for "old" actions
// These might be thunks! But the .type property will be null
export function rxLegacyReduxMiddleware() {
  return next => action => {
    legacyActionLog(action.type, action);
    actions.next(action);
    return next(action);
  };
}

// LEGACY: save the redux store for interop
export function rxLegacyReduxSetStore(store) {
  reduxStore = store;
}
