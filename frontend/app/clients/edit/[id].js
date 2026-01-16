import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Card from '../../../src/components/common/Card';
import Button from '../../../src/components/common/Button';
import Input from '../../../src/components/common/Input';
import Select from '../../../src/components/common/Select';
import { clientsApi } from '../../../src/api';

const schema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido'),
  phone: yup.string().required('Telefone é obrigatório'),
  document: yup.string(),
  type: yup.string().required('Tipo é obrigatório'),
  address: yup.object({
    street: yup.string(),
    number: yup.string(),
    complement: yup.string(),
    neighborhood: yup.string(),
    city: yup.string(),
    state: yup.string(),
    zipCode: yup.string(),
  }),
});

export default function EditClientScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsApi.getById(id),
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      document: '',
      type: 'individual',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
      },
    },
  });

  useEffect(() => {
    if (client) {
      reset({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        document: client.document || '',
        type: client.type || 'individual',
        address: {
          street: client.address?.street || '',
          number: client.address?.number || '',
          complement: client.address?.complement || '',
          neighborhood: client.address?.neighborhood || '',
          city: client.address?.city || '',
          state: client.address?.state || '',
          zipCode: client.address?.zipCode || '',
        },
      });
    }
  }, [client, reset]);

  const updateMutation = useMutation({
    mutationFn: (data) => clientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['client', id]);
      queryClient.invalidateQueries(['clients']);
      Alert.alert('Sucesso', 'Cliente atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error) => {
      Alert.alert('Erro', error.message || 'Erro ao atualizar cliente');
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-500">Carregando...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Editar Cliente</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Dados Pessoais</Text>

          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Tipo"
                value={value}
                onValueChange={onChange}
                items={[
                  { label: 'Pessoa Física', value: 'individual' },
                  { label: 'Pessoa Jurídica', value: 'company' },
                ]}
                required
                error={errors.type?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Nome"
                value={value}
                onChangeText={onChange}
                placeholder="Nome completo"
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
                label="CPF/CNPJ"
                value={value}
                onChangeText={onChange}
                placeholder="000.000.000-00"
                keyboardType="numeric"
                error={errors.document?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Telefone"
                value={value}
                onChangeText={onChange}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                error={errors.phone?.message}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                value={value}
                onChangeText={onChange}
                placeholder="email@exemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />
            )}
          />
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Endereço</Text>

          <Controller
            control={control}
            name="address.zipCode"
            render={({ field: { onChange, value } }) => (
              <Input
                label="CEP"
                value={value}
                onChangeText={onChange}
                placeholder="00000-000"
                keyboardType="numeric"
              />
            )}
          />

          <Controller
            control={control}
            name="address.street"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Rua"
                value={value}
                onChangeText={onChange}
                placeholder="Nome da rua"
              />
            )}
          />

          <View className="flex-row">
            <View className="flex-1 mr-2">
              <Controller
                control={control}
                name="address.number"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Número"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Nº"
                  />
                )}
              />
            </View>
            <View className="flex-1 ml-2">
              <Controller
                control={control}
                name="address.complement"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Complemento"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Apto, sala..."
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="address.neighborhood"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Bairro"
                value={value}
                onChangeText={onChange}
                placeholder="Nome do bairro"
              />
            )}
          />

          <View className="flex-row">
            <View className="flex-1 mr-2">
              <Controller
                control={control}
                name="address.city"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Cidade"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Cidade"
                  />
                )}
              />
            </View>
            <View className="w-24 ml-2">
              <Controller
                control={control}
                name="address.state"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="UF"
                    value={value}
                    onChangeText={onChange}
                    placeholder="UF"
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                )}
              />
            </View>
          </View>
        </Card>

        <View className="flex-row mb-8">
          <Button
            title="Cancelar"
            onPress={() => router.back()}
            variant="outline"
            className="flex-1 mr-2"
          />
          <Button
            title="Salvar"
            onPress={handleSubmit(onSubmit)}
            loading={updateMutation.isPending}
            className="flex-1 ml-2"
          />
        </View>
      </ScrollView>
    </View>
  );
}
