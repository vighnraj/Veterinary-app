import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function Card({
  children,
  title,
  subtitle,
  onPress,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  ...props
}) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
      onPress={onPress}
      {...props}
    >
      {(title || subtitle) && (
        <View className={`px-4 py-3 border-b border-gray-100 ${headerClassName}`}>
          {title && (
            <Text className="text-lg font-semibold text-gray-900">
              {title}
            </Text>
          )}
          {subtitle && (
            <Text className="text-sm text-gray-500 mt-0.5">
              {subtitle}
            </Text>
          )}
        </View>
      )}
      <View className={`p-4 ${bodyClassName}`}>
        {children}
      </View>
    </Wrapper>
  );
}
