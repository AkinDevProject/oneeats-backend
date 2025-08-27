import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'default',
  size = 'md',
  icon,
  pulse = false,
  children,
  className 
}) => {
  const variants = {
    default: 'status-info',
    success: 'status-success',
    warning: 'status-pending',
    danger: 'status-danger',
    info: 'status-info',
    secondary: 'bg-gray-100 text-gray-700'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span className={clsx(
      'status-badge inline-flex items-center rounded-full font-medium gap-1',
      variants[variant],
      sizes[size],
      pulse && 'animate-pulse',
      className
    )}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};