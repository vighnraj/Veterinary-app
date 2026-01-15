import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema } from '../../utils/validators';
import { getErrorMessage } from '../../utils/helpers';
import { ROUTES } from '../../constants/routes';
import { Button, Input, Alert } from '../../components/common';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5 col-xl-4">
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold text-primary">VetSaaS</h1>
              <p className="text-muted">Sistema de Gestão Veterinária</p>
            </div>

            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="h5 mb-4 text-center">Entrar na sua conta</h2>

                {error && (
                  <Alert variant="danger" dismissible onDismiss={() => setError('')}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="seu@email.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  <Input
                    label="Senha"
                    type="password"
                    placeholder="Sua senha"
                    error={errors.password?.message}
                    {...register('password')}
                  />

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="remember"
                      />
                      <label className="form-check-label small" htmlFor="remember">
                        Lembrar de mim
                      </label>
                    </div>
                    <Link to={ROUTES.FORGOT_PASSWORD} className="small">
                      Esqueceu a senha?
                    </Link>
                  </div>

                  <Button type="submit" block loading={loading}>
                    Entrar
                  </Button>
                </form>
              </div>
            </div>

            <p className="text-center mt-4 text-muted">
              Não tem uma conta?{' '}
              <Link to={ROUTES.REGISTER} className="text-primary">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
