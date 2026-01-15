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
import { animalsApi } from '../../src/api';
import { Loading, EmptyState, Badge } from '../../src/components/common';
import { QUERY_KEYS, STATUS_COLORS, ANIMAL_SEX, REPRODUCTIVE_STATUS } from '../../src/constants/config';

function AnimalCard({ animal, onPress }) {
  const statusColor = STATUS_COLORS[animal.status] || STATUS_COLORS.active;

  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        <View className="w-14 h-14 bg-primary-100 rounded-xl items-center justify-center mr-3">
          <Ionicons name="paw" size={28} color="#2563eb" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="font-bold text-gray-900 text-lg">{animal.identifier}</Text>
            {animal.name && (
              <Text className="text-gray-500 ml-2">({animal.name})</Text>
            )}
          </View>
          <View className="flex-row items-center mt-1">
            <Text className="text-gray-600 text-sm">
              {animal.species?.name} • {animal.breed?.name || 'Mixed'}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Ionicons
              name={animal.sex === 'male' ? 'male' : 'female'}
              size={14}
              color={animal.sex === 'male' ? '#3b82f6' : '#ec4899'}
            />
            <Text className="text-gray-500 text-sm ml-1 mr-3">
              {ANIMAL_SEX[animal.sex]}
            </Text>
            {animal.reproductiveStatus && (
              <>
                <Ionicons name="heart-outline" size={14} color="#9ca3af" />
                <Text className="text-gray-500 text-sm ml-1">
                  {REPRODUCTIVE_STATUS[animal.reproductiveStatus]}
                </Text>
              </>
            )}
          </View>
        </View>
        <View className="items-end">
          <Badge variant={animal.status === 'active' ? 'success' : 'secondary'} size="sm">
            {animal.status}
          </Badge>
          <Text className="text-gray-400 text-xs mt-2">
            {animal.client?.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function AnimalsScreen() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [QUERY_KEYS.ANIMALS, { search, page, ...filters }],
    queryFn: () => animalsApi.getAll({ search, page, limit: 20, ...filters }),
  });

  const animals = data?.data || [];
  const pagination = data?.pagination;

  const renderHeader = () => (
    <View className="px-4 py-3 bg-gray-50">
      <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200">
        <Ionicons name="search-outline" size={20} color="#9ca3af" />
        <TextInput
          className="flex-1 ml-3 text-gray-900"
          placeholder="Search animals..."
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

      {/* Filter chips */}
      <View className="flex-row mt-3">
        {['All', 'Bovine', 'Equine', 'Pregnant'].map((filter) => (
          <TouchableOpacity
            key={filter}
            className={`mr-2 px-4 py-2 rounded-full ${
              filters.filter === filter ? 'bg-primary-600' : 'bg-white border border-gray-200'
            }`}
            onPress={() => setFilters(filter === 'All' ? {} : { filter })}
          >
            <Text
              className={`text-sm ${
                filters.filter === filter ? 'text-white' : 'text-gray-700'
              }`}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-gray-500 text-sm mt-3">
        {pagination?.total || 0} animals found
      </Text>
    </View>
  );

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <FlatList
        data={animals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnimalCard
            animal={item}
            onPress={() => router.push(`/animals/${item.id}`)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="paw-outline"
            title="No Animals Yet"
            message="Register your first animal to get started"
            actionLabel="Add Animal"
            onAction={() => router.push('/animals/new')}
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
        onPress={() => router.push('/animals/new')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
