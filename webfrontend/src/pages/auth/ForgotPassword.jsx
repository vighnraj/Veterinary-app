import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { authApi } from '../../api';
import { forgotPasswordSchema } from '../../utils/validators';
import { getErrorMessage } from '../../utils/helpers';
import { ROUTES } from '../../constants/routes';
import { Button, Input, Alert } from '../../components/common';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      await authApi.forgotPassword(data.email);
      setSuccess(true);
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
                <h2 className="h5 mb-2 text-center">Recuperar senha</h2>
                <p className="text-muted text-center small mb-4">
                  Digite seu email para receber instruções
                </p>

                {success ? (
                  <Alert variant="success">
                    <strong>Email enviado!</strong>
                    <p className="mb-0 mt-2 small">
                      Verifique sua caixa de entrada e siga as instruções para
                      redefinir sua senha.
                    </p>
                  </Alert>
                ) : (
                  <>
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

                      <Button type="submit" block loading={loading}>
                        Enviar instruções
                      </Button>
                    </form>
                  </>
                )}
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

export default ForgotPassword;
