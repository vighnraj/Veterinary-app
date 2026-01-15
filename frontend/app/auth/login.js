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
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../src/components/common';
import useAuthStore from '../../src/store/authStore';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      router.replace('/(tabs)');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Error', message);
    } finally {
      setLoading(false);
    }
  };

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
          <View className="flex-1 justify-center py-8">
            {/* Logo and Title */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-primary-600 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="paw" size={40} color="#fff" />
              </View>
              <Text className="text-3xl font-bold text-gray-900">VetSaaS</Text>
              <Text className="text-gray-500 mt-2">Veterinary Management System</Text>
            </View>

            {/* Form */}
            <View className="mb-6">
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

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <Input
                      label="Password"
                      placeholder="Enter your password"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.password?.message}
                    />
                    <TouchableOpacity
                      className="absolute right-4 top-10"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={24}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>

            {/* Forgot Password */}
            <Link href="/auth/forgot-password" asChild>
              <TouchableOpacity className="self-end mb-6">
                <Text className="text-primary-600 font-medium">Forgot password?</Text>
              </TouchableOpacity>
            </Link>

            {/* Login Button */}
            <Button onPress={handleSubmit(onSubmit)} loading={loading} size="lg">
              Sign In
            </Button>

            {/* Register Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">Don't have an account? </Text>
              <Link href="/auth/register" asChild>
                <TouchableOpacity>
                  <Text className="text-primary-600 font-semibold">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
