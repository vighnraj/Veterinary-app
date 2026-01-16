import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Card, Loading, Badge, Button } from '../../src/components/common';
import { subscriptionApi } from '../../src/api';
import { QUERY_KEYS } from '../../src/constants/config';
import useAuthStore from '../../src/store/authStore';

function FeatureItem({ feature, included }) {
  return (
    <View className="flex-row items-center py-2">
      <Ionicons
        name={included ? 'checkmark-circle' : 'close-circle'}
        size={20}
        color={included ? '#22c55e' : '#d1d5db'}
      />
      <Text className={`ml-2 ${included ? 'text-gray-700' : 'text-gray-400'}`}>
        {feature}
      </Text>
    </View>
  );
}

function PlanCard({ plan, currentPlan, onSelect }) {
  const isCurrentPlan = currentPlan?.id === plan.id;

  return (
    <View className={`bg-white rounded-xl p-4 mb-4 border-2 ${
      plan.isPopular ? 'border-primary-500' : isCurrentPlan ? 'border-success-500' : 'border-gray-200'
    }`}>
      {plan.isPopular && (
        <View className="absolute -top-3 left-1/2 -ml-12 bg-primary-500 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-bold">MAIS POPULAR</Text>
        </View>
      )}
      {isCurrentPlan && (
        <View className="absolute -top-3 right-4 bg-success-500 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-bold">ATUAL</Text>
        </View>
      )}

      <Text className="text-xl font-bold text-gray-900 mt-2">{plan.name}</Text>
      <Text className="text-gray-500 text-sm mb-3">{plan.description}</Text>

      <View className="flex-row items-baseline mb-4">
        <Text className="text-3xl font-bold text-gray-900">R$ {plan.monthlyPrice}</Text>
        <Text className="text-gray-500">/mês</Text>
      </View>

      <View className="border-t border-gray-100 pt-3 mb-4">
        <FeatureItem feature={`${plan.maxUsers} usuários`} included />
        <FeatureItem feature={`${plan.maxAnimals.toLocaleString()} animais`} included />
        <FeatureItem feature={`${plan.maxClients} clientes`} included />
        <FeatureItem feature={`${plan.maxStorageGb}GB de armazenamento`} included />
        <FeatureItem feature="Nota Fiscal Eletrônica" included={plan.features?.includes('nfe')} />
        <FeatureItem feature="Relatórios Avançados" included={plan.features?.includes('advanced_reports')} />
        <FeatureItem feature="Suporte Prioritário" included={plan.features?.includes('priority_support')} />
      </View>

      <Button
        variant={isCurrentPlan ? 'outline' : plan.isPopular ? 'primary' : 'secondary'}
        onPress={() => !isCurrentPlan && onSelect(plan)}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan ? 'Plano Atual' : 'Selecionar Plano'}
      </Button>
    </View>
  );
}

export default function SubscriptionScreen() {
  const queryClient = useQueryClient();
  const { account, updateAccount } = useAuthStore();

  const { data: plansData, isLoading: loadingPlans } = useQuery({
    queryKey: [QUERY_KEYS.PLANS],
    queryFn: subscriptionApi.getPlans,
  });

  const checkoutMutation = useMutation({
    mutationFn: (planId) => subscriptionApi.createCheckoutSession(planId),
    onSuccess: async (response) => {
      const url = response.data?.url;
      if (url) {
        await Linking.openURL(url);
      }
    },
    onError: (error) => {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao iniciar checkout');
    },
  });

  const portalMutation = useMutation({
    mutationFn: () => subscriptionApi.createPortalSession(),
    onSuccess: async (response) => {
      const url = response.data?.url;
      if (url) {
        await Linking.openURL(url);
      }
    },
    onError: (error) => {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao abrir portal');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => subscriptionApi.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.ACCOUNT]);
      Alert.alert('Sucesso', 'Assinatura cancelada. Você pode continuar usando até o fim do período.');
    },
    onError: (error) => {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao cancelar assinatura');
    },
  });

  const handlePlanSelect = (plan) => {
    Alert.alert(
      'Alterar Plano',
      `Deseja assinar o plano ${plan.name} por R$ ${plan.monthlyPrice}/mês?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', onPress: () => checkoutMutation.mutate(plan.id) },
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancelar Assinatura',
      'Tem certeza? Você perderá acesso aos recursos premium no fim do período atual.',
      [
        { text: 'Manter Assinatura', style: 'cancel' },
        { text: 'Cancelar', style: 'destructive', onPress: () => cancelMutation.mutate() },
      ]
    );
  };

  const getStatusInfo = () => {
    switch (account?.subscriptionStatus) {
      case 'active':
        return { color: 'success', label: 'Ativo', icon: 'checkmark-circle' };
      case 'trialing':
        return { color: 'warning', label: 'Período de Teste', icon: 'time' };
      case 'past_due':
        return { color: 'danger', label: 'Pagamento Pendente', icon: 'alert-circle' };
      case 'canceled':
        return { color: 'secondary', label: 'Cancelado', icon: 'close-circle' };
      default:
        return { color: 'secondary', label: 'Inativo', icon: 'ellipse' };
    }
  };

  const statusInfo = getStatusInfo();
  const plans = plansData?.data || [];
  const currentPlan = account?.plan;

  if (loadingPlans) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Assinatura</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Current Status */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className={`w-12 h-12 bg-${statusInfo.color}-100 rounded-full items-center justify-center mr-3`}>
                <Ionicons
                  name={statusInfo.icon}
                  size={24}
                  color={
                    statusInfo.color === 'success' ? '#22c55e' :
                    statusInfo.color === 'warning' ? '#f59e0b' :
                    statusInfo.color === 'danger' ? '#ef4444' : '#6b7280'
                  }
                />
              </View>
              <View>
                <Text className="text-gray-500 text-sm">Status</Text>
                <Text className="font-bold text-gray-900">{statusInfo.label}</Text>
              </View>
            </View>
            <Badge variant={statusInfo.color} size="md">
              {currentPlan?.name || 'Sem plano'}
            </Badge>
          </View>

          {account?.subscriptionStatus === 'trialing' && account?.trialEndsAt && (
            <View className="bg-warning-50 p-3 rounded-lg mb-4">
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#f59e0b" />
                <Text className="text-warning-700 ml-2">
                  Seu período de teste termina em {dayjs(account.trialEndsAt).format('DD/MM/YYYY')}
                </Text>
              </View>
            </View>
          )}

          {account?.subscriptionStatus === 'active' && (
            <View className="flex-row">
              <Button
                variant="outline"
                className="flex-1 mr-2"
                onPress={() => portalMutation.mutate()}
                loading={portalMutation.isPending}
              >
                Gerenciar Pagamento
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onPress={handleCancelSubscription}
                loading={cancelMutation.isPending}
              >
                Cancelar
              </Button>
            </View>
          )}
        </Card>

        {/* Usage Stats */}
        <Card title="Uso Atual" className="mb-4">
          <View className="space-y-3">
            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Usuários</Text>
                <Text className="text-gray-900 font-medium">
                  {account?.usersCount || 1} / {currentPlan?.maxUsers || '∞'}
                </Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${Math.min(((account?.usersCount || 1) / (currentPlan?.maxUsers || 1)) * 100, 100)}%` }}
                />
              </View>
            </View>

            <View className="mt-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Animais</Text>
                <Text className="text-gray-900 font-medium">
                  {account?.animalsCount || 0} / {currentPlan?.maxAnimals?.toLocaleString() || '∞'}
                </Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-success-500 rounded-full"
                  style={{ width: `${Math.min(((account?.animalsCount || 0) / (currentPlan?.maxAnimals || 1)) * 100, 100)}%` }}
                />
              </View>
            </View>

            <View className="mt-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Clientes</Text>
                <Text className="text-gray-900 font-medium">
                  {account?.clientsCount || 0} / {currentPlan?.maxClients || '∞'}
                </Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className="h-full bg-warning-500 rounded-full"
                  style={{ width: `${Math.min(((account?.clientsCount || 0) / (currentPlan?.maxClients || 1)) * 100, 100)}%` }}
                />
              </View>
            </View>
          </View>
        </Card>

        {/* Plans */}
        <Text className="text-lg font-bold text-gray-900 mb-4">Planos Disponíveis</Text>
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlan={currentPlan}
            onSelect={handlePlanSelect}
          />
        ))}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
