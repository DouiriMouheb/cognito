// React Hot Toast utility wrapper
import toast from 'react-hot-toast';

// Export convenient methods that match our previous API
export const showToast = {
  success: (message, duration = 4000) => {
    return toast.success(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10B981',
      },
    });
  },

  error: (message, duration = 5000) => {
    return toast.error(message, {
      duration,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
    });
  },

  warning: (message, duration = 4000) => {
    return toast(message, {
      duration,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
        fontWeight: '500',
      },
    });
  },

  info: (message, duration = 4000) => {
    return toast(message, {
      duration,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#fff',
        fontWeight: '500',
      },
    });
  },

  loading: (message) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6B7280',
        color: '#fff',
        fontWeight: '500',
      },
    });
  },

  // Promise-based toast for async operations
  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error occurred',
    }, {
      position: 'top-right',
      style: {
        fontWeight: '500',
      },
    });
  },

  // Dismiss specific toast
  dismiss: (toastId) => {
    return toast.dismiss(toastId);
  },

  // Dismiss all toasts
  dismissAll: () => {
    return toast.dismiss();
  }
};

// Export the main toast function for advanced usage
export default toast;
