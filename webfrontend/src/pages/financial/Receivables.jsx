import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { financialApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { Card, DataTable, Badge } from '../../components/common';

const Receivables = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.INVOICES, 'overdue', { page }],
    queryFn: () => financialApi.getOverdueInvoices({ page, limit: 20 }),
    select: (res) => res.data,
  });

  const columns = [
    {
      key: 'invoiceNumber',
      title: 'Fatura',
      render: (value) => <span className="fw-medium">#{value}</span>,
    },
    {
      key: 'client',
      title: 'Cliente',
      render: (value) => value?.name || '-',
    },
    {
      key: 'dueDate',
      title: 'Vencimento',
      render: (value) => formatDate(value),
    },
    {
      key: 'totalAmount',
      title: 'Valor Total',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'paidAmount',
      title: 'Pago',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'balance',
      title: 'Saldo',
      render: (_, row) => (
        <span className="text-danger fw-medium">
          {formatCurrency(row.totalAmount - row.paidAmount)}
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
      <div className="page-header">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-1">
            <li className="breadcrumb-item">
              <Link to={ROUTES.FINANCIAL}>Financeiro</Link>
            </li>
            <li className="breadcrumb-item active">A Receber</li>
          </ol>
        </nav>
        <h1 className="page-title">Contas a Receber</h1>
        <p className="page-subtitle">Faturas em aberto e vencidas</p>
      </div>

      <Card noPadding>
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
          onRowClick={(row) => navigate(`/financial/invoices/${row.id}`)}
          emptyTitle="Nenhuma fatura em aberto"
          emptyDescription="Todas as faturas estão pagas"
        />
      </Card>
    </div>
  );
};

export default Receivables;
