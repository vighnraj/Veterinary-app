import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function Select({
  label,
  value,
  onValueChange,
  items = [],
  placeholder = 'Selecione...',
  error,
  required,
  disabled,
}) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-700 font-medium mb-1">
          {label}
          {required && <Text className="text-red-500"> *</Text>}
        </Text>
      )}
      <View
        className={`border rounded-lg bg-white overflow-hidden ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100' : ''}`}
      >
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          enabled={!disabled}
          style={{ height: 50 }}
        >
          <Picker.Item label={placeholder} value="" color="#9ca3af" />
          {items.map((item) => (
            <Picker.Item
              key={item.value}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </View>
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
