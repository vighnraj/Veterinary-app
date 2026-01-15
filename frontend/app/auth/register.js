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
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      Alert.alert(
        'Registration Successful',
        'Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
      );
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Error', message);
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
          {/* Back Button */}
          <TouchableOpacity
            className="flex-row items-center py-4"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
            <Text className="ml-2 text-gray-700 font-medium">Back</Text>
          </TouchableOpacity>

          <View className="flex-1 py-4">
            {/* Title */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
              <Text className="text-gray-500 mt-2">
                Start your 14-day free trial. No credit card required.
              </Text>
            </View>

            {/* Form */}
            <View className="flex-row">
              <View className="flex-1 mr-2">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="First Name"
                      placeholder="John"
                      autoCapitalize="words"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.firstName?.message}
                    />
                  )}
                />
              </View>
              <View className="flex-1 ml-2">
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Last Name"
                      placeholder="Doe"
                      autoCapitalize="words"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.lastName?.message}
                    />
                  )}
                />
              </View>
            </View>

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
                    placeholder="Create a strong password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
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

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            {/* Register Button */}
            <Button
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              size="lg"
              className="mt-4"
            >
              Create Account
            </Button>

            {/* Terms */}
            <Text className="text-center text-gray-500 text-sm mt-6">
              By signing up, you agree to our{' '}
              <Text className="text-primary-600">Terms of Service</Text> and{' '}
              <Text className="text-primary-600">Privacy Policy</Text>
            </Text>

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">Already have an account? </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity>
                  <Text className="text-primary-600 font-semibold">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
