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
import { Card, Input, Button, Loading, Badge } from '../../src/components/common';
import { appointmentsApi, clientsApi, animalsApi } from '../../src/api';
import { QUERY_KEYS } from '../../src/constants/config';

const schema = yup.object({
  clientId: yup.string().required('Cliente é obrigatório'),
  scheduledDate: yup.date().required('Data é obrigatória'),
  location: yup.string().required('Local é obrigatório'),
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

function ServiceSelector({ services, selectedServices, onToggle }) {
  return (
    <View>
      {services.map((service) => {
        const isSelected = selectedServices.includes(service.id);
        return (
          <TouchableOpacity
            key={service.id}
            onPress={() => onToggle(service.id)}
            className={`flex-row items-center p-3 rounded-lg mb-2 border ${
              isSelected ? 'bg-primary-50 border-primary-500' : 'bg-white border-gray-200'
            }`}
          >
            <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
              isSelected ? 'bg-primary-500' : 'bg-gray-200'
            }`}>
              {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <View className="flex-1">
              <Text className={`font-medium ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                {service.name}
              </Text>
              <Text className="text-gray-500 text-sm">{service.category}</Text>
            </View>
            <Text className={`font-medium ${isSelected ? 'text-primary-600' : 'text-gray-600'}`}>
              R$ {(service.basePrice || 0).toFixed(2)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AnimalSelector({ animals, selectedAnimals, onToggle }) {
  return (
    <View>
      {animals.map((animal) => {
        const isSelected = selectedAnimals.includes(animal.id);
        return (
          <TouchableOpacity
            key={animal.id}
            onPress={() => onToggle(animal.id)}
            className={`flex-row items-center p-3 rounded-lg mb-2 border ${
              isSelected ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200'
            }`}
          >
            <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
              isSelected ? 'bg-green-500' : 'bg-gray-200'
            }`}>
              {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <View className="flex-1">
              <Text className={`font-medium ${isSelected ? 'text-green-700' : 'text-gray-900'}`}>
                {animal.identifier}
              </Text>
              <Text className="text-gray-500 text-sm">
                {animal.species?.name} - {animal.breed?.name}
              </Text>
            </View>
            <Badge variant={animal.sex === 'male' ? 'primary' : 'danger'} size="sm">
              {animal.sex === 'male' ? 'M' : 'F'}
            </Badge>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AppointmentCreateScreen() {
  const queryClient = useQueryClient();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedAnimals, setSelectedAnimals] = useState([]);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      clientId: '',
      scheduledDate: new Date(),
      location: 'property',
      propertyId: '',
      notes: '',
    },
  });

  const watchClientId = watch('clientId');

  useEffect(() => {
    setSelectedClientId(watchClientId);
    setSelectedAnimals([]);
  }, [watchClientId]);

  // Fetch clients
  const { data: clientsData, isLoading: loadingClients } = useQuery({
    queryKey: [QUERY_KEYS.CLIENTS],
    queryFn: () => clientsApi.getClients({ limit: 100 }),
  });

  // Fetch services
  const { data: servicesData } = useQuery({
    queryKey: [QUERY_KEYS.SERVICES],
    queryFn: appointmentsApi.getServices,
  });

  // Fetch client animals
  const { data: animalsData } = useQuery({
    queryKey: [QUERY_KEYS.ANIMALS, { clientId: selectedClientId }],
    queryFn: () => animalsApi.getAnimals({ clientId: selectedClientId, limit: 100 }),
    enabled: !!selectedClientId,
  });

  // Fetch client properties
  const { data: propertiesData } = useQuery({
    queryKey: [QUERY_KEYS.PROPERTIES, selectedClientId],
    queryFn: () => clientsApi.getClientProperties(selectedClientId),
    enabled: !!selectedClientId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => appointmentsApi.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.APPOINTMENTS]);
      Alert.alert('Sucesso', 'Agendamento criado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error) => {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao criar agendamento');
    },
  });

  const onSubmit = (data) => {
    if (selectedServices.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um serviço');
      return;
    }

    const appointmentData = {
      ...data,
      scheduledDate: selectedDate.toISOString(),
      serviceIds: selectedServices,
      animalIds: selectedAnimals,
    };

    createMutation.mutate(appointmentData);
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDate(newDate);
      setValue('scheduledDate', newDate);
    }
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      const newDate = new Date(selectedDate);
      newDate.setHours(time.getHours(), time.getMinutes());
      setSelectedDate(newDate);
      setValue('scheduledDate', newDate);
    }
  };

  const toggleService = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const toggleAnimal = (animalId) => {
    setSelectedAnimals(prev =>
      prev.includes(animalId)
        ? prev.filter(id => id !== animalId)
        : [...prev, animalId]
    );
  };

  const clients = clientsData?.data?.data || [];
  const services = servicesData?.data || [];
  const animals = animalsData?.data?.data || [];
  const properties = propertiesData?.data || [];

  // Calculate total
  const totalPrice = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((acc, s) => acc + (s.basePrice || 0), 0);

  if (loadingClients) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="close" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-bold text-gray-900">Novo Agendamento</Text>
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
          {/* Client Selection */}
          <Card title="Cliente" className="mb-4">
            <Controller
              control={control}
              name="clientId"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Selecione o Cliente"
                  value={value}
                  onValueChange={onChange}
                  items={clients.map(c => ({ value: c.id, label: c.name }))}
                  placeholder="Selecione o cliente"
                  error={errors.clientId?.message}
                  required
                />
              )}
            />
          </Card>

          {/* Date & Time */}
          <Card title="Data e Hora" className="mb-4">
            <View className="flex-row">
              <View className="flex-1 mr-2">
                <Text className="text-gray-700 font-medium mb-1">Data *</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="border border-gray-300 rounded-lg bg-white p-3 flex-row items-center justify-between"
                >
                  <Text className="text-gray-900">
                    {dayjs(selectedDate).format('DD/MM/YYYY')}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-1">Hora *</Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="border border-gray-300 rounded-lg bg-white p-3 flex-row items-center justify-between"
                >
                  <Text className="text-gray-900">
                    {dayjs(selectedDate).format('HH:mm')}
                  </Text>
                  <Ionicons name="time-outline" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </Card>

          {/* Location */}
          <Card title="Local" className="mb-4">
            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row mb-4">
                  {[
                    { key: 'property', label: 'Propriedade', icon: 'home' },
                    { key: 'clinic', label: 'Clínica', icon: 'business' },
                    { key: 'other', label: 'Outro', icon: 'location' },
                  ].map((loc) => (
                    <TouchableOpacity
                      key={loc.key}
                      onPress={() => onChange(loc.key)}
                      className={`flex-1 py-3 rounded-lg items-center mx-1 ${
                        value === loc.key ? 'bg-primary-100 border-2 border-primary-500' : 'bg-gray-100'
                      }`}
                    >
                      <Ionicons
                        name={loc.icon}
                        size={20}
                        color={value === loc.key ? '#2563eb' : '#9ca3af'}
                      />
                      <Text className={`text-xs mt-1 ${
                        value === loc.key ? 'text-primary-600 font-medium' : 'text-gray-500'
                      }`}>
                        {loc.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
            {watch('location') === 'property' && selectedClientId && (
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
                  />
                )}
              />
            )}
          </Card>

          {/* Services */}
          <Card
            title="Serviços"
            subtitle={`${selectedServices.length} selecionados`}
            className="mb-4"
          >
            {services.length > 0 ? (
              <ServiceSelector
                services={services}
                selectedServices={selectedServices}
                onToggle={toggleService}
              />
            ) : (
              <View className="py-4 items-center">
                <Text className="text-gray-500">Nenhum serviço cadastrado</Text>
              </View>
            )}
            {selectedServices.length > 0 && (
              <View className="flex-row justify-between pt-3 mt-2 border-t border-gray-200">
                <Text className="font-bold text-gray-900">Total Estimado</Text>
                <Text className="font-bold text-primary-600">R$ {totalPrice.toFixed(2)}</Text>
              </View>
            )}
          </Card>

          {/* Animals */}
          {selectedClientId && (
            <Card
              title="Animais"
              subtitle={`${selectedAnimals.length} selecionados`}
              className="mb-4"
            >
              {animals.length > 0 ? (
                <AnimalSelector
                  animals={animals}
                  selectedAnimals={selectedAnimals}
                  onToggle={toggleAnimal}
                />
              ) : (
                <View className="py-4 items-center">
                  <Text className="text-gray-500">Nenhum animal cadastrado para este cliente</Text>
                </View>
              )}
            </Card>
          )}

          {/* Notes */}
          <Card title="Observações" className="mb-4">
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Observações"
                  placeholder="Informações adicionais sobre o agendamento..."
                  value={value}
                  onChangeText={onChange}
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
