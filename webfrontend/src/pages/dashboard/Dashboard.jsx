import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiBox,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiAlertCircle,
  FiPlus,
} from 'react-icons/fi';
import { dashboardApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { Loading } from '../../components/common';
import StatsCard from '../../components/dashboard/StatsCard';
import AppointmentsWidget from '../../components/dashboard/AppointmentsWidget';
import AlertsWidget from '../../components/dashboard/AlertsWidget';

const Dashboard = () => {
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD, 'overview'],
    queryFn: () => dashboardApi.getOverview(),
    select: (res) => res.data.data,
  });

  const { data: todayAppointments, isLoading: loadingAppointments } = useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD, 'today'],
    queryFn: () => dashboardApi.getTodayAppointments(),
    select: (res) => res.data.data,
  });

  const { data: alerts, isLoading: loadingAlerts } = useQuery({
    queryKey: [QUERY_KEYS.ALERTS],
    queryFn: () => dashboardApi.getAlerts(),
    select: (res) => res.data.data,
  });

  if (loadingOverview) {
    return <Loading fullScreen />;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral do seu negócio</p>
        </div>
        <div className="d-flex gap-2">
          <Link to={ROUTES.APPOINTMENT_CREATE} className="btn btn-primary">
            <FiPlus className="me-2" />
            Novo Agendamento
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Total de Clientes"
            value={formatNumber(overview?.totalClients || 0)}
            icon={FiUsers}
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Total de Animais"
            value={formatNumber(overview?.totalAnimals || 0)}
            icon={FiBox}
            color="success"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Agendamentos (Mês)"
            value={formatNumber(overview?.appointmentsThisMonth || 0)}
            icon={FiCalendar}
            color="info"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Receita (Mês)"
            value={formatCurrency(overview?.revenueThisMonth || 0)}
            icon={FiDollarSign}
            color="warning"
          />
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Receita Pendente"
            value={formatCurrency(overview?.pendingRevenue || 0)}
            icon={FiTrendingUp}
            color="warning"
            subtitle="A receber"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Faturas Vencidas"
            value={formatNumber(overview?.overdueInvoices || 0)}
            icon={FiAlertCircle}
            color="danger"
            subtitle={overview?.overdueInvoices > 0 ? 'Requer atenção' : 'Tudo em dia'}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Agendamentos Hoje"
            value={formatNumber(todayAppointments?.length || 0)}
            icon={FiCalendar}
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Alertas Pendentes"
            value={formatNumber(alerts?.length || 0)}
            icon={FiAlertCircle}
            color={alerts?.length > 0 ? 'warning' : 'success'}
          />
        </div>
      </div>

      {/* Widgets */}
      <div className="row g-4">
        <div className="col-lg-6">
          <AppointmentsWidget
            appointments={todayAppointments}
            loading={loadingAppointments}
          />
        </div>
        <div className="col-lg-6">
          <AlertsWidget alerts={alerts} loading={loadingAlerts} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-4 mt-2">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">Acesso Rápido</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6 col-md-4 col-lg-2">
                  <Link
                    to={ROUTES.CLIENT_CREATE}
                    className="btn btn-outline-primary w-100 d-flex flex-column align-items-center py-3"
                  >
                    <FiUsers size={24} className="mb-2" />
                    <small>Novo Cliente</small>
                  </Link>
                </div>
                <div className="col-6 col-md-4 col-lg-2">
                  <Link
                    to={ROUTES.ANIMAL_CREATE}
                    className="btn btn-outline-success w-100 d-flex flex-column align-items-center py-3"
                  >
                    <FiBox size={24} className="mb-2" />
                    <small>Novo Animal</small>
                  </Link>
                </div>
                <div className="col-6 col-md-4 col-lg-2">
                  <Link
                    to={ROUTES.APPOINTMENT_CREATE}
                    className="btn btn-outline-info w-100 d-flex flex-column align-items-center py-3"
                  >
                    <FiCalendar size={24} className="mb-2" />
                    <small>Novo Agendamento</small>
                  </Link>
                </div>
                <div className="col-6 col-md-4 col-lg-2">
                  <Link
                    to={ROUTES.INVOICE_CREATE}
                    className="btn btn-outline-warning w-100 d-flex flex-column align-items-center py-3"
                  >
                    <FiDollarSign size={24} className="mb-2" />
                    <small>Nova Fatura</small>
                  </Link>
                </div>
                <div className="col-6 col-md-4 col-lg-2">
                  <Link
                    to={ROUTES.REPRODUCTIVE}
                    className="btn btn-outline-danger w-100 d-flex flex-column align-items-center py-3"
                  >
                    <FiTrendingUp size={24} className="mb-2" />
                    <small>Reprodutivo</small>
                  </Link>
                </div>
                <div className="col-6 col-md-4 col-lg-2">
                  <Link
                    to={ROUTES.SANITARY}
                    className="btn btn-outline-secondary w-100 d-flex flex-column align-items-center py-3"
                  >
                    <FiAlertCircle size={24} className="mb-2" />
                    <small>Sanitário</small>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
