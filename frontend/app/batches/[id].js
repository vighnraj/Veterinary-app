import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import Card from '../../src/components/common/Card';
import Badge from '../../src/components/common/Badge';
import Button from '../../src/components/common/Button';
import Modal from '../../src/components/common/Modal';
import { batchesApi, animalsApi } from '../../src/api';

export default function BatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showAddAnimals, setShowAddAnimals] = useState(false);
  const [selectedAnimals, setSelectedAnimals] = useState([]);

  const { data: batch, isLoading } = useQuery({
    queryKey: ['batch', id],
    queryFn: () => batchesApi.getById(id),
  });

  const { data: availableAnimals } = useQuery({
    queryKey: ['animals-available'],
    queryFn: () => animalsApi.getAll({ limit: 100, noBatch: true }),
    enabled: showAddAnimals,
  });

  const addAnimalsMutation = useMutation({
    mutationFn: (animalIds) => batchesApi.addAnimals(id, animalIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['batch', id]);
      setShowAddAnimals(false);
      setSelectedAnimals([]);
      Alert.alert('Sucesso', 'Animais adicionados ao lote');
    },
    onError: (error) => {
      Alert.alert('Erro', error.message);
    },
  });

  const removeAnimalMutation = useMutation({
    mutationFn: (animalId) => batchesApi.removeAnimal(id, animalId),
    onSuccess: () => {
      queryClient.invalidateQueries(['batch', id]);
      Alert.alert('Sucesso', 'Animal removido do lote');
    },
    onError: (error) => {
      Alert.alert('Erro', error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => batchesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['batches']);
      router.back();
    },
    onError: (error) => {
      Alert.alert('Erro', error.message);
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Excluir Lote',
      'Tem certeza que deseja excluir este lote? Os animais não serão excluídos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  const toggleAnimalSelection = (animalId) => {
    setSelectedAnimals(prev => {
      if (prev.includes(animalId)) {
        return prev.filter(id => id !== animalId);
      }
      return [...prev, animalId];
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-500">Carregando...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">Detalhes do Lote</Text>
        </View>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Batch Info */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">{batch.name}</Text>
            <Badge label={`${batch.animals?.length || 0} animais`} variant="info" />
          </View>

          {batch.description && (
            <Text className="text-gray-600 mb-3">{batch.description}</Text>
          )}

          <View className="flex-row items-center">
            <Ionicons name="location" size={18} color="#6b7280" />
            <Text className="text-gray-600 ml-2">{batch.location || 'Sem localização'}</Text>
          </View>
        </Card>

        {/* Animals in Batch */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-bold text-gray-900">Animais no Lote</Text>
          <TouchableOpacity
            onPress={() => setShowAddAnimals(true)}
            className="bg-primary-50 px-3 py-1 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={18} color="#2563eb" />
            <Text className="text-primary-600 font-medium ml-1">Adicionar</Text>
          </TouchableOpacity>
        </View>

        {batch.animals?.length === 0 ? (
          <Card className="mb-4">
            <View className="items-center py-6">
              <Ionicons name="paw-outline" size={40} color="#9ca3af" />
              <Text className="text-gray-500 mt-2">Nenhum animal neste lote</Text>
            </View>
          </Card>
        ) : (
          batch.animals?.map(animal => (
            <Card key={animal.id} className="mb-2">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={() => router.push(`/animals/${animal.id}`)}
                  className="flex-row items-center flex-1"
                >
                  <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="paw" size={20} color="#10b981" />
                  </View>
                  <View>
                    <Text className="font-bold text-gray-900">{animal.name}</Text>
                    <Text className="text-gray-500 text-sm">
                      {animal.species} • {animal.breed || 'Sem raça'}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Remover Animal',
                      `Deseja remover ${animal.name} do lote?`,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Remover', style: 'destructive', onPress: () => removeAnimalMutation.mutate(animal.id) },
                      ]
                    );
                  }}
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add Animals Modal */}
      <Modal
        visible={showAddAnimals}
        onClose={() => {
          setShowAddAnimals(false);
          setSelectedAnimals([]);
        }}
        title="Adicionar Animais"
        size="large"
      >
        <View style={{ maxHeight: 400 }}>
          {availableAnimals?.animals?.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">
              Nenhum animal disponível
            </Text>
          ) : (
            <FlatList
              data={availableAnimals?.animals || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => toggleAnimalSelection(item.id)}
                  className={`p-3 rounded-lg mb-2 flex-row items-center ${
                    selectedAnimals.includes(item.id)
                      ? 'bg-primary-50 border border-primary-500'
                      : 'bg-gray-50'
                  }`}
                >
                  <Ionicons
                    name={selectedAnimals.includes(item.id) ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={selectedAnimals.includes(item.id) ? '#2563eb' : '#9ca3af'}
                  />
                  <View className="ml-3">
                    <Text className="font-medium text-gray-900">{item.name}</Text>
                    <Text className="text-gray-500 text-sm">{item.species}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <Button
          title={`Adicionar ${selectedAnimals.length} animal(is)`}
          onPress={() => addAnimalsMutation.mutate(selectedAnimals)}
          loading={addAnimalsMutation.isPending}
          disabled={selectedAnimals.length === 0}
          className="mt-4"
        />
      </Modal>
    </View>
  );
}
