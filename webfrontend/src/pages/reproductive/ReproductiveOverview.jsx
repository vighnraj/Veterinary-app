import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiHeart, FiActivity, FiTarget, FiCalendar } from 'react-icons/fi';
import { reproductiveApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { Card, Loading } from '../../components/common';
import StatsCard from '../../components/dashboard/StatsCard';

const ReproductiveOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.REPRODUCTIVE_STATS],
    queryFn: () => reproductiveApi.getStats(),
    select: (res) => res.data.data,
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">Reprodutivo</h1>
          <p className="page-subtitle">Gestão reprodutiva do rebanho</p>
        </div>
        <Link to={ROUTES.PREGNANT_ANIMALS} className="btn btn-primary">
          <FiHeart className="me-2" />
          Fêmeas Prenhas
        </Link>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Fêmeas Prenhas"
            value={formatNumber(stats?.pregnantCount || 0)}
            icon={FiHeart}
            color="success"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Taxa de Prenhez"
            value={formatPercent(stats?.pregnancyRate || 0)}
            icon={FiTarget}
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Inseminações (Mês)"
            value={formatNumber(stats?.inseminationsThisMonth || 0)}
            icon={FiActivity}
            color="info"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatsCard
            title="Partos Previstos"
            value={formatNumber(stats?.expectedBirths || 0)}
            icon={FiCalendar}
            color="warning"
            subtitle="Próximos 30 dias"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-4">
        <div className="col-md-6 col-lg-3">
          <Card className="h-100 cursor-pointer hover-shadow">
            <div className="text-center py-3">
              <FiActivity size={40} className="text-primary mb-3" />
              <h6>Registrar Cio</h6>
              <small className="text-muted">Detecção de estro</small>
            </div>
          </Card>
        </div>
        <div className="col-md-6 col-lg-3">
          <Card className="h-100 cursor-pointer hover-shadow">
            <div className="text-center py-3">
              <FiTarget size={40} className="text-success mb-3" />
              <h6>Inseminação</h6>
              <small className="text-muted">IA ou IATF</small>
            </div>
          </Card>
        </div>
        <div className="col-md-6 col-lg-3">
          <Card className="h-100 cursor-pointer hover-shadow">
            <div className="text-center py-3">
              <FiHeart size={40} className="text-info mb-3" />
              <h6>Diagnóstico</h6>
              <small className="text-muted">Confirmação de prenhez</small>
            </div>
          </Card>
        </div>
        <div className="col-md-6 col-lg-3">
          <Card className="h-100 cursor-pointer hover-shadow">
            <div className="text-center py-3">
              <FiCalendar size={40} className="text-warning mb-3" />
              <h6>Parto</h6>
              <small className="text-muted">Registro de nascimento</small>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReproductiveOverview;
