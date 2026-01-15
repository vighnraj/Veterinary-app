import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../hooks/useAuth';
import { registerSchema } from '../../utils/validators';
import { getErrorMessage } from '../../utils/helpers';
import { ROUTES } from '../../constants/routes';
import { Button, Input, Alert } from '../../components/common';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      accountName: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        accountName: data.accountName,
      });
      navigate(ROUTES.LOGIN, {
        state: { message: 'Conta criada! Verifique seu email para ativar.' },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold text-primary">VetSaaS</h1>
              <p className="text-muted">Sistema de Gestão Veterinária</p>
            </div>

            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="h5 mb-4 text-center">Criar nova conta</h2>

                {error && (
                  <Alert variant="danger" dismissible onDismiss={() => setError('')}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row">
                    <div className="col-md-6">
                      <Input
                        label="Nome"
                        placeholder="Seu nome"
                        error={errors.firstName?.message}
                        required
                        {...register('firstName')}
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Sobrenome"
                        placeholder="Seu sobrenome"
                        error={errors.lastName?.message}
                        required
                        {...register('lastName')}
                      />
                    </div>
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    placeholder="seu@email.com"
                    error={errors.email?.message}
                    required
                    {...register('email')}
                  />

                  <Input
                    label="Nome da Empresa/Clínica"
                    placeholder="Nome da sua clínica"
                    error={errors.accountName?.message}
                    required
                    {...register('accountName')}
                  />

                  <div className="row">
                    <div className="col-md-6">
                      <Input
                        label="Senha"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        error={errors.password?.message}
                        required
                        {...register('password')}
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Confirmar Senha"
                        type="password"
                        placeholder="Repita a senha"
                        error={errors.confirmPassword?.message}
                        required
                        {...register('confirmPassword')}
                      />
                    </div>
                  </div>

                  <div className="form-check mb-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="terms"
                      required
                    />
                    <label className="form-check-label small" htmlFor="terms">
                      Concordo com os{' '}
                      <a href="#" className="text-primary">
                        Termos de Uso
                      </a>{' '}
                      e{' '}
                      <a href="#" className="text-primary">
                        Política de Privacidade
                      </a>
                    </label>
                  </div>

                  <Button type="submit" block loading={loading}>
                    Criar Conta
                  </Button>
                </form>
              </div>
            </div>

            <p className="text-center mt-4 text-muted">
              Já tem uma conta?{' '}
              <Link to={ROUTES.LOGIN} className="text-primary">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
