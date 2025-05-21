import { useMemo } from 'react';

/**
 * Custom hook to memoize expensive components or values
 * 
 * @param {Function} factory - Function that creates the component or value
 * @param {Array} dependencies - Array of dependencies for memoization
 * @returns The memoized component or value
 */
export const useMemoizedComponent = (factory, dependencies) => {
  return useMemo(factory, dependencies);
};

/**
 * Helper function to create a stable object reference for component props
 * This helps prevent unnecessary re-renders when passing objects as props
 * 
 * @param {Object} props - The props object to stabilize
 * @returns A memoized version of the props object
 */
export const useStableProps = (props) => {
  return useMemo(() => props, Object.values(props));
}; 