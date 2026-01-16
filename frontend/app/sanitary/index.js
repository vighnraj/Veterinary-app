import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Card, Loading, Badge } from '../../src/components/common';
import { sanitaryApi } from '../../src/api';
import { QUERY_KEYS } from '../../src/constants/config';

function StatCard({ icon, label, value, color = 'primary', onPress }) {
  const colors = {
    primary: { bg: 'bg-primary-100', icon: '#2563eb' },
    success: { bg: 'bg-success-50', icon: '#22c55e' },
    warning: { bg: 'bg-warning-50', icon: '#f59e0b' },
    danger: { bg: 'bg-danger-50', icon: '#ef4444' },
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
  const iconColors = {
    green: '#22c55e',
    blue: '#3b82f6',
    orange: '#f59e0b',
    purple: '#8b5cf6',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center py-3"
      style={{ width: '25%' }}
    >
      <View className={`w-12 h-12 bg-${color}-100 rounded-full items-center justify-center mb-2`}>
        <Ionicons name={icon} size={24} color={iconColors[color]} />
      </View>
      <Text className="text-gray-600 text-xs text-center">{label}</Text>
    </TouchableOpacity>
  );
}

function VaccinationAlertItem({ alert }) {
  const daysUntilDue = Math.ceil((new Date(alert.nextDoseDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;
  const isUrgent = daysUntilDue >= 0 && daysUntilDue <= 7;

  return (
    <TouchableOpacity
      className="flex-row items-center py-3 border-b border-gray-50"
      onPress={() => router.push(`/animals/${alert.animalId}`)}
    >
      <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${
        isOverdue ? 'bg-danger-100' : isUrgent ? 'bg-warning-100' : 'bg-primary-100'
      }`}>
        <Ionicons
          name="shield-checkmark"
          size={20}
          color={isOverdue ? '#ef4444' : isUrgent ? '#f59e0b' : '#2563eb'}
        />
      </View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900">{alert.animal?.identifier}</Text>
        <Text className="text-gray-500 text-sm">{alert.vaccination?.name}</Text>
      </View>
      <View className="items-end">
        <Badge
          variant={isOverdue ? 'danger' : isUrgent ? 'warning' : 'primary'}
          size="sm"
        >
          {isOverdue ? 'Atrasada' : `${daysUntilDue}d`}
        </Badge>
        <Text className="text-gray-400 text-xs mt-1">
          {dayjs(alert.nextDoseDate).format('DD/MM')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function CampaignItem({ campaign }) {
  const progress = campaign.targetCount > 0
    ? ((campaign.completedCount / campaign.targetCount) * 100).toFixed(0)
    : 0;

  return (
    <TouchableOpacity
      className="py-3 border-b border-gray-50"
      onPress={() => router.push(`/sanitary/campaigns/${campaign.id}`)}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-medium text-gray-900">{campaign.name}</Text>
        <Badge
          variant={campaign.status === 'active' ? 'success' : campaign.status === 'completed' ? 'primary' : 'secondary'}
          size="sm"
        >
          {campaign.status === 'active' ? 'Ativa' : campaign.status === 'completed' ? 'Concluída' : 'Planejada'}
        </Badge>
      </View>
      <View className="flex-row items-center">
        <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mr-3">
          <View
            className="h-full bg-success-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
        <Text className="text-gray-600 text-sm">{progress}%</Text>
      </View>
      <Text className="text-gray-500 text-xs mt-1">
        {campaign.completedCount}/{campaign.targetCount} animais
      </Text>
    </TouchableOpacity>
  );
}

function RecentTreatmentItem({ treatment }) {
  const typeConfig = {
    treatment: { label: 'Tratamento', icon: 'medkit', color: '#3b82f6' },
    deworming: { label: 'Vermifugação', icon: 'bug', color: '#22c55e' },
    examination: { label: 'Exame', icon: 'search', color: '#8b5cf6' },
    surgery: { label: 'Cirurgia', icon: 'cut', color: '#ef4444' },
  };

  const config = typeConfig[treatment.type] || typeConfig.treatment;

  return (
    <TouchableOpacity
      className="flex-row items-center py-3 border-b border-gray-50"
      onPress={() => router.push(`/animals/${treatment.animalId}`)}
    >
      <View
        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: `${config.color}20` }}
      >
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900">{treatment.animal?.identifier}</Text>
        <Text className="text-gray-500 text-sm">{config.label}: {treatment.diagnosis || '-'}</Text>
      </View>
      <Text className="text-gray-400 text-xs">
        {dayjs(treatment.date).format('DD/MM')}
      </Text>
    </TouchableOpacity>
  );
}

export default function SanitaryOverviewScreen() {
  const { data: statsData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [QUERY_KEYS.SANITARY_STATS],
    queryFn: sanitaryApi.getStats,
  });

  const { data: alertsData } = useQuery({
    queryKey: [QUERY_KEYS.VACCINATION_ALERTS],
    queryFn: () => sanitaryApi.getVaccinationAlerts({ limit: 5 }),
  });

  const { data: campaignsData } = useQuery({
    queryKey: [QUERY_KEYS.CAMPAIGNS],
    queryFn: () => sanitaryApi.getCampaigns({ status: 'active', limit: 3 }),
  });

  const { data: treatmentsData } = useQuery({
    queryKey: [QUERY_KEYS.HEALTH_RECORDS],
    queryFn: () => sanitaryApi.getHealthRecords({ limit: 5 }),
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const stats = statsData?.data || {};
  const alerts = alertsData?.data?.data || [];
  const campaigns = campaignsData?.data?.data || [];
  const treatments = treatmentsData?.data?.data || [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Controle Sanitário</Text>
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
              icon="shield-checkmark"
              label="Vacinações (mês)"
              value={stats.vaccinationsThisMonth || 0}
              color="success"
            />
            <View className="w-4" />
            <StatCard
              icon="alert-circle"
              label="Alertas Pendentes"
              value={stats.pendingAlerts || 0}
              color={stats.pendingAlerts > 0 ? 'warning' : 'success'}
              onPress={() => router.push('/sanitary/vaccinations')}
            />
          </View>
          <View className="flex-row mb-4">
            <StatCard
              icon="medkit"
              label="Tratamentos (mês)"
              value={stats.treatmentsThisMonth || 0}
              color="primary"
            />
            <View className="w-4" />
            <StatCard
              icon="flag"
              label="Campanhas Ativas"
              value={stats.activeCampaigns || 0}
              color="primary"
              onPress={() => router.push('/sanitary/campaigns')}
            />
          </View>

          {/* Quick Actions */}
          <Card title="Ações Rápidas" className="mb-4">
            <View className="flex-row flex-wrap">
              <QuickAction
                icon="shield-checkmark"
                label="Vacinar"
                color="green"
                onPress={() => router.push('/sanitary/record?type=vaccination')}
              />
              <QuickAction
                icon="bug"
                label="Vermifugar"
                color="blue"
                onPress={() => router.push('/sanitary/record?type=deworming')}
              />
              <QuickAction
                icon="medkit"
                label="Tratamento"
                color="orange"
                onPress={() => router.push('/sanitary/record?type=treatment')}
              />
              <QuickAction
                icon="flag"
                label="Campanha"
                color="purple"
                onPress={() => router.push('/sanitary/campaigns/new')}
              />
            </View>
          </Card>

          {/* Vaccination Alerts */}
          <Card
            title="Alertas de Vacinação"
            subtitle={`${alerts.length} pendentes`}
            headerAction={
              <TouchableOpacity onPress={() => router.push('/sanitary/vaccinations')}>
                <Text className="text-primary-600 font-medium">Ver todos</Text>
              </TouchableOpacity>
            }
            className="mb-4"
          >
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <VaccinationAlertItem key={index} alert={alert} />
              ))
            ) : (
              <View className="py-4 items-center">
                <Ionicons name="checkmark-circle" size={40} color="#22c55e" />
                <Text className="text-gray-500 mt-2">Todas as vacinas em dia!</Text>
              </View>
            )}
          </Card>

          {/* Active Campaigns */}
          {campaigns.length > 0 && (
            <Card
              title="Campanhas Ativas"
              headerAction={
                <TouchableOpacity onPress={() => router.push('/sanitary/campaigns')}>
                  <Text className="text-primary-600 font-medium">Ver todas</Text>
                </TouchableOpacity>
              }
              className="mb-4"
            >
              {campaigns.map((campaign, index) => (
                <CampaignItem key={index} campaign={campaign} />
              ))}
            </Card>
          )}

          {/* Recent Treatments */}
          <Card
            title="Registros Recentes"
            className="mb-4"
          >
            {treatments.length > 0 ? (
              treatments.map((treatment, index) => (
                <RecentTreatmentItem key={index} treatment={treatment} />
              ))
            ) : (
              <View className="py-4 items-center">
                <Text className="text-gray-500">Nenhum registro recente</Text>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
