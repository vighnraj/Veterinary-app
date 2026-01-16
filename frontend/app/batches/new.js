import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Card from '../../src/components/common/Card';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import { batchesApi } from '../../src/api';

const schema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string(),
  location: yup.string(),
});

export default function NewBatchScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: batchesApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['batches']);
      Alert.alert('Sucesso', 'Lote criado com sucesso!', [
        { text: 'OK', onPress: () => router.replace(`/batches/${data.id}`) }
      ]);
    },
    onError: (error) => {
      Alert.alert('Erro', error.message || 'Erro ao criar lote');
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Novo Lote</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Informações do Lote</Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Nome do Lote"
                value={value}
                onChangeText={onChange}
                placeholder="Ex: Lote de Engorda 2024"
                error={errors.name?.message}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Descrição"
                value={value}
                onChangeText={onChange}
                placeholder="Descrição do lote..."
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top' }}
              />
            )}
          />

          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Localização"
                value={value}
                onChangeText={onChange}
                placeholder="Ex: Pasto 3, Curral Norte"
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
            title="Criar Lote"
            onPress={handleSubmit(onSubmit)}
            loading={createMutation.isPending}
            className="flex-1 ml-2"
          />
        </View>
      </ScrollView>
    </View>
  );
}
