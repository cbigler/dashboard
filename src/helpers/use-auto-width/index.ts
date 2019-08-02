import { useRef, useEffect, useState, useCallback } from 'react';

export function useEventListener(eventName, handler, element = window){
  const savedHandler = useRef((event) => undefined);
  
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(
    () => {
      const isSupported = element && element.addEventListener;
      if (!isSupported) return;

      const eventListener = event => savedHandler.current(event);
      element.addEventListener(eventName, eventListener);
      return () => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element]
  );
};

// Auto-width listener hook
export function useAutoWidth(ref, delay = 300) {
  const [width, setWidth] = useState(0);
  const handler = useCallback(
    () => setTimeout(() => (
      setWidth(ref.current ? ref.current.offsetWidth : 0)
    ), delay),
    [ref, delay]
  );
  useEventListener('resize', handler);
  handler();
  return width;
}