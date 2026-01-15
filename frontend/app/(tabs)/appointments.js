import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import dayjs from 'dayjs';
import { appointmentsApi } from '../../src/api';
import { Loading, EmptyState, Badge } from '../../src/components/common';
import { QUERY_KEYS, STATUS_COLORS } from '../../src/constants/config';

function AppointmentCard({ appointment, onPress }) {
  const statusVariants = {
    scheduled: 'primary',
    confirmed: 'success',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-primary-100 rounded-lg items-center justify-center mr-3">
            <Text className="text-primary-600 font-bold">
              {dayjs(appointment.scheduledDate).format('DD')}
            </Text>
            <Text className="text-primary-600 text-xs">
              {dayjs(appointment.scheduledDate).format('MMM')}
            </Text>
          </View>
          <View>
            <Text className="font-semibold text-gray-900">
              {appointment.client?.name}
            </Text>
            <Text className="text-gray-500 text-sm">
              {dayjs(appointment.scheduledDate).format('HH:mm')}
            </Text>
          </View>
        </View>
        <Badge variant={statusVariants[appointment.status] || 'secondary'} size="sm">
          {appointment.status}
        </Badge>
      </View>

      {/* Services */}
      <View className="bg-gray-50 rounded-lg p-3">
        {appointment.appointmentServices?.slice(0, 2).map((service, index) => (
          <View key={index} className="flex-row items-center mb-1">
            <Ionicons name="medical-outline" size={14} color="#6b7280" />
            <Text className="text-gray-600 text-sm ml-2">
              {service.service?.name}
            </Text>
          </View>
        ))}
        {appointment.appointmentServices?.length > 2 && (
          <Text className="text-gray-400 text-sm">
            +{appointment.appointmentServices.length - 2} more
          </Text>
        )}
      </View>

      {/* Animal count */}
      <View className="flex-row items-center mt-3">
        <Ionicons name="paw-outline" size={14} color="#9ca3af" />
        <Text className="text-gray-500 text-sm ml-1">
          {appointment._count?.appointmentAnimals || 0} animals
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AppointmentsScreen() {
  const [filter, setFilter] = useState('upcoming');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [QUERY_KEYS.APPOINTMENTS, filter],
    queryFn: () => {
      if (filter === 'today') {
        return appointmentsApi.getToday();
      }
      if (filter === 'upcoming') {
        return appointmentsApi.getUpcoming(14);
      }
      return appointmentsApi.getAll({ status: filter });
    },
  });

  const appointments = data?.data || [];

  const filters = [
    { key: 'today', label: 'Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      {/* Filter tabs */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row">
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              className={`mr-3 px-4 py-2 rounded-full ${
                filter === f.key ? 'bg-primary-600' : 'bg-gray-100'
              }`}
              onPress={() => setFilter(f.key)}
            >
              <Text
                className={`text-sm font-medium ${
                  filter === f.key ? 'text-white' : 'text-gray-600'
                }`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            onPress={() => router.push(`/appointments/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No Appointments"
            message={filter === 'today' ? 'No appointments scheduled for today' : 'No appointments found'}
            actionLabel="Schedule Appointment"
            onAction={() => router.push('/appointments/new')}
          />
        }
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/appointments/new')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
