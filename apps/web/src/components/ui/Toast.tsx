import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  show?: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  show = true
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const variants = {
    success: 'bg-success-50 border-success-200 text-success-800',
    error: 'bg-danger-50 border-danger-200 text-danger-800', 
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    info: 'bg-primary-50 border-primary-200 text-primary-800'
  };

  const iconColors = {
    success: 'text-success-600',
    error: 'text-danger-600',
    warning: 'text-warning-600',
    info: 'text-primary-600'
  };

  const Icon = icons[type];

  if (!isVisible) return null;

  return (
    <div className={clsx(
      'fixed top-4 right-4 max-w-sm w-full p-4 rounded-lg border shadow-medium z-[9999] animate-slide-in',
      variants[type]
    )}>
      <div className="flex items-start space-x-3">
        <Icon className={clsx('h-5 w-5 mt-0.5 flex-shrink-0', iconColors[type])} />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium text-sm mb-1">{title}</h4>
          )}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export interface ToastManager {
  show: (toast: Omit<ToastProps, 'show'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

export const useToast = (): ToastManager & { toasts: React.ReactNode } => {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const show = (toast: Omit<ToastProps, 'show'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id, show: true }]);
  };

  const success = (message: string, title?: string) => show({ type: 'success', message, title });
  const error = (message: string, title?: string) => show({ type: 'error', message, title });
  const warning = (message: string, title?: string) => show({ type: 'warning', message, title });
  const info = (message: string, title?: string) => show({ type: 'info', message, title });

  const toastElements = (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return { show, success, error, warning, info, toasts: toastElements };
};