import { Subject } from 'rxjs';

import { GlobalAction } from '../../types/rx-actions';
import { Reducer, StoreSubject, skipUpdate } from '../../rx-stores';

export function createTestActionStream<T = GlobalAction>() {
  const actionStream = new Subject<T>();
  const dispatch = (action: T) => actionStream.next(action);
  return [actionStream, dispatch] as const;
}

export function createTestStore<T>(initialState: T, reducer: Reducer<T, GlobalAction>, actionStream: Subject<GlobalAction>): StoreSubject<T> {
  const store = new StoreSubject<T>(initialState);
  actionStream.subscribe(action => {
    const prevState = store.imperativelyGetValue();
    const nextState = reducer(prevState, action);
    if (nextState !== skipUpdate) {
      store.next(nextState);
    }
  })
  return store;
}
