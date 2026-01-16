import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import Card from '../../src/components/common/Card';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import Select from '../../src/components/common/Select';
import { reportsApi } from '../../src/api';

const reportConfig = {
  animals: {
    title: 'Relatório de Animais',
    icon: 'paw',
    color: '#10b981',
    filters: ['species', 'status', 'client'],
  },
  health: {
    title: 'Relatório Sanitário',
    icon: 'medkit',
    color: '#ef4444',
    filters: ['dateRange', 'type', 'species'],
  },
  reproductive: {
    title: 'Relatório Reprodutivo',
    icon: 'heart',
    color: '#ec4899',
    filters: ['dateRange', 'procedureType', 'species'],
  },
  financial: {
    title: 'Relatório Financeiro',
    icon: 'cash',
    color: '#f59e0b',
    filters: ['dateRange', 'status', 'client'],
  },
  appointments: {
    title: 'Relatório de Atendimentos',
    icon: 'calendar',
    color: '#3b82f6',
    filters: ['dateRange', 'status', 'client'],
  },
  clients: {
    title: 'Relatório de Clientes',
    icon: 'people',
    color: '#8b5cf6',
    filters: ['type', 'status'],
  },
};

const speciesOptions = [
  { label: 'Todos', value: '' },
  { label: 'Bovino', value: 'bovino' },
  { label: 'Equino', value: 'equino' },
  { label: 'Ovino', value: 'ovino' },
  { label: 'Caprino', value: 'caprino' },
];

const formatOptions = [
  { label: 'PDF', value: 'pdf' },
  { label: 'Excel', value: 'excel' },
  { label: 'CSV', value: 'csv' },
];

export default function GenerateReportScreen() {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const config = reportConfig[type] || reportConfig.animals;

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    species: '',
    status: '',
    format: 'pdf',
  });

  const generateMutation = useMutation({
    mutationFn: () => reportsApi.generate(type, filters),
    onSuccess: (data) => {
      if (data.url) {
        Alert.alert(
          'Relatório Gerado',
          'O relatório foi gerado com sucesso. Deseja compartilhar?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Compartilhar',
              onPress: () => Share.share({ url: data.url }),
            },
          ]
        );
      } else {
        Alert.alert('Sucesso', 'Relatório gerado com sucesso!');
      }
    },
    onError: (error) => {
      Alert.alert('Erro', error.message || 'Erro ao gerar relatório');
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">{config.title}</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Report Info */}
        <Card className="mb-4">
          <View className="flex-row items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Ionicons name={config.icon} size={32} color={config.color} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">{config.title}</Text>
              <Text className="text-gray-500">Configure os filtros abaixo</Text>
            </View>
          </View>
        </Card>

        {/* Date Range */}
        {config.filters.includes('dateRange') && (
          <Card className="mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-4">Período</Text>

            <Input
              label="Data Inicial"
              value={filters.startDate}
              onChangeText={(value) => setFilters(prev => ({ ...prev, startDate: value }))}
              placeholder="AAAA-MM-DD"
            />

            <Input
              label="Data Final"
              value={filters.endDate}
              onChangeText={(value) => setFilters(prev => ({ ...prev, endDate: value }))}
              placeholder="AAAA-MM-DD"
            />
          </Card>
        )}

        {/* Species Filter */}
        {config.filters.includes('species') && (
          <Card className="mb-4">
            <Text className="text-lg font-bold text-gray-900 mb-4">Espécie</Text>

            <Select
              value={filters.species}
              onValueChange={(value) => setFilters(prev => ({ ...prev, species: value }))}
              items={speciesOptions}
              placeholder="Todas as espécies"
            />
          </Card>
        )}

        {/* Format Selection */}
        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Formato</Text>

          <View className="flex-row">
            {formatOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setFilters(prev => ({ ...prev, format: option.value }))}
                className={`flex-1 py-3 items-center rounded-lg mr-2 ${
                  filters.format === option.value
                    ? 'bg-primary-500'
                    : 'bg-gray-100'
                }`}
              >
                <Ionicons
                  name={option.value === 'pdf' ? 'document' : 'grid'}
                  size={24}
                  color={filters.format === option.value ? '#fff' : '#6b7280'}
                />
                <Text
                  className={`font-medium mt-1 ${
                    filters.format === option.value ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Generate Button */}
        <Button
          title="Gerar Relatório"
          onPress={handleGenerate}
          loading={generateMutation.isPending}
          icon={<Ionicons name="download" size={20} color="#fff" />}
          className="mb-8"
        />
      </ScrollView>
    </View>
  );
}
