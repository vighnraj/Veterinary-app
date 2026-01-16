import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import Card from '../../src/components/common/Card';
import Badge from '../../src/components/common/Badge';
import Button from '../../src/components/common/Button';
import Modal from '../../src/components/common/Modal';
import Input from '../../src/components/common/Input';
import { sanitaryApi } from '../../src/api';
import { formatDate } from '../../src/utils/formatters';

export default function CampaignsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    vaccineName: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: sanitaryApi.getCampaigns,
  });

  const campaigns = data?.campaigns || [];

  const createMutation = useMutation({
    mutationFn: sanitaryApi.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns']);
      setShowModal(false);
      setFormData({ name: '', vaccineName: '', startDate: '', endDate: '', description: '' });
      Alert.alert('Sucesso', 'Campanha criada com sucesso!');
    },
    onError: (error) => {
      Alert.alert('Erro', error.message);
    },
  });

  const getCampaignStatus = (campaign) => {
    const today = new Date();
    const start = new Date(campaign.startDate);
    const end = new Date(campaign.endDate);

    if (today < start) {
      return { label: 'Agendada', variant: 'info' };
    }
    if (today > end) {
      return { label: 'Encerrada', variant: 'default' };
    }
    return { label: 'Em andamento', variant: 'success' };
  };

  const handleCreate = () => {
    if (!formData.name || !formData.vaccineName) {
      Alert.alert('Erro', 'Nome e vacina são obrigatórios');
      return;
    }
    createMutation.mutate(formData);
  };

  const renderCampaign = ({ item }) => {
    const status = getCampaignStatus(item);
    const progress = item.totalAnimals > 0
      ? Math.round((item.vaccinatedCount / item.totalAnimals) * 100)
      : 0;

    return (
      <TouchableOpacity onPress={() => router.push(`/sanitary/campaigns/${item.id}`)}>
        <Card className="mb-3">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
              <Text className="text-gray-500">{item.vaccineName}</Text>
            </View>
            <Badge label={status.label} variant={status.variant} />
          </View>

          {/* Progress */}
          <View className="mt-3">
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-500 text-sm">Progresso</Text>
              <Text className="text-gray-700 font-medium">
                {item.vaccinatedCount || 0}/{item.totalAnimals || 0} ({progress}%)
              </Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>

          {/* Dates */}
          <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
            <View className="flex-row items-center flex-1">
              <Ionicons name="calendar" size={16} color="#6b7280" />
              <Text className="text-gray-500 ml-1 text-sm">
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
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
          <Text className="text-lg font-bold text-gray-900">Campanhas</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="bg-primary-500 px-3 py-2 rounded-lg flex-row items-center"
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text className="text-white font-medium ml-1">Nova</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={campaigns}
        keyExtractor={(item) => item.id}
        renderItem={renderCampaign}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="megaphone-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-2">Nenhuma campanha cadastrada</Text>
          </View>
        }
      />

      {/* Create Modal */}
      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Nova Campanha"
        size="large"
      >
        <Input
          label="Nome da Campanha"
          value={formData.name}
          onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
          placeholder="Ex: Vacinação Aftosa 2024"
          required
        />

        <Input
          label="Vacina"
          value={formData.vaccineName}
          onChangeText={(value) => setFormData(prev => ({ ...prev, vaccineName: value }))}
          placeholder="Nome da vacina"
          required
        />

        <View className="flex-row">
          <View className="flex-1 mr-2">
            <Input
              label="Data Início"
              value={formData.startDate}
              onChangeText={(value) => setFormData(prev => ({ ...prev, startDate: value }))}
              placeholder="AAAA-MM-DD"
            />
          </View>
          <View className="flex-1 ml-2">
            <Input
              label="Data Fim"
              value={formData.endDate}
              onChangeText={(value) => setFormData(prev => ({ ...prev, endDate: value }))}
              placeholder="AAAA-MM-DD"
            />
          </View>
        </View>

        <Input
          label="Descrição"
          value={formData.description}
          onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
          placeholder="Descrição da campanha..."
          multiline
          numberOfLines={3}
        />

        <View className="flex-row mt-4">
          <Button
            title="Cancelar"
            onPress={() => setShowModal(false)}
            variant="outline"
            className="flex-1 mr-2"
          />
          <Button
            title="Criar"
            onPress={handleCreate}
            loading={createMutation.isPending}
            className="flex-1 ml-2"
          />
        </View>
      </Modal>
    </View>
  );
}
