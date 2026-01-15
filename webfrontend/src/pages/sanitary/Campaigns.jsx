import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { sanitaryApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { formatDate } from '../../utils/formatters';
import { Card, DataTable, Badge, Button } from '../../components/common';

const Campaigns = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CAMPAIGNS, { page }],
    queryFn: () => sanitaryApi.getCampaigns({ page, limit: 20 }),
    select: (res) => res.data,
  });

  const columns = [
    {
      key: 'name',
      title: 'Campanha',
      render: (_, row) => (
        <div>
          <span className="fw-medium">{row.name}</span>
          {row.description && (
            <small className="d-block text-muted">{row.description}</small>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      title: 'Tipo',
      render: (value) => {
        const types = {
          vaccination: 'Vacinação',
          deworming: 'Vermifugação',
          testing: 'Testagem',
        };
        return types[value] || value;
      },
    },
    {
      key: 'startDate',
      title: 'Período',
      render: (_, row) => (
        <span>
          {formatDate(row.startDate)} - {formatDate(row.endDate)}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => <Badge status={value} />,
    },
  ];

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <Link to={ROUTES.SANITARY}>Sanitário</Link>
              </li>
              <li className="breadcrumb-item active">Campanhas</li>
            </ol>
          </nav>
          <h1 className="page-title">Campanhas Sanitárias</h1>
        </div>
        <Button>
          <FiPlus className="me-2" />
          Nova Campanha
        </Button>
      </div>

      <Card noPadding>
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
          emptyTitle="Nenhuma campanha"
          emptyDescription="Crie sua primeira campanha sanitária"
        />
      </Card>
    </div>
  );
};

export default Campaigns;
