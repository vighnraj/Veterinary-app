import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Card, Loading, Badge, Button } from '../../src/components/common';
import { animalsApi } from '../../src/api';
import { QUERY_KEYS } from '../../src/constants/config';

const TABS = [
  { key: 'info', label: 'Informações', icon: 'information-circle-outline' },
  { key: 'health', label: 'Saúde', icon: 'medical-outline' },
  { key: 'reproductive', label: 'Reprodutivo', icon: 'heart-outline' },
  { key: 'genealogy', label: 'Genealogia', icon: 'git-branch-outline' },
];

function InfoRow({ label, value }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-50">
      <Text className="text-gray-500">{label}</Text>
      <Text className="text-gray-900 font-medium">{value || '-'}</Text>
    </View>
  );
}

function TabButton({ tab, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 py-3 items-center ${active ? 'border-b-2 border-primary-500' : ''}`}
    >
      <Ionicons
        name={tab.icon}
        size={20}
        color={active ? '#2563eb' : '#9ca3af'}
      />
      <Text className={`text-xs mt-1 ${active ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
}

function InfoTab({ animal }) {
  return (
    <View>
      <Card title="Identificação" className="mb-4">
        <InfoRow label="Identificador" value={animal?.identifier} />
        <InfoRow label="Nome" value={animal?.name} />
        <InfoRow label="Espécie" value={animal?.species?.name} />
        <InfoRow label="Raça" value={animal?.breed?.name} />
        <InfoRow label="Sexo" value={animal?.sex === 'male' ? 'Macho' : 'Fêmea'} />
        <InfoRow label="Categoria" value={animal?.category} />
      </Card>

      <Card title="Dados Físicos" className="mb-4">
        <InfoRow label="Data de Nascimento" value={animal?.birthDate ? dayjs(animal.birthDate).format('DD/MM/YYYY') : null} />
        <InfoRow label="Idade" value={animal?.birthDate ? `${dayjs().diff(animal.birthDate, 'year')} anos` : null} />
        <InfoRow label="Peso Atual" value={animal?.currentWeight ? `${animal.currentWeight} kg` : null} />
        <InfoRow label="Pelagem" value={animal?.coatColor} />
        <InfoRow label="Marcações" value={animal?.markings} />
      </Card>

      <Card title="Propriedade" className="mb-4">
        <InfoRow label="Proprietário" value={animal?.client?.name} />
        <InfoRow label="Propriedade" value={animal?.property?.name} />
        <InfoRow label="Status" value={animal?.status} />
      </Card>

      {animal?.notes && (
        <Card title="Observações" className="mb-4">
          <Text className="text-gray-600">{animal.notes}</Text>
        </Card>
      )}
    </View>
  );
}

function HealthTab({ animal, animalId }) {
  const { data: healthData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.HEALTH_RECORDS, animalId],
    queryFn: () => animalsApi.getAnimalHealth(animalId),
  });

  if (isLoading) return <Loading />;

  const vaccinations = healthData?.data?.vaccinations || [];
  const treatments = healthData?.data?.treatments || [];

  return (
    <View>
      <Card
        title="Vacinações"
        subtitle={`${vaccinations.length} registros`}
        className="mb-4"
      >
        {vaccinations.length > 0 ? (
          vaccinations.slice(0, 5).map((vac, index) => (
            <View key={index} className="flex-row items-center py-3 border-b border-gray-50">
              <View className="w-10 h-10 bg-green-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="shield-checkmark" size={20} color="#22c55e" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">{vac.vaccination?.name}</Text>
                <Text className="text-gray-500 text-sm">{dayjs(vac.applicationDate).format('DD/MM/YYYY')}</Text>
              </View>
              {vac.nextDoseDate && (
                <Badge variant="warning" size="sm">
                  Próx: {dayjs(vac.nextDoseDate).format('DD/MM')}
                </Badge>
              )}
            </View>
          ))
        ) : (
          <View className="py-4 items-center">
            <Text className="text-gray-500">Nenhuma vacinação registrada</Text>
          </View>
        )}
      </Card>

      <Card
        title="Tratamentos"
        subtitle={`${treatments.length} registros`}
        className="mb-4"
      >
        {treatments.length > 0 ? (
          treatments.slice(0, 5).map((treatment, index) => (
            <View key={index} className="flex-row items-center py-3 border-b border-gray-50">
              <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="medkit" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">{treatment.type}</Text>
                <Text className="text-gray-500 text-sm">{treatment.diagnosis}</Text>
              </View>
              <Text className="text-gray-400 text-xs">
                {dayjs(treatment.date).format('DD/MM/YY')}
              </Text>
            </View>
          ))
        ) : (
          <View className="py-4 items-center">
            <Text className="text-gray-500">Nenhum tratamento registrado</Text>
          </View>
        )}
      </Card>
    </View>
  );
}

function ReproductiveTab({ animal, animalId }) {
  const { data: reproData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.REPRODUCTIVE, animalId],
    queryFn: () => animalsApi.getAnimalReproductive(animalId),
  });

  if (isLoading) return <Loading />;

  const records = reproData?.data || [];
  const isFemale = animal?.sex === 'female';

  return (
    <View>
      {/* Status Card */}
      <Card className="mb-4">
        <View className="flex-row items-center">
          <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
            animal?.reproductiveStatus === 'pregnant' ? 'bg-pink-100' : 'bg-gray-100'
          }`}>
            <Ionicons
              name={isFemale ? 'female' : 'male'}
              size={24}
              color={animal?.reproductiveStatus === 'pregnant' ? '#ec4899' : '#6b7280'}
            />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-sm">Status Reprodutivo</Text>
            <Text className="text-lg font-bold text-gray-900">
              {animal?.reproductiveStatus === 'pregnant' ? 'Prenhe' :
               animal?.reproductiveStatus === 'open' ? 'Vazia' :
               animal?.reproductiveStatus === 'breeding' ? 'Em reprodução' : 'N/A'}
            </Text>
          </View>
          {animal?.reproductiveStatus === 'pregnant' && animal?.expectedCalvingDate && (
            <View className="items-end">
              <Text className="text-gray-500 text-xs">Previsão de parto</Text>
              <Text className="text-primary-600 font-bold">
                {dayjs(animal.expectedCalvingDate).format('DD/MM/YYYY')}
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Records */}
      <Card
        title="Histórico Reprodutivo"
        subtitle={`${records.length} registros`}
        className="mb-4"
      >
        {records.length > 0 ? (
          records.slice(0, 10).map((record, index) => (
            <View key={index} className="flex-row items-center py-3 border-b border-gray-50">
              <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${
                record.type === 'pregnancy_check' ? 'bg-pink-100' :
                record.type === 'insemination' ? 'bg-blue-100' :
                record.type === 'birth' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Ionicons
                  name={
                    record.type === 'pregnancy_check' ? 'search' :
                    record.type === 'insemination' ? 'water' :
                    record.type === 'birth' ? 'happy' : 'ellipse'
                  }
                  size={20}
                  color={
                    record.type === 'pregnancy_check' ? '#ec4899' :
                    record.type === 'insemination' ? '#3b82f6' :
                    record.type === 'birth' ? '#22c55e' : '#6b7280'
                  }
                />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">
                  {record.type === 'pregnancy_check' ? 'Diagnóstico de Gestação' :
                   record.type === 'insemination' ? 'Inseminação' :
                   record.type === 'heat' ? 'Cio detectado' :
                   record.type === 'birth' ? 'Parto' : record.type}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {record.result || record.notes || '-'}
                </Text>
              </View>
              <Text className="text-gray-400 text-xs">
                {dayjs(record.date).format('DD/MM/YY')}
              </Text>
            </View>
          ))
        ) : (
          <View className="py-4 items-center">
            <Text className="text-gray-500">Nenhum registro reprodutivo</Text>
          </View>
        )}
      </Card>

      {/* Quick Actions */}
      <View className="flex-row mb-4">
        <Button
          variant="outline"
          className="flex-1 mr-2"
          onPress={() => router.push(`/reproductive/new-procedure?animalId=${animalId}&type=heat`)}
        >
          Registrar Cio
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onPress={() => router.push(`/reproductive/new-procedure?animalId=${animalId}&type=pregnancy_check`)}
        >
          Diagnóstico
        </Button>
      </View>
    </View>
  );
}

function GenealogyTab({ animal, animalId }) {
  const { data: genealogyData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.GENEALOGY, animalId],
    queryFn: () => animalsApi.getAnimalGenealogy(animalId),
  });

  if (isLoading) return <Loading />;

  const genealogy = genealogyData?.data || {};

  const AnimalCard = ({ animal: a, relation }) => {
    if (!a) return (
      <View className="bg-gray-100 rounded-lg p-3 items-center">
        <Ionicons name="help-circle-outline" size={24} color="#9ca3af" />
        <Text className="text-gray-500 text-xs mt-1">{relation} desconhecido</Text>
      </View>
    );

    return (
      <TouchableOpacity
        className="bg-white border border-gray-200 rounded-lg p-3 items-center"
        onPress={() => router.push(`/animals/${a.id}`)}
      >
        <View className={`w-10 h-10 rounded-full items-center justify-center ${
          a.sex === 'male' ? 'bg-blue-100' : 'bg-pink-100'
        }`}>
          <Ionicons
            name={a.sex === 'male' ? 'male' : 'female'}
            size={20}
            color={a.sex === 'male' ? '#3b82f6' : '#ec4899'}
          />
        </View>
        <Text className="font-medium text-gray-900 text-xs mt-1">{a.identifier}</Text>
        <Text className="text-gray-500 text-xs">{relation}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      {/* Parents */}
      <Card title="Pais" className="mb-4">
        <View className="flex-row justify-around">
          <AnimalCard animal={genealogy.sire} relation="Pai" />
          <AnimalCard animal={genealogy.dam} relation="Mãe" />
        </View>
      </Card>

      {/* Grandparents */}
      {(genealogy.paternalGrandsire || genealogy.paternalGranddam ||
        genealogy.maternalGrandsire || genealogy.maternalGranddam) && (
        <Card title="Avós" className="mb-4">
          <Text className="text-gray-500 text-xs mb-2">Linha Paterna</Text>
          <View className="flex-row justify-around mb-4">
            <AnimalCard animal={genealogy.paternalGrandsire} relation="Avô Pat." />
            <AnimalCard animal={genealogy.paternalGranddam} relation="Avó Pat." />
          </View>
          <Text className="text-gray-500 text-xs mb-2">Linha Materna</Text>
          <View className="flex-row justify-around">
            <AnimalCard animal={genealogy.maternalGrandsire} relation="Avô Mat." />
            <AnimalCard animal={genealogy.maternalGranddam} relation="Avó Mat." />
          </View>
        </Card>
      )}

      {/* Offspring */}
      <Card
        title="Descendentes"
        subtitle={`${genealogy.offspring?.length || 0} filhos`}
        className="mb-4"
      >
        {genealogy.offspring?.length > 0 ? (
          <View className="flex-row flex-wrap">
            {genealogy.offspring.map((offspring, index) => (
              <View key={index} className="w-1/3 p-1">
                <AnimalCard animal={offspring} relation="Filho(a)" />
              </View>
            ))}
          </View>
        ) : (
          <View className="py-4 items-center">
            <Text className="text-gray-500">Nenhum descendente registrado</Text>
          </View>
        )}
      </Card>
    </View>
  );
}

export default function AnimalDetailScreen() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('info');

  const { data: animalData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ANIMALS, id],
    queryFn: () => animalsApi.getAnimal(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => animalsApi.deleteAnimal(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.ANIMALS]);
      router.back();
    },
    onError: (error) => {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao excluir animal');
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este animal? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const animal = animalData?.data;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <InfoTab animal={animal} />;
      case 'health':
        return <HealthTab animal={animal} animalId={id} />;
      case 'reproductive':
        return <ReproductiveTab animal={animal} animalId={id} />;
      case 'genealogy':
        return <GenealogyTab animal={animal} animalId={id} />;
      default:
        return <InfoTab animal={animal} />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">{animal?.identifier}</Text>
          <Text className="text-gray-500 text-sm">
            {animal?.species?.name} - {animal?.breed?.name}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push(`/animals/edit/${id}`)} className="mr-3">
          <Ionicons name="create-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Status Banner */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <View className="flex-row items-center">
          <View className={`w-3 h-3 rounded-full mr-2 ${
            animal?.status === 'active' ? 'bg-green-500' :
            animal?.status === 'sold' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <Text className="text-gray-600">
            {animal?.status === 'active' ? 'Ativo' :
             animal?.status === 'sold' ? 'Vendido' :
             animal?.status === 'deceased' ? 'Morto' : animal?.status}
          </Text>
        </View>
        <Badge
          variant={animal?.sex === 'male' ? 'primary' : 'danger'}
          size="sm"
        >
          {animal?.sex === 'male' ? 'Macho' : 'Fêmea'}
        </Badge>
      </View>

      {/* Tabs */}
      <View className="bg-white flex-row border-b border-gray-100">
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            active={activeTab === tab.key}
            onPress={() => setActiveTab(tab.key)}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView className="flex-1 p-4">
        {renderTabContent()}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
