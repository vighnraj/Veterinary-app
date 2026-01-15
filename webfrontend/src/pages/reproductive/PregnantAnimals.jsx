import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { reproductiveApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { formatDate, formatRelativeDate } from '../../utils/formatters';
import { Card, DataTable, Badge } from '../../components/common';

const PregnantAnimals = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PREGNANT_ANIMALS, { page }],
    queryFn: () => reproductiveApi.getPregnantAnimals({ page, limit: 20 }),
    select: (res) => res.data,
  });

  const columns = [
    {
      key: 'identifier',
      title: 'Animal',
      render: (_, row) => (
        <Link to={`/animals/${row.id}`}>
          {row.identifier}
          {row.name && <small className="text-muted ms-2">({row.name})</small>}
        </Link>
      ),
    },
    {
      key: 'client',
      title: 'Proprietário',
      render: (value) => value?.name || '-',
    },
    {
      key: 'expectedCalvingDate',
      title: 'Previsão de Parto',
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
      key: 'numberOfCalvings',
      title: 'Nº Partos',
      render: (value) => value || 0,
    },
    {
      key: 'reproductiveStatus',
      title: 'Status',
      render: (value) => <Badge status={value} />,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-1">
            <li className="breadcrumb-item">
              <Link to={ROUTES.REPRODUCTIVE}>Reprodutivo</Link>
            </li>
            <li className="breadcrumb-item active">Fêmeas Prenhas</li>
          </ol>
        </nav>
        <h1 className="page-title">Fêmeas Prenhas</h1>
        <p className="page-subtitle">
          Lista de fêmeas com prenhez confirmada
        </p>
      </div>

      <Card noPadding>
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
          emptyTitle="Nenhuma fêmea prenhe"
          emptyDescription="Não há animais com prenhez confirmada no momento"
        />
      </Card>
    </div>
  );
};

export default PregnantAnimals;
