'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 400ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes before the delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debouncing search functionality
 * Provides both the debounced value and loading state
 * @param searchTerm - The search term to debounce
 * @param delay - Delay in milliseconds (default: 400ms)
 * @returns Object with debouncedSearchTerm and isSearching state
 */
export function useSearchDebounce(searchTerm: string, delay: number = 400) {
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  return {
    debouncedSearchTerm,
    isSearching
  };
}

/**
 * Custom hook for debouncing multiple filter values
 * Useful for complex search forms with multiple filters
 * @param filters - Object containing filter values
 * @param delay - Delay in milliseconds (default: 400ms)
 * @returns Object with debouncedFilters and isFiltering state
 */
export function useFiltersDebounce<T extends Record<string, unknown>>(
  filters: T, 
  delay: number = 400
) {
  const [isFiltering, setIsFiltering] = useState(false);
  const debouncedFilters = useDebounce(filters, delay);

  useEffect(() => {
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(debouncedFilters);
    setIsFiltering(filtersChanged);
  }, [filters, debouncedFilters]);

  return {
    debouncedFilters,
    isFiltering
  };
}
