import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card, Input, Button } from '../../src/components/common';
import { clientsApi } from '../../src/api';
import { QUERY_KEYS } from '../../src/constants/config';

const schema = yup.object({
  name: yup.string().required('Nome é obrigatório').min(2, 'Mínimo 2 caracteres'),
  type: yup.string().required('Tipo é obrigatório').oneOf(['individual', 'company']),
  document: yup.string(),
  email: yup.string().email('Email inválido'),
  phone: yup.string(),
  whatsapp: yup.string(),
  street: yup.string(),
  number: yup.string(),
  neighborhood: yup.string(),
  city: yup.string(),
  state: yup.string(),
  zipCode: yup.string(),
  notes: yup.string(),
});

export default function ClientCreateScreen() {
  const queryClient = useQueryClient();
  const [clientType, setClientType] = useState('individual');

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      type: 'individual',
      document: '',
      email: '',
      phone: '',
      whatsapp: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      notes: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => clientsApi.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.CLIENTS]);
      Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error) => {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao cadastrar cliente');
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const handleTypeChange = (type) => {
    setClientType(type);
    setValue('type', type);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="close" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-bold text-gray-900">Novo Cliente</Text>
        <Button
          variant="primary"
          size="sm"
          loading={createMutation.isPending}
          onPress={handleSubmit(onSubmit)}
        >
          Salvar
        </Button>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-4">
          {/* Type Selection */}
          <Card title="Tipo de Cliente" className="mb-4">
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => handleTypeChange('individual')}
                className={`flex-1 py-3 rounded-lg mr-2 items-center ${
                  clientType === 'individual' ? 'bg-primary-100 border-2 border-primary-500' : 'bg-gray-100'
                }`}
              >
                <Ionicons
                  name="person"
                  size={24}
                  color={clientType === 'individual' ? '#2563eb' : '#9ca3af'}
                />
                <Text className={`mt-1 font-medium ${
                  clientType === 'individual' ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  Pessoa Física
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleTypeChange('company')}
                className={`flex-1 py-3 rounded-lg items-center ${
                  clientType === 'company' ? 'bg-primary-100 border-2 border-primary-500' : 'bg-gray-100'
                }`}
              >
                <Ionicons
                  name="business"
                  size={24}
                  color={clientType === 'company' ? '#2563eb' : '#9ca3af'}
                />
                <Text className={`mt-1 font-medium ${
                  clientType === 'company' ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  Pessoa Jurídica
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Basic Info */}
          <Card title="Informações Básicas" className="mb-4">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={clientType === 'company' ? 'Razão Social' : 'Nome Completo'}
                  placeholder={clientType === 'company' ? 'Razão social da empresa' : 'Nome do cliente'}
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                  required
                />
              )}
            />
            <Controller
              control={control}
              name="document"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={clientType === 'company' ? 'CNPJ' : 'CPF'}
                  placeholder={clientType === 'company' ? '00.000.000/0000-00' : '000.000.000-00'}
                  value={value}
                  onChangeText={onChange}
                  error={errors.document?.message}
                  keyboardType="numeric"
                />
              )}
            />
          </Card>

          {/* Contact */}
          <Card title="Contato" className="mb-4">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  placeholder="email@exemplo.com"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Telefone"
                  placeholder="(00) 0000-0000"
                  value={value}
                  onChangeText={onChange}
                  error={errors.phone?.message}
                  keyboardType="phone-pad"
                />
              )}
            />
            <Controller
              control={control}
              name="whatsapp"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="WhatsApp"
                  placeholder="(00) 00000-0000"
                  value={value}
                  onChangeText={onChange}
                  error={errors.whatsapp?.message}
                  keyboardType="phone-pad"
                  leftIcon={<Ionicons name="logo-whatsapp" size={20} color="#25D366" />}
                />
              )}
            />
          </Card>

          {/* Address */}
          <Card title="Endereço" className="mb-4">
            <Controller
              control={control}
              name="zipCode"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="CEP"
                  placeholder="00000-000"
                  value={value}
                  onChangeText={onChange}
                  error={errors.zipCode?.message}
                  keyboardType="numeric"
                />
              )}
            />
            <Controller
              control={control}
              name="street"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Rua"
                  placeholder="Nome da rua"
                  value={value}
                  onChangeText={onChange}
                  error={errors.street?.message}
                />
              )}
            />
            <View className="flex-row">
              <View className="flex-1 mr-2">
                <Controller
                  control={control}
                  name="number"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Número"
                      placeholder="123"
                      value={value}
                      onChangeText={onChange}
                      error={errors.number?.message}
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="neighborhood"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Bairro"
                      placeholder="Bairro"
                      value={value}
                      onChangeText={onChange}
                      error={errors.neighborhood?.message}
                    />
                  )}
                />
              </View>
            </View>
            <View className="flex-row">
              <View className="flex-2 mr-2" style={{ flex: 2 }}>
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Cidade"
                      placeholder="Cidade"
                      value={value}
                      onChangeText={onChange}
                      error={errors.city?.message}
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="state"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="UF"
                      placeholder="SP"
                      value={value}
                      onChangeText={onChange}
                      error={errors.state?.message}
                      maxLength={2}
                      autoCapitalize="characters"
                    />
                  )}
                />
              </View>
            </View>
          </Card>

          {/* Notes */}
          <Card title="Observações" className="mb-4">
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Observações"
                  placeholder="Informações adicionais sobre o cliente..."
                  value={value}
                  onChangeText={onChange}
                  error={errors.notes?.message}
                  multiline
                  numberOfLines={4}
                />
              )}
            />
          </Card>

          <View className="h-6" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
