import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiUser, FiArrowRight } from 'react-icons/fi';
import { Card, Badge, EmptyState } from '../common';
import { formatTime, formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

const AppointmentsWidget = ({ appointments = [], loading }) => {
  if (loading) {
    return (
      <Card title="Agendamentos de Hoje">
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Agendamentos de Hoje"
      headerActions={
        <Link to={ROUTES.APPOINTMENTS} className="btn btn-sm btn-outline-primary">
          Ver todos
        </Link>
      }
    >
      {appointments.length === 0 ? (
        <EmptyState
          icon={FiCalendar}
          title="Nenhum agendamento hoje"
          description="Você não tem atendimentos agendados para hoje"
        />
      ) : (
        <div className="list-group list-group-flush">
          {appointments.slice(0, 5).map((appointment) => (
            <Link
              key={appointment.id}
              to={`/appointments/${appointment.id}`}
              className="list-group-item list-group-item-action"
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <FiClock size={14} className="text-muted" />
                    <span className="fw-medium">
                      {formatTime(appointment.scheduledDate)}
                    </span>
                    <Badge status={appointment.status} />
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <FiUser size={14} />
                    <span>{appointment.client?.name || 'Cliente não informado'}</span>
                  </div>
                  {appointment.appointmentServices?.length > 0 && (
                    <small className="text-muted">
                      {appointment.appointmentServices
                        .map((s) => s.service?.name)
                        .filter(Boolean)
                        .join(', ')}
                    </small>
                  )}
                </div>
                <FiArrowRight className="text-muted" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AppointmentsWidget;
