import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { sanitaryApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { formatDate, formatRelativeDate } from '../../utils/formatters';
import { Card, DataTable, Badge } from '../../components/common';

const VaccinationAlerts = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.VACCINATIONS, 'alerts', { page }],
    queryFn: () => sanitaryApi.getVaccinationAlerts({ page, limit: 20 }),
    select: (res) => res.data,
  });

  const columns = [
    {
      key: 'animal',
      title: 'Animal',
      render: (value) => (
        <Link to={`/animals/${value?.id}`}>
          {value?.identifier}
          {value?.name && <small className="text-muted ms-2">({value.name})</small>}
        </Link>
      ),
    },
    {
      key: 'vaccination',
      title: 'Vacina',
      render: (value) => value?.name || '-',
    },
    {
      key: 'nextDoseDate',
      title: 'Vencimento',
      render: (value) => (
        <div>
          <span>{formatDate(value)}</span>
          <small className="d-block text-muted">
            {formatRelativeDate(value)}
          </small>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, row) => {
        const dueDate = new Date(row.nextDoseDate);
        const today = new Date();
        const isOverdue = dueDate < today;
        return (
          <Badge
            variant={isOverdue ? 'danger' : 'warning'}
            label={isOverdue ? 'Vencida' : 'A vencer'}
          />
        );
      },
    },
  ];

  return (
    <div>
      <div className="page-header">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-1">
            <li className="breadcrumb-item">
              <Link to={ROUTES.SANITARY}>Sanitário</Link>
            </li>
            <li className="breadcrumb-item active">Alertas de Vacinação</li>
          </ol>
        </nav>
        <h1 className="page-title">Alertas de Vacinação</h1>
        <p className="page-subtitle">
          Vacinas a vencer ou vencidas
        </p>
      </div>

      <Card noPadding>
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
          emptyTitle="Nenhum alerta"
          emptyDescription="Não há vacinas pendentes no momento"
        />
      </Card>
    </div>
  );
};

export default VaccinationAlerts;
