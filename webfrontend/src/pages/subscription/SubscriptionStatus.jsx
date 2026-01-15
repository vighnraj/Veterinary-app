import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiCheck, FiAlertCircle, FiCreditCard } from 'react-icons/fi';
import { subscriptionApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { Card, Badge, Button, Loading, Alert } from '../../components/common';
import { useState } from 'react';
import { getErrorMessage } from '../../utils/helpers';

const SubscriptionStatus = () => {
  const { account, updateAccount } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const { data: status, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SUBSCRIPTION],
    queryFn: () => subscriptionApi.getSubscriptionStatus(),
    select: (res) => res.data.data,
  });

  const cancelMutation = useMutation({
    mutationFn: () => subscriptionApi.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.SUBSCRIPTION]);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const resumeMutation = useMutation({
    mutationFn: () => subscriptionApi.resumeSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.SUBSCRIPTION]);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const isActive = ['active', 'trialing'].includes(account?.subscriptionStatus);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Assinatura</h1>
        <p className="page-subtitle">Gerencie seu plano e pagamentos</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="row g-4">
        {/* Current Plan */}
        <div className="col-lg-6">
          <Card title="Plano Atual">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h3 className="mb-1">{account?.plan?.name || 'Free'}</h3>
                <Badge status={account?.subscriptionStatus} />
              </div>
              {isActive && (
                <div className="text-success">
                  <FiCheck size={32} />
                </div>
              )}
            </div>

            <div className="mb-4">
              <small className="text-muted d-block">Preço Mensal</small>
              <h4 className="mb-0">
                {formatCurrency(account?.plan?.priceMonthly || 0)}
                <small className="text-muted">/mês</small>
              </h4>
            </div>

            {account?.subscriptionStatus === 'trialing' && account?.trialEndsAt && (
              <Alert variant="info" icon={false}>
                <FiAlertCircle className="me-2" />
                Período de teste termina em{' '}
                <strong>{formatDate(account.trialEndsAt)}</strong>
              </Alert>
            )}

            <div className="d-flex gap-2">
              <Link to={ROUTES.PLANS} className="btn btn-primary">
                Ver Planos
              </Link>
              {account?.subscriptionStatus === 'active' && (
                <Button
                  variant="danger"
                  outline
                  onClick={() => cancelMutation.mutate()}
                  loading={cancelMutation.isPending}
                >
                  Cancelar
                </Button>
              )}
              {account?.subscriptionStatus === 'canceled' && (
                <Button
                  onClick={() => resumeMutation.mutate()}
                  loading={resumeMutation.isPending}
                >
                  Reativar
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Plan Limits */}
        <div className="col-lg-6">
          <Card title="Uso do Plano">
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <small>Usuários</small>
                <small>
                  {status?.usage?.users || 0} / {account?.plan?.maxUsers || 'Ilimitado'}
                </small>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${
                      ((status?.usage?.users || 0) / (account?.plan?.maxUsers || 100)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <small>Animais</small>
                <small>
                  {status?.usage?.animals || 0} / {account?.plan?.maxAnimals || 'Ilimitado'}
                </small>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div
                  className="progress-bar bg-success"
                  style={{
                    width: `${
                      ((status?.usage?.animals || 0) / (account?.plan?.maxAnimals || 1000)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <small>Clientes</small>
                <small>
                  {status?.usage?.clients || 0} / {account?.plan?.maxClients || 'Ilimitado'}
                </small>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div
                  className="progress-bar bg-info"
                  style={{
                    width: `${
                      ((status?.usage?.clients || 0) / (account?.plan?.maxClients || 100)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
