import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import dayjs from 'dayjs';
import { Card, Loading, Badge } from '../../src/components/common';
import { dashboardApi } from '../../src/api';
import useAuthStore from '../../src/store/authStore';
import { QUERY_KEYS } from '../../src/constants/config';

function StatCard({ icon, label, value, change, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-100',
    success: 'bg-success-50',
    warning: 'bg-warning-50',
    danger: 'bg-danger-50',
  };

  const iconColors = {
    primary: '#2563eb',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  return (
    <View className="bg-white rounded-xl p-4 flex-1 shadow-sm border border-gray-100">
      <View className={`w-10 h-10 rounded-lg ${colors[color]} items-center justify-center mb-3`}>
        <Ionicons name={icon} size={20} color={iconColors[color]} />
      </View>
      <Text className="text-2xl font-bold text-gray-900">{value}</Text>
      <Text className="text-gray-500 text-sm">{label}</Text>
      {change !== undefined && (
        <View className="flex-row items-center mt-1">
          <Ionicons
            name={change >= 0 ? 'arrow-up' : 'arrow-down'}
            size={12}
            color={change >= 0 ? '#22c55e' : '#ef4444'}
          />
          <Text className={`text-xs ml-1 ${change >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
            {Math.abs(change)}% vs last month
          </Text>
        </View>
      )}
    </View>
  );
}

function AppointmentItem({ appointment }) {
  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
      <View className="w-12 h-12 bg-primary-100 rounded-lg items-center justify-center mr-3">
        <Text className="text-primary-600 font-bold">
          {dayjs(appointment.scheduledDate).format('HH')}
        </Text>
        <Text className="text-primary-600 text-xs">
          {dayjs(appointment.scheduledDate).format('mm')}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-gray-900">{appointment.client?.name}</Text>
        <Text className="text-gray-500 text-sm">
          {appointment.appointmentServices?.map(s => s.service?.name).join(', ')}
        </Text>
      </View>
      <Badge
        variant={appointment.status === 'confirmed' ? 'success' : 'primary'}
        size="sm"
      >
        {appointment.status}
      </Badge>
    </TouchableOpacity>
  );
}

function AlertItem({ alert }) {
  const typeIcons = {
    vaccination: 'medical-outline',
    calving: 'heart-outline',
    overdue: 'alert-circle-outline',
  };

  const typeColors = {
    vaccination: '#f59e0b',
    calving: '#ec4899',
    overdue: '#ef4444',
  };

  return (
    <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
      <View
        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: `${typeColors[alert.type]}20` }}
      >
        <Ionicons name={typeIcons[alert.type]} size={20} color={typeColors[alert.type]} />
      </View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900">{alert.title}</Text>
        <Text className="text-gray-500 text-sm">{alert.animal || alert.client}</Text>
      </View>
      <Text className="text-gray-400 text-xs">
        {dayjs(alert.date).format('DD/MM')}
      </Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const { user, account } = useAuthStore();

  const { data: overview, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD],
    queryFn: dashboardApi.getOverview,
  });

  const { data: alerts } = useQuery({
    queryKey: [QUERY_KEYS.ALERTS],
    queryFn: dashboardApi.getAlerts,
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const data = overview?.data || {};
  const allAlerts = [
    ...(alerts?.data?.vaccinations || []),
    ...(alerts?.data?.reproductive || []),
    ...(alerts?.data?.financial || []),
  ].slice(0, 5);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Header */}
        <View className="bg-white px-6 py-4 border-b border-gray-100">
          <Text className="text-gray-500 text-sm">Welcome back,</Text>
          <Text className="text-2xl font-bold text-gray-900">
            {user?.firstName} {user?.lastName}
          </Text>
          {account?.subscriptionStatus === 'trialing' && (
            <View className="mt-2 bg-warning-50 px-3 py-2 rounded-lg flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#f59e0b" />
              <Text className="text-warning-600 text-sm ml-2">
                Trial ends in {dayjs(account.trialEndsAt).diff(dayjs(), 'day')} days
              </Text>
            </View>
          )}
        </View>

        <View className="p-4">
          {/* Stats Grid */}
          <View className="flex-row mb-4">
            <StatCard
              icon="calendar-outline"
              label="Today's Appointments"
              value={data.todayAppointments || 0}
              color="primary"
            />
            <View className="w-4" />
            <StatCard
              icon="paw-outline"
              label="Active Animals"
              value={data.activeAnimals || 0}
              color="success"
            />
          </View>
          <View className="flex-row mb-4">
            <StatCard
              icon="people-outline"
              label="Clients"
              value={data.activeClients || 0}
              color="primary"
            />
            <View className="w-4" />
            <StatCard
              icon="cash-outline"
              label="Pending"
              value={`R$ ${(data.pendingAmount || 0).toFixed(0)}`}
              color={data.pendingAmount > 0 ? 'warning' : 'success'}
            />
          </View>

          {/* Quick Actions */}
          <Card title="Quick Actions" className="mb-4">
            <View className="flex-row flex-wrap">
              {[
                { icon: 'add-circle-outline', label: 'New Client', route: '/clients/new' },
                { icon: 'paw-outline', label: 'New Animal', route: '/animals/new' },
                { icon: 'calendar-outline', label: 'New Appointment', route: '/appointments/new' },
                { icon: 'document-text-outline', label: 'New Invoice', route: '/invoices/new' },
              ].map((action, index) => (
                <TouchableOpacity
                  key={index}
                  className="w-1/4 items-center py-3"
                  onPress={() => router.push(action.route)}
                >
                  <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mb-2">
                    <Ionicons name={action.icon} size={24} color="#2563eb" />
                  </View>
                  <Text className="text-gray-600 text-xs text-center">{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Alerts */}
          {allAlerts.length > 0 && (
            <Card title="Alerts" subtitle="Requires attention" className="mb-4">
              {allAlerts.map((alert, index) => (
                <AlertItem key={index} alert={alert} />
              ))}
            </Card>
          )}

          {/* Recent Activity */}
          {data.recentActivities?.length > 0 && (
            <Card title="Recent Activity" className="mb-4">
              {data.recentActivities.slice(0, 5).map((activity, index) => (
                <View key={index} className="flex-row items-center py-2 border-b border-gray-50">
                  <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="time-outline" size={16} color="#9ca3af" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 text-sm">
                      {activity.action} {activity.entity}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      {activity.user} • {dayjs(activity.createdAt).fromNow()}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
