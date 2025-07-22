import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { STORAGE_KEYS, THEME_CONFIG } from '../constants';

// Initial state
const initialState = {
  theme: THEME_CONFIG.SYSTEM,
  language: 'en',
  notifications: true,
  sidebarCollapsed: false,
  userPreferences: {},
  loading: false,
  error: null,
};

// Action types
export const APP_ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_USER_PREFERENCES: 'SET_USER_PREFERENCES',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_STATE: 'RESET_STATE',
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case APP_ACTIONS.SET_THEME:
      return { ...state, theme: action.payload };
    
    case APP_ACTIONS.SET_LANGUAGE:
      return { ...state, language: action.payload };
    
    case APP_ACTIONS.SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload };
    
    case APP_ACTIONS.TOGGLE_SIDEBAR:
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    
    case APP_ACTIONS.SET_USER_PREFERENCES:
      return { ...state, userPreferences: { ...state.userPreferences, ...action.payload } };
    
    case APP_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case APP_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case APP_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    case APP_ACTIONS.RESET_STATE:
      return { ...initialState };
    
    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        dispatch({ type: APP_ACTIONS.SET_USER_PREFERENCES, payload: preferences });
        
        // Apply saved theme
        if (preferences.theme) {
          dispatch({ type: APP_ACTIONS.SET_THEME, payload: preferences.theme });
        }
        
        // Apply saved language
        if (preferences.language) {
          dispatch({ type: APP_ACTIONS.SET_LANGUAGE, payload: preferences.language });
        }
        
        // Apply saved notifications
        if (preferences.notifications !== undefined) {
          dispatch({ type: APP_ACTIONS.SET_NOTIFICATIONS, payload: preferences.notifications });
        }
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const preferences = {
        theme: state.theme,
        language: state.language,
        notifications: state.notifications,
        ...state.userPreferences,
      };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }, [state.theme, state.language, state.notifications, state.userPreferences]);

  // Action creators
  const actions = {
    setTheme: (theme) => dispatch({ type: APP_ACTIONS.SET_THEME, payload: theme }),
    setLanguage: (language) => dispatch({ type: APP_ACTIONS.SET_LANGUAGE, payload: language }),
    setNotifications: (enabled) => dispatch({ type: APP_ACTIONS.SET_NOTIFICATIONS, payload: enabled }),
    toggleSidebar: () => dispatch({ type: APP_ACTIONS.TOGGLE_SIDEBAR }),
    setUserPreferences: (preferences) => dispatch({ type: APP_ACTIONS.SET_USER_PREFERENCES, payload: preferences }),
    setLoading: (loading) => dispatch({ type: APP_ACTIONS.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: APP_ACTIONS.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: APP_ACTIONS.CLEAR_ERROR }),
    resetState: () => dispatch({ type: APP_ACTIONS.RESET_STATE }),
  };

  const value = {
    ...state,
    ...actions,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
