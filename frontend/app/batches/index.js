import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import Card from '../../src/components/common/Card';
import Badge from '../../src/components/common/Badge';
import SearchInput from '../../src/components/common/SearchInput';
import { batchesApi } from '../../src/api';

export default function BatchesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['batches', search],
    queryFn: () => batchesApi.getAll({ search }),
  });

  const batches = data?.batches || [];

  const renderBatch = ({ item }) => (
    <TouchableOpacity onPress={() => router.push(`/batches/${item.id}`)}>
      <Card className="mb-3">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
            <Text className="text-gray-500">{item.description || 'Sem descrição'}</Text>
          </View>
          <Badge
            label={`${item._count?.animals || 0} animais`}
            variant="info"
          />
        </View>

        <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
          <View className="flex-row items-center flex-1">
            <Ionicons name="location" size={16} color="#6b7280" />
            <Text className="text-gray-500 ml-1">{item.location || 'Sem local'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">Lotes</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/batches/new')}
          className="bg-primary-500 px-3 py-2 rounded-lg flex-row items-center"
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text className="text-white font-medium ml-1">Novo</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="p-4 bg-white border-b border-gray-200">
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar lotes..."
        />
      </View>

      {/* List */}
      <FlatList
        data={batches}
        keyExtractor={(item) => item.id}
        renderItem={renderBatch}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="layers-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-2">Nenhum lote encontrado</Text>
          </View>
        }
      />
    </View>
  );
}
