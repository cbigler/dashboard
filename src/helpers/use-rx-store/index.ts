import { BehaviorSubject, Observable } from "rxjs";
import { useState, useEffect } from "react";

// Rx "store" BehaviorSubject subscription hook
export default function useRxStore<T>(
  store: BehaviorSubject<T>,
): T {
  const [state, setState] = useState(store.value);

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
