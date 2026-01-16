import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Card from '../../src/components/common/Card';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import Select from '../../src/components/common/Select';
import Badge from '../../src/components/common/Badge';
import { financialApi, clientsApi, servicesApi } from '../../src/api';
import { formatCurrency } from '../../src/utils/formatters';

const schema = yup.object({
  clientId: yup.string().required('Cliente é obrigatório'),
  dueDate: yup.string().required('Data de vencimento é obrigatória'),
  notes: yup.string(),
});

export default function NewInvoiceScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState([]);

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll({ limit: 100 }),
  });

  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.getAll({ limit: 100 }),
  });

  const clients = clientsData?.clients || [];
  const services = servicesData?.services || [];

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      clientId: '',
      dueDate: '',
      notes: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: financialApi.createInvoice,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['invoices']);
      Alert.alert('Sucesso', 'Fatura criada com sucesso!', [
        { text: 'OK', onPress: () => router.replace(`/invoices/${data.id}`) }
      ]);
    },
    onError: (error) => {
      Alert.alert('Erro', error.message || 'Erro ao criar fatura');
    },
  });

  const addItem = (service) => {
    const existingIndex = selectedItems.findIndex(item => item.serviceId === service.id);
    if (existingIndex >= 0) {
      const newItems = [...selectedItems];
      newItems[existingIndex].quantity += 1;
      setSelectedItems(newItems);
    } else {
      setSelectedItems([...selectedItems, {
        serviceId: service.id,
        name: service.name,
        price: service.price || 0,
        quantity: 1,
      }]);
    }
  };

  const removeItem = (index) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  const updateQuantity = (index, quantity) => {
    if (quantity < 1) return;
    const newItems = [...selectedItems];
    newItems[index].quantity = quantity;
    setSelectedItems(newItems);
  };

  const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const onSubmit = (data) => {
    if (selectedItems.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um item à fatura');
      return;
    }

    const payload = {
      ...data,
      items: selectedItems.map(item => ({
        serviceId: item.serviceId,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      total,
    };

    createMutation.mutate(payload);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Nova Fatura</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Cliente</Text>

          <Controller
            control={control}
            name="clientId"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Selecione o Cliente"
                value={value}
                onValueChange={onChange}
                items={clients.map(c => ({ label: c.name, value: c.id }))}
                placeholder="Selecione um cliente"
                required
                error={errors.clientId?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="dueDate"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Data de Vencimento"
                value={value}
                onChangeText={onChange}
                placeholder="AAAA-MM-DD"
                required
                error={errors.dueDate?.message}
              />
            )}
          />
        </Card>

        {/* Services Selection */}
        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Adicionar Serviços</Text>

          <View className="flex-row flex-wrap">
            {services.map(service => (
              <TouchableOpacity
                key={service.id}
                onPress={() => addItem(service)}
                className="bg-gray-100 rounded-lg px-3 py-2 mr-2 mb-2 flex-row items-center"
              >
                <Ionicons name="add-circle" size={18} color="#2563eb" />
                <Text className="text-gray-700 ml-1">{service.name}</Text>
                <Text className="text-gray-500 ml-1 text-sm">
                  ({formatCurrency(service.price)})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Selected Items */}
        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Itens da Fatura</Text>

          {selectedItems.length === 0 ? (
            <View className="items-center py-6">
              <Ionicons name="cart-outline" size={40} color="#9ca3af" />
              <Text className="text-gray-500 mt-2">Nenhum item adicionado</Text>
            </View>
          ) : (
            <>
              {selectedItems.map((item, index) => (
                <View
                  key={index}
                  className="flex-row items-center py-3 border-b border-gray-100"
                >
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">{item.name}</Text>
                    <Text className="text-gray-500">{formatCurrency(item.price)}</Text>
                  </View>

                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => updateQuantity(index, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                    >
                      <Ionicons name="remove" size={18} color="#374151" />
                    </TouchableOpacity>
                    <Text className="mx-3 font-medium">{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(index, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                    >
                      <Ionicons name="add" size={18} color="#374151" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => removeItem(index)}
                    className="ml-3"
                  >
                    <Ionicons name="trash" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}

              <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <Text className="text-lg font-bold text-gray-900">Total</Text>
                <Text className="text-2xl font-bold text-primary-600">
                  {formatCurrency(total)}
                </Text>
              </View>
            </>
          )}
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Observações</Text>

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                placeholder="Observações adicionais..."
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top' }}
              />
            )}
          />
        </Card>

        <View className="flex-row mb-8">
          <Button
            title="Cancelar"
            onPress={() => router.back()}
            variant="outline"
            className="flex-1 mr-2"
          />
          <Button
            title="Criar Fatura"
            onPress={handleSubmit(onSubmit)}
            loading={createMutation.isPending}
            className="flex-1 ml-2"
          />
        </View>
      </ScrollView>
    </View>
  );
}
