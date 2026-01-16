import { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatters';

export default function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Selecione uma data',
  mode = 'date', // 'date', 'time', 'datetime'
  minimumDate,
  maximumDate,
  error,
  required,
  disabled,
}) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value ? new Date(value) : new Date());

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (event.type === 'set' && selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        onChange(selectedDate.toISOString());
      }
    }
  };

  const handleConfirm = () => {
    setShow(false);
    onChange(tempDate.toISOString());
  };

  const handleCancel = () => {
    setShow(false);
    setTempDate(value ? new Date(value) : new Date());
  };

  const displayValue = value
    ? mode === 'time'
      ? new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : mode === 'datetime'
        ? `${formatDate(value)} ${new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
        : formatDate(value)
    : null;

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-700 font-medium mb-1">
          {label}
          {required && <Text className="text-red-500"> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => !disabled && setShow(true)}
        className={`flex-row items-center border rounded-lg px-4 py-3 bg-white ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100' : ''}`}
      >
        <Ionicons
          name={mode === 'time' ? 'time' : 'calendar'}
          size={20}
          color="#9ca3af"
        />
        <Text
          className={`flex-1 ml-2 ${displayValue ? 'text-gray-900' : 'text-gray-400'}`}
        >
          {displayValue || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9ca3af" />
      </TouchableOpacity>

      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}

      {show && (
        <>
          {Platform.OS === 'ios' && (
            <View className="absolute z-50 left-0 right-0 bottom-0 bg-white border-t border-gray-200 p-4">
              <View className="flex-row justify-between mb-2">
                <TouchableOpacity onPress={handleCancel}>
                  <Text className="text-gray-500 font-medium">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text className="text-primary-600 font-bold">Confirmar</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode={mode}
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                locale="pt-BR"
              />
            </View>
          )}

          {Platform.OS === 'android' && (
            <DateTimePicker
              value={tempDate}
              mode={mode}
              display="default"
              onChange={handleChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          )}
        </>
      )}
    </View>
  );
}
