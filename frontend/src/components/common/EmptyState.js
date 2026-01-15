import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';

export default function EmptyState({
  icon = 'document-text-outline',
  title,
  message,
  actionLabel,
  onAction,
}) {
  return (
    <View className="flex-1 items-center justify-center py-12 px-6">
      <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Ionicons name={icon} size={40} color="#9ca3af" />
      </View>
      <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
        {title}
      </Text>
      <Text className="text-gray-500 text-center mb-6 max-w-xs">
        {message}
      </Text>
      {actionLabel && onAction && (
        <Button onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}
