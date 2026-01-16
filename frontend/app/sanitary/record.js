import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Card from '../../src/components/common/Card';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import Select from '../../src/components/common/Select';
import { sanitaryApi, animalsApi } from '../../src/api';

const schema = yup.object({
  animalId: yup.string().required('Animal é obrigatório'),
  type: yup.string().required('Tipo é obrigatório'),
  productName: yup.string().required('Nome do produto é obrigatório'),
  manufacturer: yup.string(),
  batchNumber: yup.string(),
  applicationDate: yup.string().required('Data de aplicação é obrigatória'),
  nextDueDate: yup.string(),
  dosage: yup.string(),
  notes: yup.string(),
});

const typeOptions = [
  { label: 'Vacina', value: 'vaccine' },
  { label: 'Vermífugo', value: 'dewormer' },
  { label: 'Medicamento', value: 'medication' },
  { label: 'Tratamento', value: 'treatment' },
];

export default function RecordSanitaryScreen() {
  const { vaccinationId, animalId: preselectedAnimalId } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: animalsData } = useQuery({
    queryKey: ['animals'],
    queryFn: () => animalsApi.getAll({ limit: 100 }),
  });

  const animals = animalsData?.animals || [];

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      animalId: preselectedAnimalId || '',
      type: 'vaccine',
      productName: '',
      manufacturer: '',
      batchNumber: '',
      applicationDate: new Date().toISOString().split('T')[0],
      nextDueDate: '',
      dosage: '',
      notes: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: sanitaryApi.recordApplication,
    onSuccess: () => {
      queryClient.invalidateQueries(['sanitary']);
      queryClient.invalidateQueries(['vaccinations']);
      Alert.alert('Sucesso', 'Registro sanitário salvo com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error) => {
      Alert.alert('Erro', error.message || 'Erro ao salvar registro');
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate({
      ...data,
      vaccinationId: vaccinationId || null,
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Registrar Aplicação</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Animal</Text>

          <Controller
            control={control}
            name="animalId"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Selecione o Animal"
                value={value}
                onValueChange={onChange}
                items={animals.map(a => ({ label: `${a.name} (${a.species})`, value: a.id }))}
                placeholder="Selecione um animal"
                required
                error={errors.animalId?.message}
              />
            )}
          />
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Produto</Text>

          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Tipo"
                value={value}
                onValueChange={onChange}
                items={typeOptions}
                required
                error={errors.type?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="productName"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Nome do Produto"
                value={value}
                onChangeText={onChange}
                placeholder="Ex: Ivermectina 1%"
                required
                error={errors.productName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="manufacturer"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Fabricante"
                value={value}
                onChangeText={onChange}
                placeholder="Nome do fabricante"
              />
            )}
          />

          <View className="flex-row">
            <View className="flex-1 mr-2">
              <Controller
                control={control}
                name="batchNumber"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Lote"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Nº do lote"
                  />
                )}
              />
            </View>
            <View className="flex-1 ml-2">
              <Controller
                control={control}
                name="dosage"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Dosagem"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Ex: 1ml/50kg"
                  />
                )}
              />
            </View>
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Datas</Text>

          <Controller
            control={control}
            name="applicationDate"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Data de Aplicação"
                value={value}
                onChangeText={onChange}
                placeholder="AAAA-MM-DD"
                required
                error={errors.applicationDate?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="nextDueDate"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Próxima Aplicação"
                value={value}
                onChangeText={onChange}
                placeholder="AAAA-MM-DD"
              />
            )}
          />
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Observações</Text>

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                placeholder="Observações adicionais..."
                multiline
                numberOfLines={4}
                style={{ height: 100, textAlignVertical: 'top' }}
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
            loading={createMutation.isPending}
            className="flex-1 ml-2"
          />
        </View>
      </ScrollView>
    </View>
  );
}
