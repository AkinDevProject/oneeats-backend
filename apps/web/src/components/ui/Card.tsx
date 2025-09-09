import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  hover?: boolean;
  onClick?: () => void;
  'data-testid'?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className,
  padding = 'md',
  variant = 'default',
  hover = false,
  onClick,
  'data-testid': dataTestId
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10'
  };

  const variantClasses = {
    default: 'card',
    elevated: 'bg-white rounded-xl border border-gray-200/60 shadow-medium',
    outlined: 'bg-white rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors duration-200',
    glass: 'glass rounded-xl shadow-soft'
  };

  return (
    <div 
      className={clsx(
        variantClasses[variant],
        paddingClasses[padding],
        hover && 'card-hover cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
};