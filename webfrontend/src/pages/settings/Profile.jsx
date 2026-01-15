import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { authApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { profileSchema, changePasswordSchema } from '../../utils/validators';
import { getErrorMessage } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { Card, Input, Button, Alert } from '../../components/common';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user, resetProfile]);

  const profileMutation = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: (res) => {
      updateUser(res.data.data);
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: () => {
      setSuccess('Senha alterada com sucesso!');
      resetPassword();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle">Gerencie seu perfil e preferências</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onDismiss={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Perfil
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Senha
          </button>
        </li>
      </ul>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="row">
          <div className="col-lg-8">
            <Card title="Dados Pessoais">
              <form
                onSubmit={handleProfileSubmit((data) =>
                  profileMutation.mutate(data)
                )}
              >
                <div className="row">
                  <div className="col-md-6">
                    <Input
                      label="Nome"
                      error={profileErrors.firstName?.message}
                      required
                      {...registerProfile('firstName')}
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      label="Sobrenome"
                      error={profileErrors.lastName?.message}
                      required
                      {...registerProfile('lastName')}
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      label="Email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      helpText="O email não pode ser alterado"
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      label="Telefone"
                      placeholder="(00) 00000-0000"
                      error={profileErrors.phone?.message}
                      {...registerProfile('phone')}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Button type="submit" loading={profileMutation.isPending}>
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="row">
          <div className="col-lg-6">
            <Card title="Alterar Senha">
              <form
                onSubmit={handlePasswordSubmit((data) =>
                  passwordMutation.mutate({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                  })
                )}
              >
                <Input
                  label="Senha Atual"
                  type="password"
                  error={passwordErrors.currentPassword?.message}
                  required
                  {...registerPassword('currentPassword')}
                />
                <Input
                  label="Nova Senha"
                  type="password"
                  error={passwordErrors.newPassword?.message}
                  required
                  {...registerPassword('newPassword')}
                />
                <Input
                  label="Confirmar Nova Senha"
                  type="password"
                  error={passwordErrors.confirmPassword?.message}
                  required
                  {...registerPassword('confirmPassword')}
                />
                <div className="mt-3">
                  <Button type="submit" loading={passwordMutation.isPending}>
                    Alterar Senha
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
