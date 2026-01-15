import React from 'react';
import { View, Text } from 'react-native';

const variants = {
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  danger: 'bg-danger-50 text-danger-600',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) {
  return (
    <View
      className={`
        rounded-full self-start
        ${variants[variant]}
        ${className}
      `}
    >
      <Text
        className={`
          font-medium
          ${variants[variant]}
          ${sizes[size]}
        `}
      >
        {children}
      </Text>
    </View>
  );
}
