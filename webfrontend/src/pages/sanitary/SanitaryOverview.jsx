import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import { sanitaryApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { formatNumber } from '../../utils/formatters';
import { Card, Loading } from '../../components/common';
import StatsCard from '../../components/dashboard/StatsCard';

const SanitaryOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SANITARY_STATS],
    queryFn: () => sanitaryApi.getStats(),
    select: (res) => res.data.data,
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">Sanitário</h1>
          <p className="page-subtitle">Gestão sanitária do rebanho</p>
        </div>
        <div className="d-flex gap-2">
          <Link to={ROUTES.VACCINATION_ALERTS} className="btn btn-warning">
            <FiAlertTriangle className="me-2" />
            Alertas
          </Link>
          <Link to={ROUTES.CAMPAIGNS} className="btn btn-primary">
            <FiCalendar className="me-2" />
            Campanhas
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Vacinações (Mês)"
            value={formatNumber(stats?.vaccinationsThisMonth || 0)}
            icon={FiShield}
            color="success"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Alertas Pendentes"
            value={formatNumber(stats?.pendingAlerts || 0)}
            icon={FiAlertTriangle}
            color="warning"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Animais Vacinados"
            value={formatNumber(stats?.vaccinatedAnimals || 0)}
            icon={FiCheckCircle}
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Campanhas Ativas"
            value={formatNumber(stats?.activeCampaigns || 0)}
            icon={FiCalendar}
            color="info"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-4">
        <div className="col-md-6 col-lg-4">
          <Card className="h-100 cursor-pointer hover-shadow">
            <div className="text-center py-3">
              <FiShield size={40} className="text-success mb-3" />
              <h6>Aplicar Vacina</h6>
              <small className="text-muted">Registrar vacinação individual</small>
            </div>
          </Card>
        </div>
        <div className="col-md-6 col-lg-4">
          <Card className="h-100 cursor-pointer hover-shadow">
            <div className="text-center py-3">
              <FiCheckCircle size={40} className="text-primary mb-3" />
              <h6>Vacinação em Lote</h6>
              <small className="text-muted">Aplicar em múltiplos animais</small>
            </div>
          </Card>
        </div>
        <div className="col-md-6 col-lg-4">
          <Card className="h-100 cursor-pointer hover-shadow">
            <div className="text-center py-3">
              <FiCalendar size={40} className="text-info mb-3" />
              <h6>Nova Campanha</h6>
              <small className="text-muted">Criar campanha sanitária</small>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SanitaryOverview;
