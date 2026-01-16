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
import { appointmentsApi, clientsApi, servicesApi } from '../../../src/api';

const schema = yup.object({
  clientId: yup.string().required('Cliente é obrigatório'),
  scheduledDate: yup.string().required('Data é obrigatória'),
  scheduledTime: yup.string().required('Hora é obrigatória'),
  notes: yup.string(),
  status: yup.string().required('Status é obrigatório'),
});

const statusOptions = [
  { label: 'Agendado', value: 'scheduled' },
  { label: 'Confirmado', value: 'confirmed' },
  { label: 'Em Andamento', value: 'in_progress' },
  { label: 'Concluído', value: 'completed' },
  { label: 'Cancelado', value: 'cancelled' },
];

export default function EditAppointmentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: appointment, isLoading } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentsApi.getById(id),
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll({ limit: 100 }),
  });

  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.getAll({ limit: 100 }),
  });

  const clients = clientsData?.clients || [];
  const services = servicesData?.services || [];

  const [selectedServices, setSelectedServices] = useState([]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      clientId: '',
      scheduledDate: '',
      scheduledTime: '',
      notes: '',
      status: 'scheduled',
    },
  });

  useEffect(() => {
    if (appointment) {
      const scheduledAt = new Date(appointment.scheduledAt);
      reset({
        clientId: appointment.clientId || '',
        scheduledDate: scheduledAt.toISOString().split('T')[0],
        scheduledTime: scheduledAt.toTimeString().slice(0, 5),
        notes: appointment.notes || '',
        status: appointment.status || 'scheduled',
      });
      if (appointment.services) {
        setSelectedServices(appointment.services.map(s => s.id));
      }
    }
  }, [appointment, reset]);

  const updateMutation = useMutation({
    mutationFn: (data) => appointmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointment', id]);
      queryClient.invalidateQueries(['appointments']);
      Alert.alert('Sucesso', 'Atendimento atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error) => {
      Alert.alert('Erro', error.message || 'Erro ao atualizar atendimento');
    },
  });

  const toggleService = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  };

  const onSubmit = (data) => {
    const scheduledAt = new Date(`${data.scheduledDate}T${data.scheduledTime}:00`);

    const payload = {
      clientId: data.clientId,
      scheduledAt: scheduledAt.toISOString(),
      notes: data.notes,
      status: data.status,
      serviceIds: selectedServices,
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
        <Text className="text-lg font-bold text-gray-900">Editar Atendimento</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Informações</Text>

          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Status"
                value={value}
                onValueChange={onChange}
                items={statusOptions}
                required
                error={errors.status?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="clientId"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Cliente"
                value={value}
                onValueChange={onChange}
                items={clients.map(c => ({ label: c.name, value: c.id }))}
                placeholder="Selecione o cliente"
                required
                error={errors.clientId?.message}
              />
            )}
          />
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Data e Hora</Text>

          <Controller
            control={control}
            name="scheduledDate"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Data"
                value={value}
                onChangeText={onChange}
                placeholder="AAAA-MM-DD"
                required
                error={errors.scheduledDate?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="scheduledTime"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Hora"
                value={value}
                onChangeText={onChange}
                placeholder="HH:MM"
                required
                error={errors.scheduledTime?.message}
              />
            )}
          />
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Serviços</Text>

          {services.length === 0 ? (
            <Text className="text-gray-500">Nenhum serviço disponível</Text>
          ) : (
            services.map(service => (
              <TouchableOpacity
                key={service.id}
                onPress={() => toggleService(service.id)}
                className={`p-3 rounded-lg mb-2 flex-row items-center justify-between ${
                  selectedServices.includes(service.id)
                    ? 'bg-primary-50 border border-primary-500'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <View className="flex-1">
                  <Text className={`font-medium ${
                    selectedServices.includes(service.id)
                      ? 'text-primary-700'
                      : 'text-gray-900'
                  }`}>
                    {service.name}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    R$ {service.price?.toFixed(2) || '0.00'}
                  </Text>
                </View>
                <Ionicons
                  name={selectedServices.includes(service.id) ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={selectedServices.includes(service.id) ? '#2563eb' : '#9ca3af'}
                />
              </TouchableOpacity>
            ))
          )}
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
            loading={updateMutation.isPending}
            className="flex-1 ml-2"
          />
        </View>
      </ScrollView>
    </View>
  );
}
