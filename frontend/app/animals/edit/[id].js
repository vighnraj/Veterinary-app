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
import { animalsApi, clientsApi } from '../../../src/api';

const schema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  species: yup.string().required('Espécie é obrigatória'),
  breed: yup.string(),
  gender: yup.string().required('Sexo é obrigatório'),
  birthDate: yup.string(),
  weight: yup.number().nullable(),
  identifier: yup.string(),
  microchip: yup.string(),
  clientId: yup.string().required('Proprietário é obrigatório'),
});

const speciesOptions = [
  { label: 'Bovino', value: 'bovino' },
  { label: 'Equino', value: 'equino' },
  { label: 'Ovino', value: 'ovino' },
  { label: 'Caprino', value: 'caprino' },
  { label: 'Suíno', value: 'suino' },
  { label: 'Bubalino', value: 'bubalino' },
];

const genderOptions = [
  { label: 'Macho', value: 'male' },
  { label: 'Fêmea', value: 'female' },
];

export default function EditAnimalScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: animal, isLoading } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => animalsApi.getById(id),
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll({ limit: 100 }),
  });

  const clients = clientsData?.clients || [];

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      species: '',
      breed: '',
      gender: '',
      birthDate: '',
      weight: null,
      identifier: '',
      microchip: '',
      clientId: '',
    },
  });

  useEffect(() => {
    if (animal) {
      reset({
        name: animal.name || '',
        species: animal.species || '',
        breed: animal.breed || '',
        gender: animal.gender || '',
        birthDate: animal.birthDate ? animal.birthDate.split('T')[0] : '',
        weight: animal.weight || null,
        identifier: animal.identifier || '',
        microchip: animal.microchip || '',
        clientId: animal.clientId || '',
      });
    }
  }, [animal, reset]);

  const updateMutation = useMutation({
    mutationFn: (data) => animalsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['animal', id]);
      queryClient.invalidateQueries(['animals']);
      Alert.alert('Sucesso', 'Animal atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error) => {
      Alert.alert('Erro', error.message || 'Erro ao atualizar animal');
    },
  });

  const onSubmit = (data) => {
    const payload = {
      ...data,
      weight: data.weight ? parseFloat(data.weight) : null,
    };
    updateMutation.mutate(payload);
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
        <Text className="text-lg font-bold text-gray-900">Editar Animal</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Informações Básicas</Text>

          <Controller
            control={control}
            name="clientId"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Proprietário"
                value={value}
                onValueChange={onChange}
                items={clients.map(c => ({ label: c.name, value: c.id }))}
                placeholder="Selecione o proprietário"
                required
                error={errors.clientId?.message}
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
                placeholder="Nome do animal"
                error={errors.name?.message}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="species"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Espécie"
                value={value}
                onValueChange={onChange}
                items={speciesOptions}
                placeholder="Selecione a espécie"
                required
                error={errors.species?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="breed"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Raça"
                value={value}
                onChangeText={onChange}
                placeholder="Raça do animal"
              />
            )}
          />

          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Sexo"
                value={value}
                onValueChange={onChange}
                items={genderOptions}
                placeholder="Selecione o sexo"
                required
                error={errors.gender?.message}
              />
            )}
          />
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Detalhes</Text>

          <Controller
            control={control}
            name="birthDate"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Data de Nascimento"
                value={value}
                onChangeText={onChange}
                placeholder="AAAA-MM-DD"
              />
            )}
          />

          <Controller
            control={control}
            name="weight"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Peso (kg)"
                value={value ? String(value) : ''}
                onChangeText={(text) => onChange(text ? parseFloat(text) : null)}
                placeholder="Ex: 450"
                keyboardType="decimal-pad"
              />
            )}
          />

          <Controller
            control={control}
            name="identifier"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Identificação"
                value={value}
                onChangeText={onChange}
                placeholder="Brinco, registro, etc."
              />
            )}
          />

          <Controller
            control={control}
            name="microchip"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Microchip"
                value={value}
                onChangeText={onChange}
                placeholder="Número do microchip"
              />
            )}
          />
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
