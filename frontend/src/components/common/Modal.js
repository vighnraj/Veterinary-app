import { View, Text, TouchableOpacity, Modal as RNModal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Modal({
  visible,
  onClose,
  title,
  children,
  size = 'default', // 'small', 'default', 'large', 'fullscreen'
  showCloseButton = true,
  closeOnBackdrop = true,
}) {
  const sizeStyles = {
    small: 'max-w-sm',
    default: 'max-w-md',
    large: 'max-w-lg',
    fullscreen: 'flex-1',
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center p-4"
        onPress={closeOnBackdrop ? onClose : undefined}
      >
        <Pressable
          className={`bg-white rounded-2xl w-full ${sizeStyles[size]}`}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
              {title && (
                <Text className="text-lg font-bold text-gray-900">{title}</Text>
              )}
              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  className="p-1"
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Content */}
          <View className="p-4">
            {children}
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
