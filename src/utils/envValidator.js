/**
 * Environment Configuration Validator
 * Validates required environment variables at startup
 */

import logger from './logger';

export class EnvValidator {
  /**
   * Required environment variables for the application
   */
  static requiredVars = {
    // API Configuration
    VITE_API_BASE_URL: {
      required: true,
      description: 'Base URL for API requests',
      default: 'https://dcodelabs.studio/'
    },
    VITE_TRANSPORTATION_COST_API: {
      required: false,
      description: 'Transportation cost calculation API endpoint',
      default: 'http://localhost:3000'
    },

    // Cognito Configuration (optional when disabled)
    VITE_COGNITO_AUTHORITY: {
      required: false,
      description: 'AWS Cognito authority URL'
    },
    VITE_COGNITO_CLIENT_ID: {
      required: false,
      description: 'AWS Cognito client ID'
    },
    VITE_COGNITO_CLIENT_SECRET: {
      required: false,
      description: 'AWS Cognito client secret'
    },
    VITE_COGNITO_REDIRECT_URI: {
      required: false,
      description: 'OAuth redirect URI after login'
    },
    VITE_COGNITO_POST_LOGOUT_REDIRECT_URI: {
      required: false,
      description: 'OAuth redirect URI after logout'
    },

    // Sinergia API Configuration (optional)
    VITE_SINERGIA_CLIENT_ID: {
      required: false,
      description: 'Sinergia API client ID'
    },
    VITE_SINERGIA_CLIENT_SECRET: {
      required: false,
      description: 'Sinergia API client secret'
    },
    VITE_SINERGIA_TOKEN_URL: {
      required: false,
      description: 'Sinergia token endpoint URL'
    },
    VITE_SINERGIA_API_BASE_URL: {
      required: false,
      description: 'Sinergia API base URL'
    }
  };

  /**
   * Validate all environment variables
   */
  static validate() {
    const errors = [];
    const warnings = [];
    const config = {};

    Object.entries(this.requiredVars).forEach(([key, settings]) => {
      const value = import.meta.env[key];

      if (!value || value.trim() === '') {
        if (settings.required) {
          errors.push({
            variable: key,
            description: settings.description,
            message: `Required environment variable ${key} is not set`
          });
        } else {
          warnings.push({
            variable: key,
            description: settings.description,
            message: `Optional environment variable ${key} is not set`,
            default: settings.default
          });
          
          // Use default if provided
          if (settings.default) {
            config[key] = settings.default;
          }
        }
      } else {
        config[key] = value;
      }
    });

    // Log results
    if (errors.length > 0) {
      logger.error('Environment validation failed', { errors });
      
      if (import.meta.env.DEV) {
        console.error('\n❌ Missing Required Environment Variables:');
        errors.forEach(err => {
          console.error(`  - ${err.variable}: ${err.description}`);
        });
        console.error('\nPlease check your .env file.\n');
      }
      
      throw new Error('Missing required environment variables. Check console for details.');
    }

    if (warnings.length > 0 && import.meta.env.DEV) {
      logger.warn('Some optional environment variables are not set', { warnings });
      
      console.warn('\n⚠️  Optional Environment Variables Not Set:');
      warnings.forEach(warn => {
        console.warn(`  - ${warn.variable}: ${warn.description}`);
        if (warn.default) {
          console.warn(`    Using default: ${warn.default}`);
        }
      });
      console.warn('');
    }

    return {
      valid: errors.length === 0,
      config,
      errors,
      warnings
    };
  }

  /**
   * Get a validated environment variable
   */
  static get(key) {
    const value = import.meta.env[key];
    
    if (!value && this.requiredVars[key]?.required) {
      logger.error(`Attempted to access required env var ${key} but it's not set`);
      return this.requiredVars[key]?.default || null;
    }
    
    return value || this.requiredVars[key]?.default || null;
  }

  /**
   * Check if running in development mode
   */
  static isDevelopment() {
    return import.meta.env.DEV;
  }

  /**
   * Check if running in production mode
   */
  static isProduction() {
    return import.meta.env.PROD;
  }

  /**
   * Get current environment name
   */
  static getEnvironment() {
    return import.meta.env.MODE;
  }

  /**
   * Print environment configuration (development only)
   */
  static printConfig() {
    if (!this.isDevelopment()) return;

    console.log('\n🔧 Environment Configuration:');
    console.log(`   Mode: ${this.getEnvironment()}`);
    console.log(`   API Base URL: ${this.get('VITE_API_BASE_URL')}`);
    console.log(`   Cognito Enabled: ${!!this.get('VITE_COGNITO_CLIENT_ID')}`);
    console.log('');
  }
}

export default EnvValidator;
