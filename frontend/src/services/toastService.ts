import toast, { ToastOptions } from 'react-hot-toast';

// Default options for different toast types
const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'bottom-right',
};

const successOptions: ToastOptions = {
  ...defaultOptions,
  style: {
    background: '#34a853',
    color: '#fff',
  },
  icon: '✅',
};

const errorOptions: ToastOptions = {
  ...defaultOptions,
  duration: 5000, // Error messages stay a bit longer
  style: {
    background: '#ea4335',
    color: '#fff',
  },
  icon: '❌',
};

const warningOptions: ToastOptions = {
  ...defaultOptions,
  style: {
    background: '#fbbc05',
    color: '#333',
  },
  icon: '⚠️',
};

const infoOptions: ToastOptions = {
  ...defaultOptions,
  style: {
    background: '#4285f4',
    color: '#fff',
  },
  icon: 'ℹ️',
};

/**
 * Toast service for displaying notifications throughout the application
 */
export const toastService = {
  /**
   * Show a success toast notification
   * @param message The message to display
   * @param options Additional toast options (optional)
   * @returns The toast ID
   */
  success: (message: string, options?: ToastOptions): string => 
    toast.success(message, { ...successOptions, ...options }),

  /**
   * Show an error toast notification
   * @param message The message to display
   * @param options Additional toast options (optional)
   * @returns The toast ID
   */
  error: (message: string, options?: ToastOptions): string => 
    toast.error(message, { ...errorOptions, ...options }),

  /**
   * Show a warning toast notification
   * @param message The message to display
   * @param options Additional toast options (optional)
   * @returns The toast ID
   */
  warning: (message: string, options?: ToastOptions): string => 
    toast(message, { ...warningOptions, ...options }),

  /**
   * Show an info toast notification
   * @param message The message to display
   * @param options Additional toast options (optional)
   * @returns The toast ID
   */
  info: (message: string, options?: ToastOptions): string => 
    toast(message, { ...infoOptions, ...options }),

  /**
   * Dismiss a specific toast or all toasts
   * @param toastId The ID of the toast to dismiss (optional)
   */
  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  /**
   * Show a loading toast that can be updated later
   * @param message The message to display
   * @returns The toast ID
   */
  loading: (message: string): string => 
    toast.loading(message, defaultOptions),

  /**
   * Update an existing toast by replacing it
   * @param toastId The ID of the toast to update
   * @param type The type of toast to show ('success', 'error', 'warning', 'info', or 'loading')
   * @param message The new message
   * @param options Additional toast options (optional)
   */
  update: (
    toastId: string, 
    type: 'success' | 'error' | 'warning' | 'info' | 'loading', 
    message: string, 
    options?: ToastOptions
  ): void => {
    toast.dismiss(toastId);
    
    switch (type) {
      case 'success':
        toast.success(message, { id: toastId, ...successOptions, ...options });
        break;
      case 'error':
        toast.error(message, { id: toastId, ...errorOptions, ...options });
        break;
      case 'warning':
        toast(message, { id: toastId, ...warningOptions, ...options });
        break;
      case 'info':
        toast(message, { id: toastId, ...infoOptions, ...options });
        break;
      case 'loading':
        toast.loading(message, { id: toastId, ...defaultOptions, ...options });
        break;
    }
  },

  /**
   * Create a promise toast that shows loading, success, and error states
   * @param promise The promise to track
   * @param messages Object containing loading, success, and error messages
   * @param options Additional toast options (optional) 
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: ToastOptions
  ): Promise<T> => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      options
    );
  }
}; 