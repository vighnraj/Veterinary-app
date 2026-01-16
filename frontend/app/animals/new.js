import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Card, Input, Button, Loading } from '../../src/components/common';
import { animalsApi, clientsApi } from '../../src/api';
import { QUERY_KEYS } from '../../src/constants/config';

const schema = yup.object({
  identifier: yup.string().required('Identificador é obrigatório'),
  name: yup.string(),
  speciesId: yup.string().required('Espécie é obrigatória'),
  breedId: yup.string(),
  sex: yup.string().required('Sexo é obrigatório').oneOf(['male', 'female']),
  clientId: yup.string().required('Cliente é obrigatório'),
  propertyId: yup.string(),
  birthDate: yup.date().nullable(),
  currentWeight: yup.number().nullable().positive('Peso deve ser positivo'),
  coatColor: yup.string(),
  category: yup.string(),
  sireId: yup.string().nullable(),
  damId: yup.string().nullable(),
  notes: yup.string(),
});

function SelectField({ label, value, onValueChange, items, placeholder, error, required }) {
  return (
    <View className="mb-4">
      <Text className="text-gray-700 font-medium mb-1">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>
      <View className={`border rounded-lg bg-white ${error ? 'border-red-500' : 'border-gray-300'}`}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={{ height: 50 }}
        >
          <Picker.Item label={placeholder || 'Selecione...'} value="" />
          {items.map((item) => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}

export default function AnimalCreateScreen() {
  const queryClient = useQueryClient();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      identifier: '',
      name: '',
      speciesId: '',
      breedId: '',
      sex: '',
      clientId: '',
      propertyId: '',
      birthDate: null,
      currentWeight: null,
      coatColor: '',
      category: '',
      sireId: '',
      damId: '',
      notes: '',
    },
  });

  const watchSpeciesId = watch('speciesId');
  const watchClientId = watch('clientId');

  useEffect(() => {
    setSelectedSpeciesId(watchSpeciesId);
  }, [watchSpeciesId]);

  useEffect(() => {
    setSelectedClientId(watchClientId);
  }, [watchClientId]);

  // Fetch species
  const { data: speciesData, isLoading: loadingSpecies } = useQuery({
    queryKey: [QUERY_KEYS.SPECIES],
    queryFn: animalsApi.getSpecies,
  });

  // Fetch breeds based on selected species
  const { data: breedsData } = useQuery({
    queryKey: [QUERY_KEYS.BREEDS, selectedSpeciesId],
    queryFn: () => animalsApi.getBreedsBySpecies(selectedSpeciesId),
    enabled: !!selectedSpeciesId,
  });

  // Fetch clients
  const { data: clientsData } = useQuery({
    queryKey: [QUERY_KEYS.CLIENTS],
    queryFn: () => clientsApi.getClients({ limit: 100 }),
  });

  // Fetch properties based on selected client
  const { data: propertiesData } = useQuery({
    queryKey: [QUERY_KEYS.PROPERTIES, selectedClientId],
    queryFn: () => clientsApi.getClientProperties(selectedClientId),
    enabled: !!selectedClientId,
  });

  // Fetch potential parents (same species)
  const { data: potentialParents } = useQuery({
    queryKey: [QUERY_KEYS.ANIMALS, { speciesId: selectedSpeciesId }],
    queryFn: () => animalsApi.getAnimals({ speciesId: selectedSpeciesId, limit: 100 }),
    enabled: !!selectedSpeciesId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => animalsApi.createAnimal(data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.ANIMALS]);
      Alert.alert('Sucesso', 'Animal cadastrado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error) => {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao cadastrar animal');
    },
  });

  const onSubmit = (data) => {
    // Clean up null/empty values
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v != null && v !== '')
    );
    createMutation.mutate(cleanData);
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setValue('birthDate', date);
    }
  };

  const species = speciesData?.data || [];
  const breeds = breedsData?.data || [];
  const clients = clientsData?.data?.data || [];
  const properties = propertiesData?.data || [];
  const animals = potentialParents?.data?.data || [];

  const males = animals.filter(a => a.sex === 'male');
  const females = animals.filter(a => a.sex === 'female');

  if (loadingSpecies) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="close" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-bold text-gray-900">Novo Animal</Text>
        <Button
          variant="primary"
          size="sm"
          loading={createMutation.isPending}
          onPress={handleSubmit(onSubmit)}
        >
          Salvar
        </Button>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-4">
          {/* Identification */}
          <Card title="Identificação" className="mb-4">
            <Controller
              control={control}
              name="identifier"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Identificador"
                  placeholder="Brinco, tatuagem, chip..."
                  value={value}
                  onChangeText={onChange}
                  error={errors.identifier?.message}
                  required
                />
              )}
            />
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Nome"
                  placeholder="Nome do animal (opcional)"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                />
              )}
            />
          </Card>

          {/* Species and Breed */}
          <Card title="Classificação" className="mb-4">
            <Controller
              control={control}
              name="speciesId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Espécie"
                  value={value}
                  onValueChange={onChange}
                  items={species.map(s => ({ value: s.id, label: s.name }))}
                  placeholder="Selecione a espécie"
                  error={errors.speciesId?.message}
                  required
                />
              )}
            />
            <Controller
              control={control}
              name="breedId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Raça"
                  value={value}
                  onValueChange={onChange}
                  items={breeds.map(b => ({ value: b.id, label: b.name }))}
                  placeholder="Selecione a raça"
                  error={errors.breedId?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="sex"
              render={({ field: { onChange, value } }) => (
                <View className="mb-4">
                  <Text className="text-gray-700 font-medium mb-2">
                    Sexo <Text className="text-red-500">*</Text>
                  </Text>
                  <View className="flex-row">
                    <TouchableOpacity
                      onPress={() => onChange('male')}
                      className={`flex-1 py-3 rounded-lg mr-2 items-center flex-row justify-center ${
                        value === 'male' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
                      }`}
                    >
                      <Ionicons
                        name="male"
                        size={20}
                        color={value === 'male' ? '#3b82f6' : '#9ca3af'}
                      />
                      <Text className={`ml-2 font-medium ${
                        value === 'male' ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        Macho
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onChange('female')}
                      className={`flex-1 py-3 rounded-lg items-center flex-row justify-center ${
                        value === 'female' ? 'bg-pink-100 border-2 border-pink-500' : 'bg-gray-100'
                      }`}
                    >
                      <Ionicons
                        name="female"
                        size={20}
                        color={value === 'female' ? '#ec4899' : '#9ca3af'}
                      />
                      <Text className={`ml-2 font-medium ${
                        value === 'female' ? 'text-pink-600' : 'text-gray-500'
                      }`}>
                        Fêmea
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {errors.sex && <Text className="text-red-500 text-xs mt-1">{errors.sex.message}</Text>}
                </View>
              )}
            />
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Categoria"
                  placeholder="Ex: Vaca, Touro, Bezerra..."
                  value={value}
                  onChangeText={onChange}
                  error={errors.category?.message}
                />
              )}
            />
          </Card>

          {/* Owner */}
          <Card title="Proprietário" className="mb-4">
            <Controller
              control={control}
              name="clientId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Cliente"
                  value={value}
                  onValueChange={onChange}
                  items={clients.map(c => ({ value: c.id, label: c.name }))}
                  placeholder="Selecione o cliente"
                  error={errors.clientId?.message}
                  required
                />
              )}
            />
            <Controller
              control={control}
              name="propertyId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Propriedade"
                  value={value}
                  onValueChange={onChange}
                  items={properties.map(p => ({ value: p.id, label: p.name }))}
                  placeholder="Selecione a propriedade"
                  error={errors.propertyId?.message}
                />
              )}
            />
          </Card>

          {/* Physical Data */}
          <Card title="Dados Físicos" className="mb-4">
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">Data de Nascimento</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="border border-gray-300 rounded-lg bg-white p-3 flex-row items-center justify-between"
              >
                <Text className={selectedDate ? 'text-gray-900' : 'text-gray-400'}>
                  {selectedDate ? dayjs(selectedDate).format('DD/MM/YYYY') : 'Selecione a data'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
            <Controller
              control={control}
              name="currentWeight"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Peso Atual (kg)"
                  placeholder="0.00"
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(text ? parseFloat(text) : null)}
                  error={errors.currentWeight?.message}
                  keyboardType="decimal-pad"
                />
              )}
            />
            <Controller
              control={control}
              name="coatColor"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Pelagem"
                  placeholder="Ex: Preto, Branco, Malhado..."
                  value={value}
                  onChangeText={onChange}
                  error={errors.coatColor?.message}
                />
              )}
            />
          </Card>

          {/* Genealogy */}
          <Card title="Genealogia" className="mb-4">
            <Controller
              control={control}
              name="sireId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Pai"
                  value={value}
                  onValueChange={onChange}
                  items={males.map(m => ({ value: m.id, label: `${m.identifier} - ${m.name || 'Sem nome'}` }))}
                  placeholder="Selecione o pai"
                  error={errors.sireId?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="damId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Mãe"
                  value={value}
                  onValueChange={onChange}
                  items={females.map(f => ({ value: f.id, label: `${f.identifier} - ${f.name || 'Sem nome'}` }))}
                  placeholder="Selecione a mãe"
                  error={errors.damId?.message}
                />
              )}
            />
          </Card>

          {/* Notes */}
          <Card title="Observações" className="mb-4">
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Observações"
                  placeholder="Informações adicionais..."
                  value={value}
                  onChangeText={onChange}
                  error={errors.notes?.message}
                  multiline
                  numberOfLines={4}
                />
              )}
            />
          </Card>

          <View className="h-6" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
