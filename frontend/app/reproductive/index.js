import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Loading, Badge } from '../../src/components/common';
import { reproductiveApi } from '../../src/api';
import { QUERY_KEYS } from '../../src/constants/config';

function StatCard({ icon, label, value, color = 'primary', onPress }) {
  const colors = {
    primary: { bg: 'bg-primary-100', icon: '#2563eb' },
    success: { bg: 'bg-success-50', icon: '#22c55e' },
    warning: { bg: 'bg-warning-50', icon: '#f59e0b' },
    danger: { bg: 'bg-danger-50', icon: '#ef4444' },
    pink: { bg: 'bg-pink-100', icon: '#ec4899' },
  };

  const colorConfig = colors[color] || colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-4 flex-1 shadow-sm border border-gray-100"
      disabled={!onPress}
    >
      <View className={`w-10 h-10 rounded-lg ${colorConfig.bg} items-center justify-center mb-3`}>
        <Ionicons name={icon} size={20} color={colorConfig.icon} />
      </View>
      <Text className="text-2xl font-bold text-gray-900">{value}</Text>
      <Text className="text-gray-500 text-sm">{label}</Text>
    </TouchableOpacity>
  );
}

function QuickAction({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center py-3"
      style={{ width: '25%' }}
    >
      <View className={`w-12 h-12 bg-${color}-100 rounded-full items-center justify-center mb-2`}>
        <Ionicons name={icon} size={24} color={
          color === 'pink' ? '#ec4899' :
          color === 'blue' ? '#3b82f6' :
          color === 'green' ? '#22c55e' : '#6b7280'
        } />
      </View>
      <Text className="text-gray-600 text-xs text-center">{label}</Text>
    </TouchableOpacity>
  );
}

function RecentProcedureItem({ procedure }) {
  const typeConfig = {
    heat: { label: 'Cio', color: '#f59e0b', icon: 'flame' },
    insemination: { label: 'Inseminação', color: '#3b82f6', icon: 'water' },
    pregnancy_check: { label: 'Diagnóstico', color: '#ec4899', icon: 'search' },
    birth: { label: 'Parto', color: '#22c55e', icon: 'happy' },
    abortion: { label: 'Aborto', color: '#ef4444', icon: 'sad' },
  };

  const config = typeConfig[procedure.type] || { label: procedure.type, color: '#6b7280', icon: 'ellipse' };

  return (
    <TouchableOpacity
      className="flex-row items-center py-3 border-b border-gray-50"
      onPress={() => router.push(`/animals/${procedure.animalId}`)}
    >
      <View
        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: `${config.color}20` }}
      >
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900">{procedure.animal?.identifier}</Text>
        <Text className="text-gray-500 text-sm">{config.label}</Text>
      </View>
      <Badge
        variant={procedure.result === 'pregnant' ? 'success' : procedure.result === 'open' ? 'warning' : 'secondary'}
        size="sm"
      >
        {procedure.result || '-'}
      </Badge>
    </TouchableOpacity>
  );
}

function PregnantAnimalItem({ animal }) {
  const daysToCalving = animal.expectedCalvingDate
    ? Math.ceil((new Date(animal.expectedCalvingDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <TouchableOpacity
      className="flex-row items-center py-3 border-b border-gray-50"
      onPress={() => router.push(`/animals/${animal.id}`)}
    >
      <View className="w-10 h-10 bg-pink-100 rounded-lg items-center justify-center mr-3">
        <Ionicons name="heart" size={20} color="#ec4899" />
      </View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900">{animal.identifier}</Text>
        <Text className="text-gray-500 text-sm">{animal.client?.name}</Text>
      </View>
      {daysToCalving !== null && (
        <View className="items-end">
          <Text className={`font-bold ${daysToCalving <= 30 ? 'text-danger-600' : 'text-gray-900'}`}>
            {daysToCalving}
          </Text>
          <Text className="text-gray-500 text-xs">dias</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ReproductiveOverviewScreen() {
  const { data: statsData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [QUERY_KEYS.REPRODUCTIVE_STATS],
    queryFn: reproductiveApi.getStats,
  });

  const { data: pregnantData } = useQuery({
    queryKey: [QUERY_KEYS.PREGNANT_ANIMALS],
    queryFn: () => reproductiveApi.getPregnantAnimals({ limit: 5 }),
  });

  const { data: recentData } = useQuery({
    queryKey: [QUERY_KEYS.RECENT_PROCEDURES],
    queryFn: () => reproductiveApi.getProcedures({ limit: 5 }),
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const stats = statsData?.data || {};
  const pregnantAnimals = pregnantData?.data?.data || [];
  const recentProcedures = recentData?.data?.data || [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Manejo Reprodutivo</Text>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View className="p-4">
          {/* Stats Grid */}
          <View className="flex-row mb-4">
            <StatCard
              icon="heart"
              label="Prenhas"
              value={stats.pregnantCount || 0}
              color="pink"
              onPress={() => router.push('/reproductive/pregnant')}
            />
            <View className="w-4" />
            <StatCard
              icon="trending-up"
              label="Taxa de Prenhez"
              value={`${(stats.pregnancyRate || 0).toFixed(1)}%`}
              color="success"
            />
          </View>
          <View className="flex-row mb-4">
            <StatCard
              icon="water"
              label="Inseminações"
              value={stats.inseminationsThisMonth || 0}
              color="primary"
            />
            <View className="w-4" />
            <StatCard
              icon="happy"
              label="Nascimentos"
              value={stats.birthsThisMonth || 0}
              color="success"
            />
          </View>

          {/* Quick Actions */}
          <Card title="Ações Rápidas" className="mb-4">
            <View className="flex-row flex-wrap">
              <QuickAction
                icon="flame"
                label="Registrar Cio"
                color="warning"
                onPress={() => router.push('/reproductive/new-procedure?type=heat')}
              />
              <QuickAction
                icon="water"
                label="Inseminação"
                color="blue"
                onPress={() => router.push('/reproductive/new-procedure?type=insemination')}
              />
              <QuickAction
                icon="search"
                label="Diagnóstico"
                color="pink"
                onPress={() => router.push('/reproductive/new-procedure?type=pregnancy_check')}
              />
              <QuickAction
                icon="happy"
                label="Parto"
                color="green"
                onPress={() => router.push('/reproductive/new-procedure?type=birth')}
              />
            </View>
          </Card>

          {/* Pregnant Animals */}
          <Card
            title="Animais Prenhas"
            subtitle={`${pregnantAnimals.length} próximos partos`}
            headerAction={
              <TouchableOpacity onPress={() => router.push('/reproductive/pregnant')}>
                <Text className="text-primary-600 font-medium">Ver todos</Text>
              </TouchableOpacity>
            }
            className="mb-4"
          >
            {pregnantAnimals.length > 0 ? (
              pregnantAnimals.map((animal, index) => (
                <PregnantAnimalItem key={index} animal={animal} />
              ))
            ) : (
              <View className="py-4 items-center">
                <Text className="text-gray-500">Nenhum animal prenhe registrado</Text>
              </View>
            )}
          </Card>

          {/* Recent Procedures */}
          <Card
            title="Procedimentos Recentes"
            headerAction={
              <TouchableOpacity onPress={() => router.push('/reproductive/procedures')}>
                <Text className="text-primary-600 font-medium">Ver todos</Text>
              </TouchableOpacity>
            }
            className="mb-4"
          >
            {recentProcedures.length > 0 ? (
              recentProcedures.map((procedure, index) => (
                <RecentProcedureItem key={index} procedure={procedure} />
              ))
            ) : (
              <View className="py-4 items-center">
                <Text className="text-gray-500">Nenhum procedimento registrado</Text>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
