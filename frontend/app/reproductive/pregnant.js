import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import Card from '../../src/components/common/Card';
import Badge from '../../src/components/common/Badge';
import SearchInput from '../../src/components/common/SearchInput';
import { reproductiveApi } from '../../src/api';
import { formatDate } from '../../src/utils/formatters';

export default function PregnantAnimalsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pregnant-animals', search],
    queryFn: () => reproductiveApi.getPregnantAnimals({ search }),
  });

  const animals = data?.animals || [];

  const getPregnancyProgress = (confirmationDate, expectedDueDate) => {
    if (!confirmationDate || !expectedDueDate) return null;

    const now = new Date();
    const start = new Date(confirmationDate);
    const end = new Date(expectedDueDate);
    const total = end - start;
    const elapsed = now - start;
    const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    return { progress, daysRemaining };
  };

  const renderAnimal = ({ item }) => {
    const pregnancy = getPregnancyProgress(
      item.pregnancyConfirmationDate,
      item.expectedDueDate
    );

    return (
      <TouchableOpacity onPress={() => router.push(`/animals/${item.id}`)}>
        <Card className="mb-3">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
              <Text className="text-gray-500">
                {item.species} • {item.breed || 'Sem raça'}
              </Text>
            </View>
            <Badge
              label={pregnancy?.daysRemaining > 0 ? `${pregnancy.daysRemaining} dias` : 'Próximo'}
              variant={pregnancy?.daysRemaining <= 30 ? 'warning' : 'info'}
            />
          </View>

          {/* Pregnancy Progress */}
          {pregnancy && (
            <View className="mt-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-500 text-sm">Progresso da Gestação</Text>
                <Text className="text-gray-700 font-medium">
                  {Math.round(pregnancy.progress)}%
                </Text>
              </View>
              <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-pink-500 rounded-full"
                  style={{ width: `${pregnancy.progress}%` }}
                />
              </View>
            </View>
          )}

          {/* Dates */}
          <View className="flex-row mt-3 pt-3 border-t border-gray-100">
            <View className="flex-1">
              <Text className="text-gray-400 text-xs">Confirmação</Text>
              <Text className="text-gray-700 font-medium">
                {formatDate(item.pregnancyConfirmationDate)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs">Previsão Parto</Text>
              <Text className="text-gray-700 font-medium">
                {formatDate(item.expectedDueDate)}
              </Text>
            </View>
          </View>

          {/* Sire info */}
          {item.lastProcedure?.bull && (
            <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
              <Ionicons name="male" size={16} color="#6b7280" />
              <Text className="text-gray-600 ml-1">
                Touro/Sêmen: {item.lastProcedure.bull}
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Animais Gestantes</Text>
      </View>

      {/* Stats */}
      <View className="p-4 bg-white border-b border-gray-200">
        <View className="flex-row">
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-pink-600">{animals.length}</Text>
            <Text className="text-gray-500 text-sm">Total</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-orange-600">
              {animals.filter(a => {
                const due = new Date(a.expectedDueDate);
                const now = new Date();
                const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
                return days <= 30 && days > 0;
              }).length}
            </Text>
            <Text className="text-gray-500 text-sm">Próx. 30 dias</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-red-600">
              {animals.filter(a => {
                const due = new Date(a.expectedDueDate);
                return due < new Date();
              }).length}
            </Text>
            <Text className="text-gray-500 text-sm">Atrasados</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View className="p-4 bg-white border-b border-gray-200">
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar animais..."
        />
      </View>

      {/* List */}
      <FlatList
        data={animals}
        keyExtractor={(item) => item.id}
        renderItem={renderAnimal}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="heart-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-2">Nenhum animal gestante</Text>
          </View>
        }
      />
    </View>
  );
}
