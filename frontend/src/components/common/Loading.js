import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export default function Loading({ message = 'Loading...', fullScreen = false }) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">{message}</Text>
      </View>
    );
  }

  return (
    <View className="py-8 items-center justify-center">
      <ActivityIndicator size="large" color="#2563eb" />
      <Text className="mt-4 text-gray-600">{message}</Text>
    </View>
  );
}
