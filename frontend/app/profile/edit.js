import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Card from '../../src/components/common/Card';
import Button from '../../src/components/common/Button';
import Input from '../../src/components/common/Input';
import { profileApi } from '../../src/api';
import { useAuthStore } from '../../src/store/authStore';

const schema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  phone: yup.string(),
  crmv: yup.string(),
  specialty: yup.string(),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Senha atual é obrigatória'),
  newPassword: yup.string().min(8, 'Mínimo 8 caracteres').required('Nova senha é obrigatória'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Senhas não conferem')
    .required('Confirmação é obrigatória'),
});

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      crmv: '',
      specialty: '',
    },
  });

  const { control: passwordControl, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        crmv: profile.crmv || '',
        specialty: profile.specialty || '',
      });
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: profileApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['profile']);
      setUser({ ...user, ...data });
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    },
    onError: (error) => {
      Alert.alert('Erro', error.message || 'Erro ao atualizar perfil');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      resetPassword();
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
    },
    onError: (error) => {
      Alert.alert('Erro', error.message || 'Erro ao alterar senha');
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  const onPasswordSubmit = (data) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
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
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Editar Perfil</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Profile Info */}
        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Informações Pessoais</Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Nome"
                value={value}
                onChangeText={onChange}
                placeholder="Seu nome completo"
                required
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                value={value}
                onChangeText={onChange}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                required
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Telefone"
                value={value}
                onChangeText={onChange}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
              />
            )}
          />
        </Card>

        {/* Professional Info */}
        <Card className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Informações Profissionais</Text>

          <Controller
            control={control}
            name="crmv"
            render={({ field: { onChange, value } }) => (
              <Input
                label="CRMV"
                value={value}
                onChangeText={onChange}
                placeholder="Ex: CRMV-SP 12345"
              />
            )}
          />

          <Controller
            control={control}
            name="specialty"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Especialidade"
                value={value}
                onChangeText={onChange}
                placeholder="Ex: Reprodução de Bovinos"
              />
            )}
          />

          <Button
            title="Salvar Alterações"
            onPress={handleSubmit(onSubmit)}
            loading={updateMutation.isPending}
            className="mt-2"
          />
        </Card>

        {/* Change Password */}
        <Card className="mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-4">Alterar Senha</Text>

          <Controller
            control={passwordControl}
            name="currentPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Senha Atual"
                value={value}
                onChangeText={onChange}
                placeholder="Digite sua senha atual"
                secureTextEntry
                error={passwordErrors.currentPassword?.message}
              />
            )}
          />

          <Controller
            control={passwordControl}
            name="newPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Nova Senha"
                value={value}
                onChangeText={onChange}
                placeholder="Digite a nova senha"
                secureTextEntry
                error={passwordErrors.newPassword?.message}
              />
            )}
          />

          <Controller
            control={passwordControl}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Confirmar Nova Senha"
                value={value}
                onChangeText={onChange}
                placeholder="Confirme a nova senha"
                secureTextEntry
                error={passwordErrors.confirmPassword?.message}
              />
            )}
          />

          <Button
            title="Alterar Senha"
            onPress={handlePasswordSubmit(onPasswordSubmit)}
            loading={changePasswordMutation.isPending}
            variant="outline"
            className="mt-2"
          />
        </Card>
      </ScrollView>
    </View>
  );
}
