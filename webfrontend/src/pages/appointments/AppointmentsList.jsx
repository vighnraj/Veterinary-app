import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEye, FiCalendar, FiFilter } from 'react-icons/fi';
import { appointmentsApi, clientsApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { formatDateTime, formatDate } from '../../utils/formatters';
import {
  Card,
  DataTable,
  SearchInput,
  Badge,
  Input,
} from '../../components/common';

const AppointmentsList = () => {
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
    queryKey: [QUERY_KEYS.APPOINTMENTS, { page, ...filters }],
    queryFn: () =>
      appointmentsApi.getAppointments({
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
      key: 'scheduledDate',
      title: 'Data/Hora',
      render: (value) => formatDateTime(value),
    },
    {
      key: 'client',
      title: 'Cliente',
      render: (value) => value?.name || '-',
    },
    {
      key: 'services',
      title: 'Serviços',
      render: (_, row) =>
        row.appointmentServices
          ?.map((s) => s.service?.name)
          .filter(Boolean)
          .join(', ') || '-',
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
          to={`/appointments/${row.id}`}
          className="btn btn-sm btn-outline-primary"
          title="Visualizar"
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
          <h1 className="page-title">Agendamentos</h1>
          <p className="page-subtitle">Gerencie seus atendimentos</p>
        </div>
        <Link to={ROUTES.APPOINTMENT_CREATE} className="btn btn-primary">
          <FiPlus className="me-2" />
          Novo Agendamento
        </Link>
      </div>

      <Card noPadding>
        <div className="p-3 border-bottom">
          <div className="row g-3 align-items-end">
            <div className="col-md-8">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter className="me-2" />
                Filtros
              </button>
            </div>
          </div>

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
                  <option value="scheduled">Agendado</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
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
          onRowClick={(row) => navigate(`/appointments/${row.id}`)}
          emptyTitle="Nenhum agendamento"
          emptyDescription="Crie seu primeiro agendamento"
        />
      </Card>
    </div>
  );
};

export default AppointmentsList;
