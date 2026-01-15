import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiTrendingUp, FiAlertCircle, FiFileText } from 'react-icons/fi';
import { financialApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { Card, Loading } from '../../components/common';
import StatsCard from '../../components/dashboard/StatsCard';

const FinancialOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.FINANCIAL_STATS],
    queryFn: () => financialApi.getFinancialStats(),
    select: (res) => res.data.data,
  });

  const { data: receivables } = useQuery({
    queryKey: [QUERY_KEYS.RECEIVABLES],
    queryFn: () => financialApi.getReceivables(),
    select: (res) => res.data.data,
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">Financeiro</h1>
          <p className="page-subtitle">Visão geral financeira</p>
        </div>
        <div className="d-flex gap-2">
          <Link to={ROUTES.RECEIVABLES} className="btn btn-outline-primary">
            <FiTrendingUp className="me-2" />
            A Receber
          </Link>
          <Link to={ROUTES.INVOICES} className="btn btn-primary">
            <FiFileText className="me-2" />
            Faturas
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Receita (Mês)"
            value={formatCurrency(stats?.revenueThisMonth || 0)}
            icon={FiDollarSign}
            color="success"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="A Receber"
            value={formatCurrency(receivables?.totalPending || 0)}
            icon={FiTrendingUp}
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Em Atraso"
            value={formatCurrency(receivables?.totalOverdue || 0)}
            icon={FiAlertCircle}
            color="danger"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Faturas (Mês)"
            value={formatNumber(stats?.invoicesThisMonth || 0)}
            icon={FiFileText}
            color="info"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-4">
        <div className="col-lg-6">
          <Card title="Resumo do Mês">
            <div className="row g-3">
              <div className="col-6">
                <small className="text-muted d-block">Total Faturado</small>
                <h5 className="text-primary mb-0">
                  {formatCurrency(stats?.totalBilledThisMonth || 0)}
                </h5>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Total Recebido</small>
                <h5 className="text-success mb-0">
                  {formatCurrency(stats?.totalReceivedThisMonth || 0)}
                </h5>
              </div>
            </div>
          </Card>
        </div>
        <div className="col-lg-6">
          <Card title="Situação de Recebíveis">
            <div className="row g-3">
              <div className="col-4">
                <small className="text-muted d-block">A Vencer</small>
                <h6 className="text-info mb-0">
                  {formatCurrency(receivables?.toReceive || 0)}
                </h6>
              </div>
              <div className="col-4">
                <small className="text-muted d-block">Vencidas</small>
                <h6 className="text-danger mb-0">
                  {formatCurrency(receivables?.totalOverdue || 0)}
                </h6>
              </div>
              <div className="col-4">
                <small className="text-muted d-block">Total</small>
                <h6 className="text-primary mb-0">
                  {formatCurrency(receivables?.totalPending || 0)}
                </h6>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;
