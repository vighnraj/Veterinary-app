import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import Card from '../../src/components/common/Card';
import Badge from '../../src/components/common/Badge';
import Tabs from '../../src/components/common/Tabs';
import { sanitaryApi } from '../../src/api';
import { formatDate } from '../../src/utils/formatters';

const tabs = [
  { key: 'pending', label: 'Pendentes', icon: 'alert-circle' },
  { key: 'overdue', label: 'Atrasadas', icon: 'warning' },
  { key: 'completed', label: 'Realizadas', icon: 'checkmark-circle' },
];

export default function VaccinationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pending');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['vaccinations', activeTab],
    queryFn: () => sanitaryApi.getVaccinations({ status: activeTab }),
  });

  const vaccinations = data?.vaccinations || [];

  const getStatusBadge = (item) => {
    const today = new Date();
    const dueDate = new Date(item.dueDate);

    if (item.appliedAt) {
      return { label: 'Aplicada', variant: 'success' };
    }
    if (dueDate < today) {
      return { label: 'Atrasada', variant: 'danger' };
    }
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      return { label: `${diffDays} dias`, variant: 'warning' };
    }
    return { label: `${diffDays} dias`, variant: 'info' };
  };

  const renderVaccination = ({ item }) => {
    const status = getStatusBadge(item);

    return (
      <TouchableOpacity onPress={() => router.push(`/sanitary/record?vaccinationId=${item.id}`)}>
        <Card className="mb-3">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">{item.vaccineName}</Text>
              <Text className="text-gray-500">{item.animal?.name || 'Animal não identificado'}</Text>
            </View>
            <Badge label={status.label} variant={status.variant} />
          </View>

          <View className="flex-row items-center mt-2 pt-2 border-t border-gray-100">
            <View className="flex-row items-center flex-1">
              <Ionicons name="calendar" size={16} color="#6b7280" />
              <Text className="text-gray-500 ml-1">
                Vencimento: {formatDate(item.dueDate)}
              </Text>
            </View>
            {item.appliedAt && (
              <View className="flex-row items-center">
                <Ionicons name="checkmark" size={16} color="#10b981" />
                <Text className="text-green-600 ml-1 text-sm">
                  {formatDate(item.appliedAt)}
                </Text>
              </View>
            )}
          </View>
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
        <Text className="text-lg font-bold text-gray-900">Vacinações</Text>
      </View>

      {/* Tabs */}
      <View className="bg-white">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </View>

      {/* List */}
      <FlatList
        data={vaccinations}
        keyExtractor={(item) => item.id}
        renderItem={renderVaccination}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="medical-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-2">
              {activeTab === 'pending' && 'Nenhuma vacinação pendente'}
              {activeTab === 'overdue' && 'Nenhuma vacinação atrasada'}
              {activeTab === 'completed' && 'Nenhuma vacinação registrada'}
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/sanitary/record')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary-500 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
