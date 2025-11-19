import { useEffect, useRef, useCallback } from 'react';
import logger from '@utils/logger';

/**
 * Hook to measure component render performance
 * Useful for identifying performance bottlenecks
 * 
 * @param {string} componentName - Name of the component being measured
 * @param {Object} options - Configuration options
 * @returns {Object} Performance measurement utilities
 */
export const usePerformance = (componentName, options = {}) => {
  const {
    enabled = import.meta.env.DEV,
    threshold = 16, // 60fps = 16ms per frame
    logSlowRenders = true,
  } = options;

  const renderCountRef = useRef(0);
  const renderTimesRef = useRef([]);
  const mountTimeRef = useRef(null);
  const lastRenderTimeRef = useRef(null);

  // Measure render time
  useEffect(() => {
    if (!enabled) return;

    const now = performance.now();
    
    if (lastRenderTimeRef.current) {
      const renderTime = now - lastRenderTimeRef.current;
      renderTimesRef.current.push(renderTime);
      renderCountRef.current++;

      if (logSlowRenders && renderTime > threshold) {
        logger.warn(`Slow render detected in ${componentName}`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          threshold: `${threshold}ms`,
          renderCount: renderCountRef.current,
        });
      }
    } else {
      mountTimeRef.current = now;
    }

    lastRenderTimeRef.current = now;
  });

  // Log component stats on unmount
  useEffect(() => {
    return () => {
      if (!enabled || renderTimesRef.current.length === 0) return;

      const avgRenderTime =
        renderTimesRef.current.reduce((a, b) => a + b, 0) /
        renderTimesRef.current.length;
      const maxRenderTime = Math.max(...renderTimesRef.current);
      const minRenderTime = Math.min(...renderTimesRef.current);

      logger.info(`Performance stats for ${componentName}`, {
        renderCount: renderCountRef.current,
        avgRenderTime: `${avgRenderTime.toFixed(2)}ms`,
        minRenderTime: `${minRenderTime.toFixed(2)}ms`,
        maxRenderTime: `${maxRenderTime.toFixed(2)}ms`,
        totalTime: `${renderTimesRef.current.reduce((a, b) => a + b, 0).toFixed(2)}ms`,
      });
    };
  }, [enabled, componentName]);

  // Manual performance mark
  const mark = useCallback(
    (label) => {
      if (!enabled) return;
      const markName = `${componentName}:${label}`;
      performance.mark(markName);
      logger.debug(`Performance mark: ${markName}`);
    },
    [componentName, enabled]
  );

  // Manual performance measure
  const measure = useCallback(
    (label, startMark, endMark) => {
      if (!enabled) return;

      const measureName = `${componentName}:${label}`;
      const start = startMark ? `${componentName}:${startMark}` : undefined;
      const end = endMark ? `${componentName}:${endMark}` : undefined;

      try {
        performance.measure(measureName, start, end);
        const measure = performance.getEntriesByName(measureName)[0];
        
        logger.debug(`Performance measure: ${measureName}`, {
          duration: `${measure.duration.toFixed(2)}ms`,
        });

        return measure.duration;
      } catch (error) {
        logger.error('Performance measure failed', { error: error.message });
      }
    },
    [componentName, enabled]
  );

  return {
    mark,
    measure,
    renderCount: renderCountRef.current,
    avgRenderTime:
      renderTimesRef.current.length > 0
        ? renderTimesRef.current.reduce((a, b) => a + b, 0) /
          renderTimesRef.current.length
        : 0,
  };
};

/**
 * Hook to monitor memory usage
 * Chrome DevTools only
 */
export const useMemoryMonitor = (componentName, options = {}) => {
  const { enabled = import.meta.env.DEV, interval = 5000 } = options;

  useEffect(() => {
    if (!enabled || !performance.memory) return;

    const checkMemory = () => {
      const memoryInfo = {
        usedJSHeapSize: `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        totalJSHeapSize: `${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        jsHeapSizeLimit: `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
      };

      logger.debug(`Memory usage for ${componentName}`, memoryInfo);
    };

    const intervalId = setInterval(checkMemory, interval);
    checkMemory(); // Check immediately

    return () => clearInterval(intervalId);
  }, [componentName, enabled, interval]);
};

/**
 * Hook to track user interactions performance
 */
export const useInteractionTracking = (componentName, options = {}) => {
  const { enabled = import.meta.env.DEV } = options;

  const trackInteraction = useCallback(
    (interactionName, callback) => {
      if (!enabled) {
        return callback();
      }

      const startTime = performance.now();
      const startMark = `${componentName}:${interactionName}:start`;
      const endMark = `${componentName}:${interactionName}:end`;

      performance.mark(startMark);

      const result = callback();

      const handleResult = (value) => {
        performance.mark(endMark);
        const duration = performance.now() - startTime;

        logger.debug(`Interaction: ${componentName}:${interactionName}`, {
          duration: `${duration.toFixed(2)}ms`,
        });

        // Warn if interaction is slow (>100ms for good UX)
        if (duration > 100) {
          logger.warn(`Slow interaction in ${componentName}`, {
            interaction: interactionName,
            duration: `${duration.toFixed(2)}ms`,
          });
        }

        return value;
      };

      // Handle both sync and async callbacks
      if (result && typeof result.then === 'function') {
        return result.then(handleResult);
      }

      return handleResult(result);
    },
    [componentName, enabled]
  );

  return { trackInteraction };
};

/**
 * Hook to detect component update causes
 * Helps identify unnecessary re-renders
 */
export const useWhyDidYouUpdate = (componentName, props) => {
  const previousPropsRef = useRef();

  useEffect(() => {
    if (previousPropsRef.current) {
      const allKeys = Object.keys({ ...previousPropsRef.current, ...props });
      const changedProps = {};

      allKeys.forEach((key) => {
        if (previousPropsRef.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousPropsRef.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        logger.debug(`${componentName} re-rendered due to:`, changedProps);
      }
    }

    previousPropsRef.current = props;
  });
};

export default usePerformance;
