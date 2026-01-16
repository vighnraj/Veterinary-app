import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import Card from '../../src/components/common/Card';
import Badge from '../../src/components/common/Badge';
import Tabs from '../../src/components/common/Tabs';
import SearchInput from '../../src/components/common/SearchInput';
import { reproductiveApi } from '../../src/api';
import { formatDate } from '../../src/utils/formatters';

const procedureTypes = [
  { key: 'all', label: 'Todos' },
  { key: 'insemination', label: 'IA' },
  { key: 'ftai', label: 'IATF' },
  { key: 'embryo_transfer', label: 'TE' },
  { key: 'natural', label: 'MN' },
];

const procedureLabels = {
  insemination: { label: 'Inseminação', color: 'info' },
  ftai: { label: 'IATF', color: 'primary' },
  embryo_transfer: { label: 'TE', color: 'warning' },
  natural: { label: 'Monta Natural', color: 'success' },
  pregnancy_check: { label: 'Diagnóstico', color: 'default' },
};

export default function ProceduresScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['procedures', activeTab, search],
    queryFn: () => reproductiveApi.getProcedures({
      type: activeTab !== 'all' ? activeTab : undefined,
      search,
    }),
  });

  const procedures = data?.procedures || [];

  const renderProcedure = ({ item }) => {
    const typeInfo = procedureLabels[item.type] || { label: item.type, color: 'default' };

    return (
      <TouchableOpacity onPress={() => router.push(`/reproductive/procedures/${item.id}`)}>
        <Card className="mb-3">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                {item.animal?.name || 'Animal'}
              </Text>
              <Text className="text-gray-500">
                {item.animal?.species} • {item.animal?.breed || 'Sem raça'}
              </Text>
            </View>
            <Badge label={typeInfo.label} variant={typeInfo.color} />
          </View>

          {/* Procedure Info */}
          <View className="bg-gray-50 rounded-lg p-3 mt-2">
            {item.semen && (
              <View className="flex-row items-center mb-1">
                <Ionicons name="flask" size={14} color="#6b7280" />
                <Text className="text-gray-600 ml-1 text-sm">
                  Sêmen: {item.semen}
                </Text>
              </View>
            )}
            {item.bull && (
              <View className="flex-row items-center mb-1">
                <Ionicons name="male" size={14} color="#6b7280" />
                <Text className="text-gray-600 ml-1 text-sm">
                  Touro: {item.bull}
                </Text>
              </View>
            )}
            {item.technician && (
              <View className="flex-row items-center">
                <Ionicons name="person" size={14} color="#6b7280" />
                <Text className="text-gray-600 ml-1 text-sm">
                  Técnico: {item.technician}
                </Text>
              </View>
            )}
          </View>

          {/* Date and Status */}
          <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
            <View className="flex-row items-center flex-1">
              <Ionicons name="calendar" size={16} color="#6b7280" />
              <Text className="text-gray-500 ml-1">
                {formatDate(item.date)}
              </Text>
            </View>
            {item.result && (
              <Badge
                label={item.result === 'positive' ? 'Positivo' : 'Negativo'}
                variant={item.result === 'positive' ? 'success' : 'danger'}
              />
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">Procedimentos</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/reproductive/new-procedure')}
          className="bg-primary-500 px-3 py-2 rounded-lg flex-row items-center"
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text className="text-white font-medium ml-1">Novo</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="bg-white">
        <Tabs
          tabs={procedureTypes}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          scrollable
        />
      </View>

      {/* Search */}
      <View className="p-4 bg-white border-b border-gray-200">
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar procedimentos..."
        />
      </View>

      {/* List */}
      <FlatList
        data={procedures}
        keyExtractor={(item) => item.id}
        renderItem={renderProcedure}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="heart-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-2">Nenhum procedimento encontrado</Text>
          </View>
        }
      />
    </View>
  );
}
