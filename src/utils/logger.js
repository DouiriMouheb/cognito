/**
 * Application Logger Utility
 * Provides centralized logging with environment-aware output
 */

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isProduction = import.meta.env.PROD;
  }

  /**
   * Format log message with timestamp and context
   */
  formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      context,
      environment: this.isDevelopment ? 'development' : 'production',
    };
  }

  /**
   * Send logs to external service in production
   */
  sendToLoggingService(logEntry) {
    // In production, integrate with services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - CloudWatch
    
    // For now, we'll just suppress in production
    if (this.isProduction && logEntry.level === LOG_LEVELS.ERROR) {
      // TODO: Send to error tracking service
      // Example: Sentry.captureException(logEntry)
    }
  }

  /**
   * Log error messages
   */
  error(message, context = {}) {
    const logEntry = this.formatMessage(LOG_LEVELS.ERROR, message, context);
    
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, context);
    }
    
    this.sendToLoggingService(logEntry);
  }

  /**
   * Log warning messages
   */
  warn(message, context = {}) {
    const logEntry = this.formatMessage(LOG_LEVELS.WARN, message, context);
    
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context);
    }
    
    this.sendToLoggingService(logEntry);
  }

  /**
   * Log info messages (development only)
   */
  info(message, context = {}) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context);
    }
  }

  /**
   * Log debug messages (development only)
   */
  debug(message, context = {}) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }

  /**
   * Log API requests (development only)
   */
  apiRequest(endpoint, method, context = {}) {
    if (this.isDevelopment) {
      console.log(`[API] ${method} ${endpoint}`, context);
    }
  }

  /**
   * Log API responses (development only)
   */
  apiResponse(endpoint, status, context = {}) {
    if (this.isDevelopment) {
      const statusColor = status >= 200 && status < 300 ? '✓' : '✗';
      console.log(`[API] ${statusColor} ${status} ${endpoint}`, context);
    }
  }

  /**
   * Log authentication events
   */
  auth(event, success, context = {}) {
    const message = `Auth: ${event} - ${success ? 'Success' : 'Failed'}`;
    
    if (this.isDevelopment) {
      console.log(`[AUTH] ${message}`, context);
    }
    
    if (!success) {
      this.error(message, context);
    }
  }

  /**
   * Log mock data usage (development only)
   */
  mock(message, context = {}) {
    if (this.isDevelopment) {
      console.log(`[MOCK] ${message}`, context);
    }
  }

  /**
   * Group logs together (development only)
   */
  group(label, callback) {
    if (this.isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    } else {
      callback();
    }
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;
