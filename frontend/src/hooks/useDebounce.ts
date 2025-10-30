import { useCallback, useRef } from 'react';

/**
 * Hook to debounce a function call
 * Useful for rate-limiting user input callbacks
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
        timeoutRef.current = null;
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Hook to throttle a function call
 * Ensures function is called at most once per specified interval
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        const remainingDelay = delay - (now - lastCallRef.current);
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
          timeoutRef.current = null;
        }, remainingDelay);
      }
    },
    [callback, delay]
  );
}
