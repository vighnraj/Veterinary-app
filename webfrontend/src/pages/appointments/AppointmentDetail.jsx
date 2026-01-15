import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiClock, FiMapPin, FiUser, FiFileText } from 'react-icons/fi';
import { appointmentsApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { formatDateTime, formatDate, formatCurrency } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/helpers';
import {
  Loading,
  Card,
  Badge,
  Button,
  Alert,
  DataTable,
} from '../../components/common';

const AppointmentDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const { data: appointment, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.APPOINTMENT, id],
    queryFn: () => appointmentsApi.getAppointment(id),
    select: (res) => res.data.data,
  });

  const statusMutation = useMutation({
    mutationFn: (status) =>
      appointmentsApi.updateAppointmentStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.APPOINTMENT, id]);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!appointment) {
    return (
      <div className="text-center py-5">
        <h5>Agendamento não encontrado</h5>
        <Link to={ROUTES.APPOINTMENTS} className="btn btn-primary mt-3">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  const getNextStatus = () => {
    const flow = {
      scheduled: 'confirmed',
      confirmed: 'in_progress',
      in_progress: 'completed',
    };
    return flow[appointment.status];
  };

  const getStatusLabel = (status) => {
    const labels = {
      confirmed: 'Confirmar',
      in_progress: 'Iniciar',
      completed: 'Concluir',
    };
    return labels[status];
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <Link to={ROUTES.APPOINTMENTS}>Agendamentos</Link>
              </li>
              <li className="breadcrumb-item active">Detalhes</li>
            </ol>
          </nav>
          <h1 className="page-title">
            Agendamento - {formatDate(appointment.scheduledDate)}
          </h1>
          <Badge status={appointment.status} />
        </div>
        <div className="d-flex gap-2">
          {getNextStatus() && (
            <Button
              onClick={() => statusMutation.mutate(getNextStatus())}
              loading={statusMutation.isPending}
            >
              {getStatusLabel(getNextStatus())}
            </Button>
          )}
          {appointment.status !== 'cancelled' &&
            appointment.status !== 'completed' && (
              <Button
                variant="danger"
                outline
                onClick={() => statusMutation.mutate('cancelled')}
                loading={statusMutation.isPending}
              >
                Cancelar
              </Button>
            )}
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="row g-4">
        {/* Info */}
        <div className="col-lg-6">
          <Card title="Informações">
            <div className="row g-3">
              <div className="col-12">
                <div className="d-flex align-items-center gap-2">
                  <FiClock className="text-muted" />
                  <div>
                    <small className="text-muted d-block">Data/Hora</small>
                    <span>{formatDateTime(appointment.scheduledDate)}</span>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="d-flex align-items-center gap-2">
                  <FiUser className="text-muted" />
                  <div>
                    <small className="text-muted d-block">Cliente</small>
                    {appointment.client ? (
                      <Link to={`/clients/${appointment.client.id}`}>
                        {appointment.client.name}
                      </Link>
                    ) : (
                      '-'
                    )}
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="d-flex align-items-center gap-2">
                  <FiMapPin className="text-muted" />
                  <div>
                    <small className="text-muted d-block">Local</small>
                    <span>
                      {appointment.locationType === 'property'
                        ? 'Na propriedade'
                        : appointment.locationType === 'clinic'
                        ? 'Na clínica'
                        : 'Outro'}
                    </span>
                    {appointment.locationNotes && (
                      <small className="d-block text-muted">
                        {appointment.locationNotes}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Services */}
        <div className="col-lg-6">
          <Card title="Serviços" noPadding>
            {appointment.appointmentServices?.length > 0 ? (
              <div className="list-group list-group-flush">
                {appointment.appointmentServices.map((as) => (
                  <div key={as.id} className="list-group-item d-flex justify-content-between">
                    <div>
                      <span>{as.service?.name}</span>
                      {as.quantity > 1 && (
                        <small className="text-muted ms-2">x{as.quantity}</small>
                      )}
                    </div>
                    <span className="text-muted">
                      {formatCurrency(as.price || as.service?.defaultPrice)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-3 mb-0">
                Nenhum serviço vinculado
              </p>
            )}
          </Card>
        </div>

        {/* Animals */}
        <div className="col-12">
          <Card title="Animais" noPadding>
            <DataTable
              columns={[
                {
                  key: 'animal',
                  title: 'Animal',
                  render: (value) => (
                    <Link to={`/animals/${value?.id}`}>
                      {value?.identifier}
                      {value?.name && (
                        <small className="text-muted ms-2">({value.name})</small>
                      )}
                    </Link>
                  ),
                },
                {
                  key: 'procedureStatus',
                  title: 'Status do Procedimento',
                  render: (value) => <Badge status={value || 'pending'} />,
                },
                {
                  key: 'notes',
                  title: 'Observações',
                  render: (value) => value || '-',
                },
              ]}
              data={appointment.appointmentAnimals || []}
              emptyTitle="Nenhum animal vinculado"
            />
          </Card>
        </div>

        {/* Notes */}
        {appointment.notes && (
          <div className="col-12">
            <Card title="Observações">
              <p className="mb-0">{appointment.notes}</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetail;
