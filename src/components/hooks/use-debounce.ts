import { useState, useEffect } from 'react';

/**
 * A custom hook to debounce a value.
 * @param value The value to debounce.
 * @param delay The delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // This is the cleanup function.
    // It runs every time the `value` or `delay` changes.
    // It clears the previous timer, effectively resetting it.
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}