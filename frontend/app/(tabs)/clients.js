import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { clientsApi } from '../../src/api';
import { Loading, EmptyState, Card, Badge } from '../../src/components/common';
import { QUERY_KEYS } from '../../src/constants/config';

function ClientCard({ client, onPress }) {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-3">
          <Text className="text-primary-600 font-bold text-lg">
            {client.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-900 text-lg">{client.name}</Text>
          {client.phone && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="call-outline" size={14} color="#9ca3af" />
              <Text className="text-gray-500 text-sm ml-1">{client.phone}</Text>
            </View>
          )}
          {client.city && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={14} color="#9ca3af" />
              <Text className="text-gray-500 text-sm ml-1">
                {client.city}{client.state ? `, ${client.state}` : ''}
              </Text>
            </View>
          )}
        </View>
        <View className="items-end">
          <View className="flex-row items-center">
            <Ionicons name="paw-outline" size={14} color="#9ca3af" />
            <Text className="text-gray-500 text-sm ml-1">
              {client._count?.animals || 0}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" className="mt-2" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ClientsScreen() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [QUERY_KEYS.CLIENTS, { search, page }],
    queryFn: () => clientsApi.getAll({ search, page, limit: 20 }),
  });

  const clients = data?.data || [];
  const pagination = data?.pagination;

  const renderHeader = () => (
    <View className="px-4 py-3 bg-gray-50">
      <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
        <Ionicons name="search-outline" size={20} color="#9ca3af" />
        <TextInput
          className="flex-1 ml-3 text-gray-900"
          placeholder="Search clients..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
      <Text className="text-gray-500 text-sm mt-2">
        {pagination?.total || 0} clients found
      </Text>
    </View>
  );

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ClientCard
            client={item}
            onPress={() => router.push(`/clients/${item.id}`)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No Clients Yet"
            message="Add your first client to get started"
            actionLabel="Add Client"
            onAction={() => router.push('/clients/new')}
          />
        }
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        onEndReached={() => {
          if (pagination?.hasNext) {
            setPage(page + 1);
          }
        }}
        onEndReachedThreshold={0.5}
      />

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/clients/new')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
