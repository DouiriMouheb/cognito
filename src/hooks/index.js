// Custom Hooks Exports
export { useApi, useUserProfile, useSinergiaUser, useAuthenticatedRequest } from './useApi';
export { default as useMockAuth } from './useMockAuth';
export { useSecureAuth } from './useSecureAuth';
export { default as useDataFetch, usePaginatedFetch, useInfiniteFetch } from './useDataFetch';
export { 
  default as usePerformance, 
  useMemoryMonitor, 
  useInteractionTracking, 
  useWhyDidYouUpdate 
} from './usePerformance';
