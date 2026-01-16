import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import Card from '../../src/components/common/Card';
import Badge from '../../src/components/common/Badge';
import SearchInput from '../../src/components/common/SearchInput';
import Modal from '../../src/components/common/Modal';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import { servicesApi } from '../../src/api';
import { formatCurrency } from '../../src/utils/formatters';

export default function ServicesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['services', search],
    queryFn: () => servicesApi.getAll({ search }),
  });

  const services = data?.services || [];

  const createMutation = useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      resetForm();
      Alert.alert('Sucesso', 'Serviço criado com sucesso!');
    },
    onError: (error) => {
      Alert.alert('Erro', error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => servicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      resetForm();
      Alert.alert('Sucesso', 'Serviço atualizado com sucesso!');
    },
    onError: (error) => {
      Alert.alert('Erro', error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: servicesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      Alert.alert('Sucesso', 'Serviço excluído');
    },
    onError: (error) => {
      Alert.alert('Erro', error.message);
    },
  });

  const resetForm = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({ name: '', description: '', price: '', duration: '' });
  };

  const openEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: String(service.price || ''),
      duration: String(service.duration || ''),
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: formData.price ? parseFloat(formData.price) : null,
      duration: formData.duration ? parseInt(formData.duration) : null,
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (service) => {
    Alert.alert(
      'Excluir Serviço',
      `Deseja excluir o serviço "${service.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteMutation.mutate(service.id) },
      ]
    );
  };

  const renderService = ({ item }) => (
    <Card className="mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
          {item.description && (
            <Text className="text-gray-500 mt-1">{item.description}</Text>
          )}
          <View className="flex-row items-center mt-2">
            <Badge label={formatCurrency(item.price)} variant="success" />
            {item.duration && (
              <Text className="text-gray-500 ml-2">{item.duration} min</Text>
            )}
          </View>
        </View>
        <View className="flex-row">
          <TouchableOpacity onPress={() => openEdit(item)} className="p-2">
            <Ionicons name="pencil" size={20} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} className="p-2">
            <Ionicons name="trash" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">Serviços</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="bg-primary-500 px-3 py-2 rounded-lg flex-row items-center"
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text className="text-white font-medium ml-1">Novo</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="p-4 bg-white border-b border-gray-200">
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar serviços..."
        />
      </View>

      {/* List */}
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderService}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="construct-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-2">Nenhum serviço cadastrado</Text>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        onClose={resetForm}
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
      >
        <Input
          label="Nome"
          value={formData.name}
          onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
          placeholder="Nome do serviço"
          required
        />

        <Input
          label="Descrição"
          value={formData.description}
          onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
          placeholder="Descrição do serviço"
          multiline
        />

        <View className="flex-row">
          <View className="flex-1 mr-2">
            <Input
              label="Preço (R$)"
              value={formData.price}
              onChangeText={(value) => setFormData(prev => ({ ...prev, price: value }))}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>
          <View className="flex-1 ml-2">
            <Input
              label="Duração (min)"
              value={formData.duration}
              onChangeText={(value) => setFormData(prev => ({ ...prev, duration: value }))}
              placeholder="60"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View className="flex-row mt-4">
          <Button
            title="Cancelar"
            onPress={resetForm}
            variant="outline"
            className="flex-1 mr-2"
          />
          <Button
            title={editingService ? 'Salvar' : 'Criar'}
            onPress={handleSubmit}
            loading={createMutation.isPending || updateMutation.isPending}
            className="flex-1 ml-2"
          />
        </View>
      </Modal>
    </View>
  );
}
