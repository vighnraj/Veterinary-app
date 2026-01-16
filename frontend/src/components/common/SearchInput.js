import { useState, useEffect, useCallback } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchInput({
  value,
  onChangeText,
  placeholder = 'Buscar...',
  debounceMs = 300,
  autoFocus = false,
  onSubmit,
  showClearButton = true,
}) {
  const [localValue, setLocalValue] = useState(value || '');

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onChangeText && localValue !== value) {
        onChangeText(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs]);

  // Sync with external value
  useEffect(() => {
    if (value !== undefined && value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    if (onChangeText) {
      onChangeText('');
    }
  }, [onChangeText]);

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(localValue);
    }
  }, [onSubmit, localValue]);

  return (
    <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
      <Ionicons name="search" size={20} color="#9ca3af" />
      <TextInput
        value={localValue}
        onChangeText={setLocalValue}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        autoFocus={autoFocus}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
        className="flex-1 ml-2 text-gray-900"
      />
      {showClearButton && localValue.length > 0 && (
        <TouchableOpacity onPress={handleClear}>
          <Ionicons name="close-circle" size={20} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  );
}
