import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../src/components/common';
import { authApi } from '../../src/api';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

export default function ForgotPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch (error) {
      // Don't reveal if email exists
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-6 justify-center items-center">
          <View className="w-20 h-20 bg-success-50 rounded-full items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            Check Your Email
          </Text>
          <Text className="text-gray-500 text-center mb-8 max-w-xs">
            If an account exists with that email, we've sent password reset instructions.
          </Text>
          <Button onPress={() => router.replace('/auth/login')} size="lg">
            Back to Login
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="px-6"
        >
          {/* Back Button */}
          <TouchableOpacity
            className="flex-row items-center py-4"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
            <Text className="ml-2 text-gray-700 font-medium">Back</Text>
          </TouchableOpacity>

          <View className="flex-1 justify-center py-8">
            {/* Icon */}
            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center">
                <Ionicons name="key-outline" size={40} color="#2563eb" />
              </View>
            </View>

            {/* Title */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-gray-900 text-center">
                Forgot Password?
              </Text>
              <Text className="text-gray-500 mt-2 text-center">
                Enter your email and we'll send you instructions to reset your password.
              </Text>
            </View>

            {/* Form */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />

            {/* Submit Button */}
            <Button
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              size="lg"
              className="mt-4"
            >
              Send Reset Link
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
