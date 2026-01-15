import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import useAuthStore from '../../src/store/authStore';

function MenuItem({ icon, label, subtitle, onPress, danger = false }) {
  return (
    <TouchableOpacity
      className="flex-row items-center py-4 border-b border-gray-100"
      onPress={onPress}
    >
      <View className={`w-10 h-10 rounded-lg items-center justify-center mr-4 ${danger ? 'bg-danger-50' : 'bg-gray-100'}`}>
        <Ionicons name={icon} size={20} color={danger ? '#ef4444' : '#6b7280'} />
      </View>
      <View className="flex-1">
        <Text className={`font-medium ${danger ? 'text-danger-600' : 'text-gray-900'}`}>
          {label}
        </Text>
        {subtitle && (
          <Text className="text-gray-500 text-sm">{subtitle}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );
}

function MenuSection({ title, children }) {
  return (
    <View className="bg-white rounded-xl px-4 mb-4">
      {title && (
        <Text className="text-gray-500 text-sm font-medium py-3 uppercase">
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}

export default function MoreScreen() {
  const { user, account, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView className="flex-1 p-4">
        {/* Profile Card */}
        <TouchableOpacity
          className="bg-white rounded-xl p-4 mb-4 flex-row items-center"
          onPress={() => router.push('/profile')}
        >
          <View className="w-16 h-16 bg-primary-600 rounded-full items-center justify-center mr-4">
            <Text className="text-white text-2xl font-bold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-gray-500">{user?.email}</Text>
            <View className="flex-row items-center mt-1">
              <View className={`w-2 h-2 rounded-full mr-2 ${
                account?.subscriptionStatus === 'active' ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <Text className="text-sm text-gray-500 capitalize">
                {account?.subscriptionStatus || 'Free'} Plan
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        {/* Management */}
        <MenuSection title="Management">
          <MenuItem
            icon="medical-outline"
            label="Reproductive"
            subtitle="Inseminations, births, pregnancy checks"
            onPress={() => router.push('/reproductive')}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Sanitary"
            subtitle="Vaccinations, treatments, campaigns"
            onPress={() => router.push('/sanitary')}
          />
          <MenuItem
            icon="layers-outline"
            label="Batches"
            subtitle="Manage animal groups"
            onPress={() => router.push('/batches')}
          />
        </MenuSection>

        {/* Financial */}
        <MenuSection title="Financial">
          <MenuItem
            icon="document-text-outline"
            label="Invoices"
            subtitle="View and manage invoices"
            onPress={() => router.push('/invoices')}
          />
          <MenuItem
            icon="cash-outline"
            label="Payments"
            subtitle="Track payments and receivables"
            onPress={() => router.push('/payments')}
          />
          <MenuItem
            icon="bar-chart-outline"
            label="Reports"
            subtitle="Financial and technical reports"
            onPress={() => router.push('/reports')}
          />
        </MenuSection>

        {/* Settings */}
        <MenuSection title="Settings">
          <MenuItem
            icon="person-outline"
            label="Profile"
            subtitle="Manage your account"
            onPress={() => router.push('/profile')}
          />
          <MenuItem
            icon="people-outline"
            label="Team"
            subtitle="Manage users and permissions"
            onPress={() => router.push('/team')}
          />
          <MenuItem
            icon="card-outline"
            label="Subscription"
            subtitle="Manage your plan"
            onPress={() => router.push('/subscription')}
          />
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            subtitle="Notification preferences"
            onPress={() => router.push('/notifications')}
          />
          <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => router.push('/support')}
          />
        </MenuSection>

        {/* Logout */}
        <MenuSection>
          <MenuItem
            icon="log-out-outline"
            label="Logout"
            danger
            onPress={handleLogout}
          />
        </MenuSection>

        {/* Version */}
        <Text className="text-center text-gray-400 text-sm py-4">
          VetSaaS v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
