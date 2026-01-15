import React, { forwardRef } from 'react';
import { View, Text, TextInput } from 'react-native';

const Input = forwardRef(({
  label,
  error,
  containerClassName = '',
  inputClassName = '',
  ...props
}, ref) => {
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-gray-700 font-medium mb-1.5">
          {label}
        </Text>
      )}
      <TextInput
        ref={ref}
        className={`
          bg-white border rounded-lg px-4 py-3
          text-gray-900 text-base
          ${error ? 'border-danger-500' : 'border-gray-300'}
          ${inputClassName}
        `}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && (
        <Text className="text-danger-500 text-sm mt-1">
          {error}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

export default Input;
