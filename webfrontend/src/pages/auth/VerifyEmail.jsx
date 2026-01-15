import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api';
import { ROUTES } from '../../constants/routes';
import { Loading, Alert } from '../../components/common';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Token de verificação não encontrado');
        setLoading(false);
        return;
      }

      try {
        await authApi.verifyEmail(token);
        setSuccess(true);
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao verificar email');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

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
              <div className="card-body p-4 text-center">
                {loading ? (
                  <>
                    <Loading />
                    <p className="text-muted mt-3">Verificando email...</p>
                  </>
                ) : success ? (
                  <>
                    <div className="text-success mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                      </svg>
                    </div>
                    <h2 className="h5 mb-3">Email verificado!</h2>
                    <p className="text-muted mb-4">
                      Sua conta foi ativada com sucesso. Agora você pode fazer
                      login.
                    </p>
                    <Link to={ROUTES.LOGIN} className="btn btn-primary">
                      Fazer Login
                    </Link>
                  </>
                ) : (
                  <>
                    <Alert variant="danger">
                      <strong>Erro na verificação</strong>
                      <p className="mb-0 mt-2 small">{error}</p>
                    </Alert>
                    <Link to={ROUTES.LOGIN} className="btn btn-primary mt-3">
                      Ir para o Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
