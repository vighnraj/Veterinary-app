import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

const variants = {
  primary: 'bg-primary-600 active:bg-primary-700',
  secondary: 'bg-gray-200 active:bg-gray-300',
  success: 'bg-success-600 active:bg-success-700',
  danger: 'bg-danger-600 active:bg-danger-700',
  outline: 'bg-transparent border-2 border-primary-600',
  ghost: 'bg-transparent',
};

const textVariants = {
  primary: 'text-white',
  secondary: 'text-gray-800',
  success: 'text-white',
  danger: 'text-white',
  outline: 'text-primary-600',
  ghost: 'text-primary-600',
};

const sizes = {
  sm: 'py-2 px-4',
  md: 'py-3 px-6',
  lg: 'py-4 px-8',
};

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  textClassName = '',
  onPress,
  ...props
}) {
  return (
    <TouchableOpacity
      className={`
        rounded-lg flex-row items-center justify-center
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? 'opacity-50' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      onPress={onPress}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'success' || variant === 'danger' ? '#fff' : '#2563eb'}
          size="small"
        />
      ) : (
        <Text
          className={`
            font-semibold
            ${textVariants[variant]}
            ${textSizes[size]}
            ${textClassName}
          `}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
