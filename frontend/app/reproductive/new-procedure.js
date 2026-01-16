import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Card from '../../src/components/common/Card';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import Select from '../../src/components/common/Select';
import { reproductiveApi, animalsApi } from '../../src/api';

const schema = yup.object({
  animalId: yup.string().required('Animal é obrigatório'),
  type: yup.string().required('Tipo é obrigatório'),
  date: yup.string().required('Data é obrigatória'),
  bull: yup.string(),
  semen: yup.string(),
  technician: yup.string(),
  protocol: yup.string(),
  notes: yup.string(),
});

const procedureTypeOptions = [
  { label: 'Inseminação Artificial (IA)', value: 'insemination' },
  { label: 'IATF', value: 'ftai' },
  { label: 'Transferência de Embriões (TE)', value: 'embryo_transfer' },
  { label: 'Monta Natural', value: 'natural' },
  { label: 'Diagnóstico de Gestação', value: 'pregnancy_check' },
  { label: 'Exame Andrológico', value: 'andrological_exam' },
];

export default function NewProcedureScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: animalsData } = useQuery({
    queryKey: ['animals-female'],
    queryFn: () => animalsApi.getAll({ gender: 'female', limit: 100 }),
  });

  const animals = animalsData?.animals || [];

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      animalId: '',
      type: 'insemination',
      date: new Date().toISOString().split('T')[0],
      bull: '',
      semen: '',
      technician: '',
      protocol: '',
      notes: '',
    },
  });

  const procedureType = watch('type');

  const createMutation = useMutation({
    mutationFn: reproductiveApi.createProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries(['procedures']);
      queryClient.invalidateQueries(['reproductive']);
      Alert.alert('Sucesso', 'Procedimento registrado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error) => {
      Alert.alert('Erro', error.message || 'Erro ao registrar procedimento');
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const showBullFields = ['insemination', 'ftai', 'natural'].includes(procedureType);
  const showProtocolField = procedureType === 'ftai';

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Novo Procedimento</Text>
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
                items={animals.map(a => ({
                  label: `${a.name} (${a.species} - ${a.identifier || 'Sem ID'})`,
                  value: a.id
                }))}
                placeholder="Selecione um animal"
                required
                error={errors.animalId?.message}
              />
            )}
          />
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Procedimento</Text>

          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Tipo de Procedimento"
                value={value}
                onValueChange={onChange}
                items={procedureTypeOptions}
                required
                error={errors.type?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Data"
                value={value}
                onChangeText={onChange}
                placeholder="AAAA-MM-DD"
                required
                error={errors.date?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="technician"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Técnico Responsável"
                value={value}
                onChangeText={onChange}
                placeholder="Nome do técnico"
              />
            )}
          />
        </Card>

        {showBullFields && (
          <Card className="mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              {procedureType === 'natural' ? 'Touro' : 'Sêmen'}
            </Text>

            {procedureType === 'natural' ? (
              <Controller
                control={control}
                name="bull"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Nome/ID do Touro"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Identificação do touro"
                  />
                )}
              />
            ) : (
              <>
                <Controller
                  control={control}
                  name="semen"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Sêmen (Touro)"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Ex: ABC 1234"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="bull"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Central/Origem"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Central de sêmen"
                    />
                  )}
                />
              </>
            )}
          </Card>
        )}

        {showProtocolField && (
          <Card className="mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-4">Protocolo IATF</Text>

            <Controller
              control={control}
              name="protocol"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Protocolo Utilizado"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Ex: P4 + BE"
                />
              )}
            />
          </Card>
        )}

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
            title="Registrar"
            onPress={handleSubmit(onSubmit)}
            loading={createMutation.isPending}
            className="flex-1 ml-2"
          />
        </View>
      </ScrollView>
    </View>
  );
}
