import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEye, FiFilter } from 'react-icons/fi';
import { financialApi, clientsApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  Card,
  DataTable,
  Badge,
  Input,
} from '../../components/common';

const InvoicesList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    clientId: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.INVOICES, { page, ...filters }],
    queryFn: () =>
      financialApi.getInvoices({
        page,
        limit: 20,
        ...Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== '')
        ),
      }),
    select: (res) => res.data,
  });

  const { data: clients } = useQuery({
    queryKey: [QUERY_KEYS.CLIENTS, 'all'],
    queryFn: () => clientsApi.getClients({ limit: 100 }),
    select: (res) => res.data.data,
  });

  const columns = [
    {
      key: 'invoiceNumber',
      title: 'Número',
      render: (value) => <span className="fw-medium">#{value}</span>,
    },
    {
      key: 'client',
      title: 'Cliente',
      render: (value) => value?.name || '-',
    },
    {
      key: 'issueDate',
      title: 'Emissão',
      render: (value) => formatDate(value),
    },
    {
      key: 'dueDate',
      title: 'Vencimento',
      render: (value) => formatDate(value),
    },
    {
      key: 'totalAmount',
      title: 'Valor',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => <Badge status={value} />,
    },
    {
      key: 'actions',
      title: '',
      width: '80px',
      render: (_, row) => (
        <Link
          to={`/financial/invoices/${row.id}`}
          className="btn btn-sm btn-outline-primary"
        >
          <FiEye size={14} />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <Link to={ROUTES.FINANCIAL}>Financeiro</Link>
              </li>
              <li className="breadcrumb-item active">Faturas</li>
            </ol>
          </nav>
          <h1 className="page-title">Faturas</h1>
        </div>
        <Link to={ROUTES.INVOICE_CREATE} className="btn btn-primary">
          <FiPlus className="me-2" />
          Nova Fatura
        </Link>
      </div>

      <Card noPadding>
        <div className="p-3 border-bottom">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter className="me-2" />
            Filtros
          </button>

          {showFilters && (
            <div className="row g-3 mt-2">
              <div className="col-md-3">
                <Input
                  type="select"
                  label="Cliente"
                  value={filters.clientId}
                  onChange={(e) =>
                    setFilters({ ...filters, clientId: e.target.value })
                  }
                >
                  <option value="">Todos</option>
                  {clients?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Input>
              </div>
              <div className="col-md-3">
                <Input
                  type="select"
                  label="Status"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="">Todos</option>
                  <option value="draft">Rascunho</option>
                  <option value="sent">Enviada</option>
                  <option value="paid">Paga</option>
                  <option value="partial">Parcial</option>
                  <option value="overdue">Vencida</option>
                  <option value="cancelled">Cancelada</option>
                </Input>
              </div>
              <div className="col-md-3">
                <Input
                  type="date"
                  label="Data Início"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                />
              </div>
              <div className="col-md-3">
                <Input
                  type="date"
                  label="Data Fim"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
          onRowClick={(row) => navigate(`/financial/invoices/${row.id}`)}
          emptyTitle="Nenhuma fatura"
          emptyDescription="Crie sua primeira fatura"
        />
      </Card>
    </div>
  );
};

export default InvoicesList;
