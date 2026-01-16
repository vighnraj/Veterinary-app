import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Loading, Badge, Button } from '../../src/components/common';
import { clientsApi } from '../../src/api';
import { QUERY_KEYS } from '../../src/constants/config';
import { formatPhone, formatDocument } from '../../src/utils/formatters';

function InfoRow({ icon, label, value, onPress }) {
  const content = (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color="#6b7280" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-xs">{label}</Text>
        <Text className="text-gray-900 font-medium">{value || '-'}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={20} color="#9ca3af" />}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }
  return content;
}

function PropertyCard({ property }) {
  return (
    <View className="bg-gray-50 rounded-lg p-4 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-semibold text-gray-900">{property.name}</Text>
        {property.isMain && (
          <Badge variant="primary" size="sm">Principal</Badge>
        )}
      </View>
      <Text className="text-gray-600 text-sm">{property.city}, {property.state}</Text>
      {property.totalArea && (
        <Text className="text-gray-500 text-xs mt-1">{property.totalArea} hectares</Text>
      )}
    </View>
  );
}

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const { data: clientData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CLIENTS, id],
    queryFn: () => clientsApi.getClient(id),
  });

  const { data: animalsData } = useQuery({
    queryKey: [QUERY_KEYS.ANIMALS, { clientId: id }],
    queryFn: () => clientsApi.getClientAnimals(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => clientsApi.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.CLIENTS]);
      router.back();
    },
    onError: (error) => {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao excluir cliente');
    },
  });

  const handleWhatsApp = () => {
    const client = clientData?.data;
    if (client?.whatsapp) {
      const phone = client.whatsapp.replace(/\D/g, '');
      Linking.openURL(`https://wa.me/55${phone}`);
    }
  };

  const handleCall = () => {
    const client = clientData?.data;
    if (client?.phone) {
      Linking.openURL(`tel:${client.phone}`);
    }
  };

  const handleEmail = () => {
    const client = clientData?.data;
    if (client?.email) {
      Linking.openURL(`mailto:${client.email}`);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const client = clientData?.data;
  const animals = animalsData?.data || [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">{client?.name}</Text>
          <Text className="text-gray-500 text-sm">
            {client?.type === 'company' ? 'Pessoa Jurídica' : 'Pessoa Física'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push(`/clients/edit/${id}`)} className="mr-3">
          <Ionicons name="create-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Quick Actions */}
        <View className="flex-row mb-4">
          <TouchableOpacity
            onPress={handleWhatsApp}
            className="flex-1 bg-green-500 rounded-xl py-3 items-center mr-2"
            disabled={!client?.whatsapp}
            style={{ opacity: client?.whatsapp ? 1 : 0.5 }}
          >
            <Ionicons name="logo-whatsapp" size={24} color="white" />
            <Text className="text-white text-xs mt-1">WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCall}
            className="flex-1 bg-blue-500 rounded-xl py-3 items-center mr-2"
            disabled={!client?.phone}
            style={{ opacity: client?.phone ? 1 : 0.5 }}
          >
            <Ionicons name="call" size={24} color="white" />
            <Text className="text-white text-xs mt-1">Ligar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleEmail}
            className="flex-1 bg-purple-500 rounded-xl py-3 items-center"
            disabled={!client?.email}
            style={{ opacity: client?.email ? 1 : 0.5 }}
          >
            <Ionicons name="mail" size={24} color="white" />
            <Text className="text-white text-xs mt-1">Email</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Info */}
        <Card title="Informações" className="mb-4">
          <InfoRow
            icon="person-outline"
            label="Nome / Razão Social"
            value={client?.name}
          />
          <InfoRow
            icon="card-outline"
            label="CPF / CNPJ"
            value={formatDocument(client?.document)}
          />
          <InfoRow
            icon="mail-outline"
            label="Email"
            value={client?.email}
            onPress={client?.email ? handleEmail : null}
          />
          <InfoRow
            icon="call-outline"
            label="Telefone"
            value={formatPhone(client?.phone)}
            onPress={client?.phone ? handleCall : null}
          />
          <InfoRow
            icon="logo-whatsapp"
            label="WhatsApp"
            value={formatPhone(client?.whatsapp)}
            onPress={client?.whatsapp ? handleWhatsApp : null}
          />
        </Card>

        {/* Address */}
        <Card title="Endereço" className="mb-4">
          <InfoRow icon="location-outline" label="Rua" value={client?.street} />
          <InfoRow icon="home-outline" label="Número" value={client?.number} />
          <InfoRow icon="business-outline" label="Bairro" value={client?.neighborhood} />
          <InfoRow icon="navigate-outline" label="Cidade" value={`${client?.city || ''} - ${client?.state || ''}`} />
          <InfoRow icon="map-outline" label="CEP" value={client?.zipCode} />
        </Card>

        {/* Properties */}
        <Card
          title="Propriedades"
          subtitle={`${client?.properties?.length || 0} cadastradas`}
          headerAction={
            <TouchableOpacity onPress={() => router.push(`/clients/${id}/properties/new`)}>
              <Ionicons name="add-circle" size={24} color="#2563eb" />
            </TouchableOpacity>
          }
          className="mb-4"
        >
          {client?.properties?.length > 0 ? (
            client.properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          ) : (
            <View className="py-4 items-center">
              <Text className="text-gray-500">Nenhuma propriedade cadastrada</Text>
            </View>
          )}
        </Card>

        {/* Animals */}
        <Card
          title="Animais"
          subtitle={`${animals.length || 0} ativos`}
          className="mb-4"
        >
          {animals.length > 0 ? (
            animals.slice(0, 5).map((animal) => (
              <TouchableOpacity
                key={animal.id}
                className="flex-row items-center py-3 border-b border-gray-100"
                onPress={() => router.push(`/animals/${animal.id}`)}
              >
                <View className="w-10 h-10 bg-primary-100 rounded-lg items-center justify-center mr-3">
                  <Ionicons name="paw" size={20} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">{animal.identifier}</Text>
                  <Text className="text-gray-500 text-sm">{animal.species?.name} - {animal.breed?.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-4 items-center">
              <Text className="text-gray-500">Nenhum animal cadastrado</Text>
            </View>
          )}
          {animals.length > 5 && (
            <TouchableOpacity
              className="py-3 items-center"
              onPress={() => router.push(`/animals?clientId=${id}`)}
            >
              <Text className="text-primary-600 font-medium">Ver todos ({animals.length})</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Financial Summary */}
        <Card title="Resumo Financeiro" className="mb-4">
          <View className="flex-row">
            <View className="flex-1 items-center py-3">
              <Text className="text-2xl font-bold text-gray-900">
                R$ {(client?.totalBilled || 0).toFixed(0)}
              </Text>
              <Text className="text-gray-500 text-sm">Faturado</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center py-3">
              <Text className="text-2xl font-bold text-warning-600">
                R$ {(client?.totalPending || 0).toFixed(0)}
              </Text>
              <Text className="text-gray-500 text-sm">Pendente</Text>
            </View>
          </View>
        </Card>

        {/* Notes */}
        {client?.notes && (
          <Card title="Observações" className="mb-4">
            <Text className="text-gray-600">{client.notes}</Text>
          </Card>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
