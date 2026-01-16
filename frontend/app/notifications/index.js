import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';
import { Loading, EmptyState, Badge } from '../../src/components/common';
import { notificationsApi } from '../../src/api';
import { QUERY_KEYS } from '../../src/constants/config';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

const NOTIFICATION_CONFIG = {
  appointment_reminder: {
    icon: 'calendar',
    color: '#2563eb',
    bg: 'bg-primary-100',
  },
  vaccine_due: {
    icon: 'shield-checkmark',
    color: '#f59e0b',
    bg: 'bg-warning-100',
  },
  payment_due: {
    icon: 'cash',
    color: '#ef4444',
    bg: 'bg-danger-100',
  },
  pregnancy_check: {
    icon: 'heart',
    color: '#ec4899',
    bg: 'bg-pink-100',
  },
  calving_alert: {
    icon: 'happy',
    color: '#22c55e',
    bg: 'bg-success-100',
  },
  subscription: {
    icon: 'ribbon',
    color: '#8b5cf6',
    bg: 'bg-purple-100',
  },
  system: {
    icon: 'information-circle',
    color: '#6b7280',
    bg: 'bg-gray-100',
  },
};

function NotificationItem({ notification, onPress, onMarkRead }) {
  const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.system;
  const isUnread = !notification.readAt;

  return (
    <TouchableOpacity
      onPress={() => onPress(notification)}
      className={`flex-row p-4 border-b border-gray-100 ${isUnread ? 'bg-primary-50' : 'bg-white'}`}
    >
      <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${config.bg}`}>
        <Ionicons name={config.icon} size={24} color={config.color} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-start justify-between mb-1">
          <Text className={`flex-1 font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
            {notification.title}
          </Text>
          {isUnread && (
            <View className="w-2 h-2 bg-primary-500 rounded-full ml-2 mt-1" />
          )}
        </View>
        <Text className="text-gray-500 text-sm mb-2" numberOfLines={2}>
          {notification.message}
        </Text>
        <Text className="text-gray-400 text-xs">
          {dayjs(notification.createdAt).fromNow()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function FilterChip({ label, active, onPress, count }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-2 flex-row items-center ${
        active ? 'bg-primary-500' : 'bg-gray-200'
      }`}
    >
      <Text className={`font-medium ${active ? 'text-white' : 'text-gray-600'}`}>
        {label}
      </Text>
      {count > 0 && (
        <View className={`ml-2 px-2 py-0.5 rounded-full ${active ? 'bg-white' : 'bg-primary-500'}`}>
          <Text className={`text-xs font-bold ${active ? 'text-primary-500' : 'text-white'}`}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: notificationsData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, { filter }],
    queryFn: () => notificationsApi.getNotifications({
      unreadOnly: filter === 'unread',
    }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.NOTIFICATIONS]);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.NOTIFICATIONS]);
    },
  });

  const handleNotificationPress = (notification) => {
    // Mark as read if unread
    if (!notification.readAt) {
      markReadMutation.mutate(notification.id);
    }

    // Navigate based on notification type and related entity
    if (notification.relatedId) {
      switch (notification.type) {
        case 'appointment_reminder':
          router.push(`/appointments/${notification.relatedId}`);
          break;
        case 'vaccine_due':
        case 'pregnancy_check':
        case 'calving_alert':
          router.push(`/animals/${notification.relatedId}`);
          break;
        case 'payment_due':
          router.push(`/invoices/${notification.relatedId}`);
          break;
        case 'subscription':
          router.push('/subscription');
          break;
        default:
          break;
      }
    }
  };

  const notifications = notificationsData?.data?.data || [];
  const unreadCount = notifications.filter(n => !n.readAt).length;

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Notificações</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => markAllReadMutation.mutate()}>
            <Text className="text-primary-600 font-medium">Marcar lidas</Text>
          </TouchableOpacity>
        )}
        {unreadCount === 0 && <View className="w-20" />}
      </View>

      {/* Filters */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row">
          <FilterChip
            label="Todas"
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterChip
            label="Não lidas"
            active={filter === 'unread'}
            onPress={() => setFilter('unread')}
            count={unreadCount}
          />
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={handleNotificationPress}
            onMarkRead={() => markReadMutation.mutate(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="Nenhuma notificação"
            message={filter === 'unread' ? 'Todas as notificações foram lidas' : 'Você não tem notificações'}
          />
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        contentContainerStyle={notifications.length === 0 ? { flex: 1 } : undefined}
      />
    </SafeAreaView>
  );
}
