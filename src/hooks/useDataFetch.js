import { useState, useEffect, useCallback, useRef } from 'react';
import logger from '@utils/logger';

/**
 * Custom hook for data fetching with caching, loading, and error states
 * 
 * @param {Function} fetchFunction - Async function that fetches data
 * @param {Object} options - Configuration options
 * @param {boolean} options.immediate - Whether to fetch immediately on mount (default: true)
 * @param {Array} options.dependencies - Dependencies to trigger refetch (default: [])
 * @param {number} options.cacheTime - Cache duration in ms (default: 5 minutes)
 * @param {string} options.cacheKey - Unique key for caching (optional)
 * @param {Function} options.onSuccess - Callback on successful fetch
 * @param {Function} options.onError - Callback on error
 * @returns {Object} { data, loading, error, refetch, mutate }
 */
export const useDataFetch = (fetchFunction, options = {}) => {
  const {
    immediate = true,
    dependencies = [],
    cacheTime = 5 * 60 * 1000, // 5 minutes
    cacheKey = null,
    onSuccess = null,
    onError = null,
    retry = 0,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  
  const mountedRef = useRef(true);
  const cacheRef = useRef({});
  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);

  // Check cache
  const getCachedData = useCallback(() => {
    if (!cacheKey) return null;
    
    const cached = cacheRef.current[cacheKey];
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp < cacheTime) {
      logger.debug('Using cached data', { cacheKey });
      return cached.data;
    }

    // Cache expired
    delete cacheRef.current[cacheKey];
    return null;
  }, [cacheKey, cacheTime]);

  // Set cache
  const setCachedData = useCallback((newData) => {
    if (!cacheKey) return;
    
    cacheRef.current[cacheKey] = {
      data: newData,
      timestamp: Date.now(),
    };
  }, [cacheKey]);

  // Fetch data
  const fetchData = useCallback(async (showLoading = true) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Check cache first
    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      setError(null);
      if (onSuccess) onSuccess(cachedData);
      return cachedData;
    }

    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await fetchFunction(abortControllerRef.current.signal);

      if (!mountedRef.current) return;

      setData(result);
      setCachedData(result);
      setLoading(false);
      setError(null);
      retryCountRef.current = 0; // Reset retry count on success

      if (onSuccess) onSuccess(result);

      return result;
    } catch (err) {
      if (!mountedRef.current) return;

      // Don't set error if request was aborted
      if (err.name === 'AbortError') {
        logger.debug('Request aborted', { cacheKey });
        return;
      }

      const shouldRetry = retryCountRef.current < retry;
      
      if (shouldRetry) {
        retryCountRef.current++;
        logger.warn('Fetch failed, retrying...', {
          attempt: retryCountRef.current,
          maxRetries: retry,
          error: err.message
        });

        // Retry after delay
        setTimeout(() => {
          if (mountedRef.current) {
            fetchData(false);
          }
        }, retryDelay * retryCountRef.current);
        
        return;
      }

      logger.error('Data fetch failed', { error: err.message, cacheKey });
      setError(err);
      setLoading(false);

      if (onError) onError(err);
    }
  }, [fetchFunction, getCachedData, setCachedData, retry, retryDelay, onSuccess, onError, cacheKey]);

  // Refetch data (bypass cache)
  const refetch = useCallback(async () => {
    if (cacheKey) {
      delete cacheRef.current[cacheKey];
    }
    return await fetchData(true);
  }, [fetchData, cacheKey]);

  // Mutate data without refetching
  const mutate = useCallback((newData) => {
    setData(newData);
    setCachedData(newData);
  }, [setCachedData]);

  // Clear cache
  const clearCache = useCallback(() => {
    if (cacheKey) {
      delete cacheRef.current[cacheKey];
    }
  }, [cacheKey]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    if (immediate) {
      fetchData();
    }

    return () => {
      // Cleanup on unmount
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
    clearCache,
    isStale: cacheKey && !getCachedData(),
  };
};

/**
 * Hook for paginated data fetching
 */
export const usePaginatedFetch = (fetchFunction, options = {}) => {
  const {
    pageSize = 10,
    initialPage = 1,
    ...restOptions
  } = options;

  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const wrappedFetchFunction = useCallback(
    async (signal) => {
      const result = await fetchFunction({ page, pageSize }, signal);
      
      if (result.pagination) {
        setTotalPages(result.pagination.totalPages || 1);
        setTotalItems(result.pagination.totalItems || 0);
      }
      
      return result.data || result;
    },
    [fetchFunction, page, pageSize]
  );

  const fetchResult = useDataFetch(wrappedFetchFunction, {
    ...restOptions,
    dependencies: [page, ...(restOptions.dependencies || [])],
  });

  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(page - 1);
  }, [page, goToPage]);

  return {
    ...fetchResult,
    page,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * Hook for infinite scroll data fetching
 */
export const useInfiniteFetch = (fetchFunction, options = {}) => {
  const {
    pageSize = 10,
    ...restOptions
  } = options;

  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const wrappedFetchFunction = useCallback(
    async (signal) => {
      const result = await fetchFunction({ page, pageSize }, signal);
      
      const newData = result.data || result;
      const hasMoreData = newData.length === pageSize;
      
      setHasMore(hasMoreData);
      
      return newData;
    },
    [fetchFunction, page, pageSize]
  );

  const fetchResult = useDataFetch(wrappedFetchFunction, {
    ...restOptions,
    dependencies: [page],
    onSuccess: (newData) => {
      setAllData(prev => page === 1 ? newData : [...prev, ...newData]);
      if (restOptions.onSuccess) restOptions.onSuccess(newData);
    },
  });

  const loadMore = useCallback(() => {
    if (!fetchResult.loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [fetchResult.loading, hasMore]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
    fetchResult.refetch();
  }, [fetchResult]);

  return {
    ...fetchResult,
    data: allData,
    loadMore,
    hasMore,
    reset,
  };
};

export default useDataFetch;
