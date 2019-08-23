import { useState, useEffect } from "react";
import { Observable } from "rxjs";
import { StoreSubject } from "../../rx-stores";

// Rx "store" StoreSubject subscription hook
export default function useRxStore<T>(store: StoreSubject<T>): T {
  const [state, setState] = useState(store.imperativelyGetValue());

  useEffect(() => {
    const subscription = store.subscribe(s => setState(s));
    return () => subscription.unsubscribe();
  }, [store]);

  return state;
}

// Rx custom Observable subscription hook
export function useRxObservable<T>(
  observable: Observable<T>,
  initialValue?: T,
): T | undefined {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    const subscription = observable.subscribe(s => setState(s));
    return () => subscription.unsubscribe();
  }, [observable]);

  return state;
}
