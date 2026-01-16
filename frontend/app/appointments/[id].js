import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Card, Loading, Badge, Button } from '../../src/components/common';
import { appointmentsApi } from '../../src/api';
import { QUERY_KEYS } from '../../src/constants/config';

const STATUS_CONFIG = {
  scheduled: { color: 'primary', label: 'Agendado', icon: 'calendar-outline' },
  confirmed: { color: 'success', label: 'Confirmado', icon: 'checkmark-circle-outline' },
  in_progress: { color: 'warning', label: 'Em Andamento', icon: 'hourglass-outline' },
  completed: { color: 'success', label: 'Concluído', icon: 'checkmark-done-outline' },
  cancelled: { color: 'danger', label: 'Cancelado', icon: 'close-circle-outline' },
};

function InfoRow({ icon, label, value, onPress }) {
  const content = (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color="#6b7280" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-xs">{label}</Text>
        <Text className="text-gray-900 font-medium">{value || '-'}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={20} color="#9ca3af" />}
    </View>
  );
  if (onPress) return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  return content;
}

function ServiceItem({ service }) {
  return (
    <View className="flex-row items-center py-3 border-b border-gray-50">
      <View className="w-10 h-10 bg-primary-100 rounded-lg items-center justify-center mr-3">
        <Ionicons name="medical" size={20} color="#2563eb" />
      </View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900">{service.service?.name}</Text>
        <Text className="text-gray-500 text-sm">{service.service?.category}</Text>
      </View>
      <Text className="text-gray-900 font-medium">
        R$ {(service.totalPrice || service.unitPrice || 0).toFixed(2)}
      </Text>
    </View>
  );
}

function AnimalItem({ animal, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-3 border-b border-gray-50"
    >
      <View className="w-10 h-10 bg-green-100 rounded-lg items-center justify-center mr-3">
        <Ionicons name="paw" size={20} color="#22c55e" />
      </View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900">{animal.animal?.identifier}</Text>
        <Text className="text-gray-500 text-sm">
          {animal.animal?.species?.name} - {animal.animal?.breed?.name}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );
}

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();

  const { data: appointmentData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.APPOINTMENTS, id],
    queryFn: () => appointmentsApi.getAppointment(id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status) => appointmentsApi.updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.APPOINTMENTS]);
    },
    onError: (error) => {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao atualizar status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => appointmentsApi.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.APPOINTMENTS]);
      router.back();
    },
    onError: (error) => {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao excluir agendamento');
    },
  });

  const handleStatusChange = (newStatus) => {
    Alert.alert(
      'Alterar Status',
      `Deseja alterar o status para "${STATUS_CONFIG[newStatus]?.label}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => updateStatusMutation.mutate(newStatus) },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este agendamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const appointment = appointmentData?.data;
  const statusConfig = STATUS_CONFIG[appointment?.status] || STATUS_CONFIG.scheduled;
  const services = appointment?.appointmentServices || [];
  const animals = appointment?.appointmentAnimals || [];

  const totalValue = services.reduce((acc, s) => acc + (s.totalPrice || s.unitPrice || 0), 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">Agendamento</Text>
          <Text className="text-gray-500 text-sm">
            #{appointment?.appointmentNumber}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Status Card */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 bg-${statusConfig.color}-100`}>
                <Ionicons name={statusConfig.icon} size={24} color={
                  statusConfig.color === 'primary' ? '#2563eb' :
                  statusConfig.color === 'success' ? '#22c55e' :
                  statusConfig.color === 'warning' ? '#f59e0b' : '#ef4444'
                } />
              </View>
              <View>
                <Text className="text-gray-500 text-sm">Status</Text>
                <Text className="text-lg font-bold text-gray-900">{statusConfig.label}</Text>
              </View>
            </View>
            <Badge variant={statusConfig.color} size="md">
              {statusConfig.label}
            </Badge>
          </View>
        </Card>

        {/* Quick Status Actions */}
        {appointment?.status !== 'completed' && appointment?.status !== 'cancelled' && (
          <View className="flex-row mb-4">
            {appointment?.status === 'scheduled' && (
              <Button
                variant="success"
                className="flex-1 mr-2"
                onPress={() => handleStatusChange('confirmed')}
                loading={updateStatusMutation.isPending}
              >
                Confirmar
              </Button>
            )}
            {appointment?.status === 'confirmed' && (
              <Button
                variant="warning"
                className="flex-1 mr-2"
                onPress={() => handleStatusChange('in_progress')}
                loading={updateStatusMutation.isPending}
              >
                Iniciar
              </Button>
            )}
            {appointment?.status === 'in_progress' && (
              <Button
                variant="success"
                className="flex-1 mr-2"
                onPress={() => handleStatusChange('completed')}
                loading={updateStatusMutation.isPending}
              >
                Concluir
              </Button>
            )}
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => handleStatusChange('cancelled')}
              loading={updateStatusMutation.isPending}
            >
              Cancelar
            </Button>
          </View>
        )}

        {/* Appointment Info */}
        <Card title="Informações" className="mb-4">
          <InfoRow
            icon="calendar"
            label="Data e Hora"
            value={dayjs(appointment?.scheduledDate).format('DD/MM/YYYY [às] HH:mm')}
          />
          <InfoRow
            icon="person"
            label="Cliente"
            value={appointment?.client?.name}
            onPress={() => router.push(`/clients/${appointment?.client?.id}`)}
          />
          <InfoRow
            icon="location"
            label="Local"
            value={
              appointment?.location === 'property' ? appointment?.property?.name :
              appointment?.location === 'clinic' ? 'Clínica' : appointment?.locationDetails
            }
          />
          <InfoRow
            icon="time"
            label="Duração Estimada"
            value={appointment?.estimatedDuration ? `${appointment.estimatedDuration} min` : null}
          />
        </Card>

        {/* Services */}
        <Card
          title="Serviços"
          subtitle={`${services.length} serviços`}
          className="mb-4"
        >
          {services.length > 0 ? (
            services.map((service, index) => (
              <ServiceItem key={index} service={service} />
            ))
          ) : (
            <View className="py-4 items-center">
              <Text className="text-gray-500">Nenhum serviço adicionado</Text>
            </View>
          )}
          <View className="flex-row justify-between pt-3 mt-2 border-t border-gray-200">
            <Text className="font-bold text-gray-900">Total</Text>
            <Text className="font-bold text-primary-600">R$ {totalValue.toFixed(2)}</Text>
          </View>
        </Card>

        {/* Animals */}
        <Card
          title="Animais"
          subtitle={`${animals.length} animais`}
          className="mb-4"
        >
          {animals.length > 0 ? (
            animals.map((animal, index) => (
              <AnimalItem
                key={index}
                animal={animal}
                onPress={() => router.push(`/animals/${animal.animal?.id}`)}
              />
            ))
          ) : (
            <View className="py-4 items-center">
              <Text className="text-gray-500">Nenhum animal vinculado</Text>
            </View>
          )}
        </Card>

        {/* Notes */}
        {(appointment?.notes || appointment?.clientNotes) && (
          <Card title="Observações" className="mb-4">
            {appointment?.notes && (
              <View className="mb-3">
                <Text className="text-gray-500 text-xs mb-1">Notas Internas</Text>
                <Text className="text-gray-700">{appointment.notes}</Text>
              </View>
            )}
            {appointment?.clientNotes && (
              <View>
                <Text className="text-gray-500 text-xs mb-1">Notas do Cliente</Text>
                <Text className="text-gray-700">{appointment.clientNotes}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Actions */}
        <View className="flex-row mb-4">
          <Button
            variant="outline"
            className="flex-1 mr-2"
            onPress={() => router.push(`/invoices/new?appointmentId=${id}`)}
          >
            Gerar Fatura
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onPress={() => router.push(`/reports/generate?type=appointment&id=${id}`)}
          >
            Gerar Relatório
          </Button>
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
