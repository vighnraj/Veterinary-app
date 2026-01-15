import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { authApi } from '../../api';
import { resetPasswordSchema } from '../../utils/validators';
import { getErrorMessage } from '../../utils/helpers';
import { ROUTES } from '../../constants/routes';
import { Button, Input, Alert } from '../../components/common';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    if (!token) {
      setError('Token inválido ou expirado');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.resetPassword({
        token,
        password: data.password,
      });
      navigate(ROUTES.LOGIN, {
        state: { message: 'Senha alterada com sucesso! Faça login.' },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5 col-xl-4">
              <div className="card shadow-sm">
                <div className="card-body p-4 text-center">
                  <Alert variant="danger">
                    <strong>Link inválido</strong>
                    <p className="mb-0 mt-2 small">
                      O link de recuperação é inválido ou expirou.
                    </p>
                  </Alert>
                  <Link to={ROUTES.FORGOT_PASSWORD} className="btn btn-primary mt-3">
                    Solicitar novo link
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <h2 className="h5 mb-2 text-center">Nova senha</h2>
                <p className="text-muted text-center small mb-4">
                  Digite sua nova senha
                </p>

                {error && (
                  <Alert variant="danger" dismissible onDismiss={() => setError('')}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Input
                    label="Nova Senha"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    error={errors.password?.message}
                    {...register('password')}
                  />

                  <Input
                    label="Confirmar Nova Senha"
                    type="password"
                    placeholder="Repita a senha"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />

                  <Button type="submit" block loading={loading}>
                    Alterar Senha
                  </Button>
                </form>
              </div>
            </div>

            <p className="text-center mt-4 text-muted">
              <Link to={ROUTES.LOGIN} className="text-primary">
                Voltar para o login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
