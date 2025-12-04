'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: string;
  children: React.ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles = 'font-medium transition-colors rounded-lg flex items-center justify-center';

  const variantStyles = {
    primary: 'text-white',
    secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} disabled:opacity-50 disabled:cursor-not-allowed`}
      style={variant === 'primary' ? { backgroundColor: '#BF8F63' } : {}}
      onMouseEnter={(e) => {
        if (variant === 'primary' && !disabled && !isLoading) {
          e.currentTarget.style.backgroundColor = '#A67C52';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary' && !disabled && !isLoading) {
          e.currentTarget.style.backgroundColor = '#BF8F63';
        }
      }}
      {...props}
    >
      {icon && <i className={`${icon} mr-2`}></i>}
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

