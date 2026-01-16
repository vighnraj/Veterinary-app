import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import Card from '../../src/components/common/Card';
import Badge from '../../src/components/common/Badge';
import Modal from '../../src/components/common/Modal';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import Select from '../../src/components/common/Select';
import { teamApi } from '../../src/api';

const roleOptions = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Veterinário', value: 'veterinarian' },
  { label: 'Auxiliar', value: 'assistant' },
  { label: 'Recepcionista', value: 'receptionist' },
];

const roleLabels = {
  admin: { label: 'Admin', color: 'danger' },
  veterinarian: { label: 'Veterinário', color: 'success' },
  assistant: { label: 'Auxiliar', color: 'info' },
  receptionist: { label: 'Recepção', color: 'warning' },
};

export default function TeamScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'assistant',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['team'],
    queryFn: teamApi.getMembers,
  });

  const members = data?.members || [];

  const inviteMutation = useMutation({
    mutationFn: teamApi.invite,
    onSuccess: () => {
      queryClient.invalidateQueries(['team']);
      setShowInviteModal(false);
      setInviteData({ email: '', role: 'assistant' });
      Alert.alert('Sucesso', 'Convite enviado com sucesso!');
    },
    onError: (error) => {
      Alert.alert('Erro', error.message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: teamApi.removeMember,
    onSuccess: () => {
      queryClient.invalidateQueries(['team']);
      Alert.alert('Sucesso', 'Membro removido da equipe');
    },
    onError: (error) => {
      Alert.alert('Erro', error.message);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => teamApi.updateRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries(['team']);
      Alert.alert('Sucesso', 'Função atualizada');
    },
    onError: (error) => {
      Alert.alert('Erro', error.message);
    },
  });

  const handleInvite = () => {
    if (!inviteData.email) {
      Alert.alert('Erro', 'Email é obrigatório');
      return;
    }
    inviteMutation.mutate(inviteData);
  };

  const handleRemove = (member) => {
    Alert.alert(
      'Remover Membro',
      `Deseja remover ${member.name} da equipe?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeMutation.mutate(member.id) },
      ]
    );
  };

  const handleChangeRole = (member) => {
    Alert.alert(
      'Alterar Função',
      `Selecione a nova função para ${member.name}`,
      [
        ...roleOptions.map(role => ({
          text: role.label,
          onPress: () => updateRoleMutation.mutate({ userId: member.id, role: role.value }),
        })),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const renderMember = ({ item }) => {
    const roleInfo = roleLabels[item.role] || { label: item.role, color: 'default' };

    return (
      <Card className="mb-3">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-3">
            <Text className="text-primary-700 font-bold text-lg">
              {getInitials(item.name)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-bold text-gray-900">{item.name}</Text>
            <Text className="text-gray-500 text-sm">{item.email}</Text>
            <Badge label={roleInfo.label} variant={roleInfo.color} className="mt-1" />
          </View>
          <View className="flex-row">
            <TouchableOpacity onPress={() => handleChangeRole(item)} className="p-2">
              <Ionicons name="shield" size={20} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemove(item)} className="p-2">
              <Ionicons name="person-remove" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
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
          <Text className="text-lg font-bold text-gray-900">Equipe</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowInviteModal(true)}
          className="bg-primary-500 px-3 py-2 rounded-lg flex-row items-center"
        >
          <Ionicons name="person-add" size={20} color="#fff" />
          <Text className="text-white font-medium ml-1">Convidar</Text>
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View className="p-4">
        <Card className="bg-primary-50 border border-primary-200">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={24} color="#2563eb" />
            <Text className="text-primary-700 ml-2 flex-1">
              Gerencie os membros da sua equipe. O número de membros depende do seu plano de assinatura.
            </Text>
          </View>
        </Card>
      </View>

      {/* List */}
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="people-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-2">Nenhum membro na equipe</Text>
            <Text className="text-gray-400 text-sm">Convide membros para colaborar</Text>
          </View>
        }
      />

      {/* Invite Modal */}
      <Modal
        visible={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setInviteData({ email: '', role: 'assistant' });
        }}
        title="Convidar Membro"
      >
        <Input
          label="Email"
          value={inviteData.email}
          onChangeText={(value) => setInviteData(prev => ({ ...prev, email: value }))}
          placeholder="email@exemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          required
        />

        <Select
          label="Função"
          value={inviteData.role}
          onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value }))}
          items={roleOptions}
          required
        />

        <View className="bg-yellow-50 p-3 rounded-lg mt-2">
          <View className="flex-row items-start">
            <Ionicons name="warning" size={20} color="#f59e0b" />
            <Text className="text-yellow-700 ml-2 flex-1 text-sm">
              O convidado receberá um email com instruções para criar sua conta e acessar o sistema.
            </Text>
          </View>
        </View>

        <View className="flex-row mt-4">
          <Button
            title="Cancelar"
            onPress={() => setShowInviteModal(false)}
            variant="outline"
            className="flex-1 mr-2"
          />
          <Button
            title="Enviar Convite"
            onPress={handleInvite}
            loading={inviteMutation.isPending}
            className="flex-1 ml-2"
          />
        </View>
      </Modal>
    </View>
  );
}
