import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { subscriptionApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/helpers';
import { Card, Button, Loading, Alert } from '../../components/common';

const Plans = () => {
  const navigate = useNavigate();
  const { account } = useAuth();
  const [error, setError] = useState('');
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const { data: plans, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PLANS],
    queryFn: () => subscriptionApi.getPlans(),
    select: (res) => res.data.data,
  });

  const checkoutMutation = useMutation({
    mutationFn: (planId) =>
      subscriptionApi.createCheckoutSession({ planId, billingPeriod }),
    onSuccess: (res) => {
      if (res.data.data.url) {
        window.location.href = res.data.data.url;
      }
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div>
      <div className="page-header text-center">
        <h1 className="page-title">Escolha seu Plano</h1>
        <p className="page-subtitle">Selecione o plano ideal para seu negócio</p>

        {/* Billing Toggle */}
        <div className="d-flex justify-content-center gap-3 mt-4">
          <div className="btn-group">
            <button
              className={`btn ${
                billingPeriod === 'monthly' ? 'btn-primary' : 'btn-outline-primary'
              }`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Mensal
            </button>
            <button
              className={`btn ${
                billingPeriod === 'yearly' ? 'btn-primary' : 'btn-outline-primary'
              }`}
              onClick={() => setBillingPeriod('yearly')}
            >
              Anual <small className="ms-1">(2 meses grátis)</small>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="row g-4 justify-content-center">
        {plans?.map((plan) => {
          const price =
            billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly / 12;
          const isCurrentPlan = account?.plan?.id === plan.id;

          return (
            <div key={plan.id} className="col-md-6 col-lg-4">
              <Card
                className={`h-100 ${isCurrentPlan ? 'border-primary' : ''}`}
              >
                {isCurrentPlan && (
                  <div className="text-center mb-3">
                    <span className="badge bg-primary">Plano Atual</span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="mb-1">{plan.name}</h3>
                  <p className="text-muted small">{plan.description}</p>
                </div>

                <div className="text-center mb-4">
                  <h2 className="mb-0">
                    {formatCurrency(price)}
                    <small className="text-muted">/mês</small>
                  </h2>
                  {billingPeriod === 'yearly' && (
                    <small className="text-muted">
                      {formatCurrency(plan.priceYearly)} cobrado anualmente
                    </small>
                  )}
                </div>

                <ul className="list-unstyled mb-4">
                  <li className="mb-2">
                    <FiCheck className="text-success me-2" />
                    Até {plan.maxUsers} usuários
                  </li>
                  <li className="mb-2">
                    <FiCheck className="text-success me-2" />
                    Até {plan.maxAnimals} animais
                  </li>
                  <li className="mb-2">
                    <FiCheck className="text-success me-2" />
                    Até {plan.maxClients} clientes
                  </li>
                  <li className="mb-2">
                    <FiCheck className="text-success me-2" />
                    {plan.maxStorageGB} GB de armazenamento
                  </li>
                  {plan.features?.reports && (
                    <li className="mb-2">
                      <FiCheck className="text-success me-2" />
                      Relatórios avançados
                    </li>
                  )}
                  {plan.features?.api && (
                    <li className="mb-2">
                      <FiCheck className="text-success me-2" />
                      Acesso à API
                    </li>
                  )}
                </ul>

                <div className="d-grid">
                  {isCurrentPlan ? (
                    <Button variant="secondary" disabled>
                      Plano Atual
                    </Button>
                  ) : (
                    <Button
                      onClick={() => checkoutMutation.mutate(plan.id)}
                      loading={checkoutMutation.isPending}
                    >
                      Assinar
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Plans;
