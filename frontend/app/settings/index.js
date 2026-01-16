import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import Card from '../../src/components/common/Card';
import { useAuthStore } from '../../src/store/authStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    biometrics: false,
    autoSync: true,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const openUrl = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o link');
    });
  };

  const SettingItem = ({ icon, label, description, onPress, rightElement }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-3 border-b border-gray-100"
      disabled={!onPress && !rightElement}
    >
      <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color="#6b7280" />
      </View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900">{label}</Text>
        {description && (
          <Text className="text-gray-500 text-sm">{description}</Text>
        )}
      </View>
      {rightElement || (onPress && (
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      ))}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Configurações</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Notifications */}
        <Card className="mb-4">
          <Text className="text-sm font-bold text-gray-500 uppercase mb-2">Notificações</Text>

          <SettingItem
            icon="notifications"
            label="Notificações Push"
            description="Receber alertas no dispositivo"
            rightElement={
              <Switch
                value={settings.notifications}
                onValueChange={() => toggleSetting('notifications')}
                trackColor={{ true: '#2563eb' }}
              />
            }
          />

          <SettingItem
            icon="mail"
            label="Alertas por Email"
            description="Receber lembretes por email"
            rightElement={
              <Switch
                value={settings.emailAlerts}
                onValueChange={() => toggleSetting('emailAlerts')}
                trackColor={{ true: '#2563eb' }}
              />
            }
          />
        </Card>

        {/* App Settings */}
        <Card className="mb-4">
          <Text className="text-sm font-bold text-gray-500 uppercase mb-2">Aplicativo</Text>

          <SettingItem
            icon="moon"
            label="Modo Escuro"
            description="Interface com tema escuro"
            rightElement={
              <Switch
                value={settings.darkMode}
                onValueChange={() => toggleSetting('darkMode')}
                trackColor={{ true: '#2563eb' }}
              />
            }
          />

          <SettingItem
            icon="finger-print"
            label="Biometria"
            description="Desbloquear com digital ou face"
            rightElement={
              <Switch
                value={settings.biometrics}
                onValueChange={() => toggleSetting('biometrics')}
                trackColor={{ true: '#2563eb' }}
              />
            }
          />

          <SettingItem
            icon="sync"
            label="Sincronização Automática"
            description="Manter dados atualizados"
            rightElement={
              <Switch
                value={settings.autoSync}
                onValueChange={() => toggleSetting('autoSync')}
                trackColor={{ true: '#2563eb' }}
              />
            }
          />
        </Card>

        {/* Data & Storage */}
        <Card className="mb-4">
          <Text className="text-sm font-bold text-gray-500 uppercase mb-2">Dados & Armazenamento</Text>

          <SettingItem
            icon="cloud-download"
            label="Dados Offline"
            description="Gerenciar dados salvos no dispositivo"
            onPress={() => Alert.alert('Em breve', 'Funcionalidade será implementada')}
          />

          <SettingItem
            icon="trash"
            label="Limpar Cache"
            description="Liberar espaço no dispositivo"
            onPress={() => {
              Alert.alert(
                'Limpar Cache',
                'Isso removerá dados temporários salvos no dispositivo. Deseja continuar?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Limpar', onPress: () => Alert.alert('Sucesso', 'Cache limpo com sucesso') },
                ]
              );
            }}
          />
        </Card>

        {/* Support */}
        <Card className="mb-4">
          <Text className="text-sm font-bold text-gray-500 uppercase mb-2">Suporte</Text>

          <SettingItem
            icon="help-circle"
            label="Central de Ajuda"
            description="Perguntas frequentes e tutoriais"
            onPress={() => openUrl('https://duovet.com.br/ajuda')}
          />

          <SettingItem
            icon="chatbubble"
            label="Fale Conosco"
            description="Entre em contato com o suporte"
            onPress={() => openUrl('mailto:suporte@duovet.com.br')}
          />

          <SettingItem
            icon="bug"
            label="Reportar Problema"
            description="Nos ajude a melhorar"
            onPress={() => openUrl('mailto:bugs@duovet.com.br')}
          />
        </Card>

        {/* About */}
        <Card className="mb-4">
          <Text className="text-sm font-bold text-gray-500 uppercase mb-2">Sobre</Text>

          <SettingItem
            icon="document-text"
            label="Termos de Uso"
            onPress={() => openUrl('https://duovet.com.br/termos')}
          />

          <SettingItem
            icon="shield-checkmark"
            label="Política de Privacidade"
            onPress={() => openUrl('https://duovet.com.br/privacidade')}
          />

          <SettingItem
            icon="information-circle"
            label="Versão do App"
            description="1.0.0 (Build 1)"
          />
        </Card>

        {/* Danger Zone */}
        <Card className="mb-8 border border-red-200">
          <Text className="text-sm font-bold text-red-500 uppercase mb-2">Zona de Perigo</Text>

          <SettingItem
            icon="close-circle"
            label="Excluir Conta"
            description="Esta ação é irreversível"
            onPress={() => {
              Alert.alert(
                'Excluir Conta',
                'Tem certeza? Todos os seus dados serão permanentemente excluídos e esta ação não pode ser desfeita.',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => Alert.alert('Contato', 'Entre em contato com o suporte para solicitar a exclusão da conta.'),
                  },
                ]
              );
            }}
          />
        </Card>
      </ScrollView>
    </View>
  );
}
