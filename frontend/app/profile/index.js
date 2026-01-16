import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Card, Badge, Button } from '../../src/components/common';
import useAuthStore from '../../src/store/authStore';

function MenuSection({ title, children }) {
  return (
    <View className="mb-4">
      <Text className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2 px-1">
        {title}
      </Text>
      <Card noPadding>
        {children}
      </Card>
    </View>
  );
}

function MenuItem({ icon, label, value, onPress, danger, badge }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-3 border-b border-gray-50"
    >
      <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${
        danger ? 'bg-danger-50' : 'bg-gray-100'
      }`}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? '#ef4444' : '#6b7280'}
        />
      </View>
      <View className="flex-1">
        <Text className={`font-medium ${danger ? 'text-danger-600' : 'text-gray-900'}`}>
          {label}
        </Text>
        {value && <Text className="text-gray-500 text-sm">{value}</Text>}
      </View>
      {badge && <Badge variant="danger" size="sm">{badge}</Badge>}
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, account, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            queryClient.clear();
            router.replace('/auth/login');
          }
        },
      ]
    );
  };

  const getSubscriptionBadge = () => {
    switch (account?.subscriptionStatus) {
      case 'active':
        return { variant: 'success', label: 'Ativo' };
      case 'trialing':
        return { variant: 'warning', label: 'Trial' };
      case 'past_due':
        return { variant: 'danger', label: 'Pendente' };
      case 'canceled':
        return { variant: 'secondary', label: 'Cancelado' };
      default:
        return { variant: 'secondary', label: account?.subscriptionStatus || 'N/A' };
    }
  };

  const subscriptionBadge = getSubscriptionBadge();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Meu Perfil</Text>
        <TouchableOpacity onPress={() => router.push('/profile/edit')}>
          <Ionicons name="create-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Profile Card */}
        <Card className="mb-4">
          <View className="items-center py-4">
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-3">
              {user?.photoUrl ? (
                <Image
                  source={{ uri: user.photoUrl }}
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <Text className="text-3xl font-bold text-primary-600">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Text>
              )}
            </View>
            <Text className="text-xl font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-gray-500">{user?.email}</Text>
            <View className="flex-row items-center mt-2">
              <Badge variant="primary" size="sm">{user?.role || 'user'}</Badge>
            </View>
          </View>
        </Card>

        {/* Subscription Card */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-primary-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="ribbon" size={24} color="#2563eb" />
              </View>
              <View>
                <Text className="font-bold text-gray-900">{account?.plan?.name || 'Plano'}</Text>
                <Text className="text-gray-500 text-sm">
                  {account?.subscriptionStatus === 'trialing'
                    ? `Trial até ${dayjs(account.trialEndsAt).format('DD/MM/YYYY')}`
                    : `Assinatura ${subscriptionBadge.label}`
                  }
                </Text>
              </View>
            </View>
            <Badge variant={subscriptionBadge.variant} size="md">
              {subscriptionBadge.label}
            </Badge>
          </View>
          {account?.subscriptionStatus !== 'active' && (
            <Button
              variant="primary"
              className="mt-4"
              onPress={() => router.push('/subscription')}
            >
              Gerenciar Assinatura
            </Button>
          )}
        </Card>

        {/* Account Menu */}
        <MenuSection title="Conta">
          <MenuItem
            icon="person-outline"
            label="Dados Pessoais"
            value={`${user?.firstName} ${user?.lastName}`}
            onPress={() => router.push('/profile/edit')}
          />
          <MenuItem
            icon="lock-closed-outline"
            label="Alterar Senha"
            onPress={() => router.push('/profile/change-password')}
          />
          <MenuItem
            icon="notifications-outline"
            label="Notificações"
            onPress={() => router.push('/notifications')}
          />
        </MenuSection>

        {/* Business Menu */}
        <MenuSection title="Empresa">
          <MenuItem
            icon="business-outline"
            label="Dados da Empresa"
            value={account?.companyName}
            onPress={() => router.push('/settings/company')}
          />
          <MenuItem
            icon="receipt-outline"
            label="Configurações Fiscais"
            onPress={() => router.push('/settings/fiscal')}
          />
          <MenuItem
            icon="people-outline"
            label="Equipe"
            onPress={() => router.push('/team')}
          />
        </MenuSection>

        {/* Subscription Menu */}
        <MenuSection title="Assinatura">
          <MenuItem
            icon="card-outline"
            label="Plano Atual"
            value={account?.plan?.name}
            onPress={() => router.push('/subscription')}
          />
          <MenuItem
            icon="receipt-outline"
            label="Histórico de Faturas"
            onPress={() => router.push('/subscription/invoices')}
          />
        </MenuSection>

        {/* Support Menu */}
        <MenuSection title="Suporte">
          <MenuItem
            icon="help-circle-outline"
            label="Central de Ajuda"
            onPress={() => {}}
          />
          <MenuItem
            icon="chatbubble-outline"
            label="Fale Conosco"
            onPress={() => {}}
          />
          <MenuItem
            icon="document-text-outline"
            label="Termos de Uso"
            onPress={() => {}}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Política de Privacidade"
            onPress={() => {}}
          />
        </MenuSection>

        {/* Logout */}
        <MenuSection title="">
          <MenuItem
            icon="log-out-outline"
            label="Sair da Conta"
            onPress={handleLogout}
            danger
          />
        </MenuSection>

        {/* App Info */}
        <View className="items-center py-6">
          <Text className="text-gray-400 text-sm">DUOVET v1.0.0</Text>
          <Text className="text-gray-300 text-xs mt-1">
            © {new Date().getFullYear()} DUOVET. Todos os direitos reservados.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
