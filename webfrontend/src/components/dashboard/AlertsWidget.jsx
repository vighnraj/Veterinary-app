import { Link } from 'react-router-dom';
import { FiBell, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import { Card, Badge, EmptyState } from '../common';
import { formatRelativeDate } from '../../utils/formatters';

const AlertsWidget = ({ alerts = [], loading }) => {
  if (loading) {
    return (
      <Card title="Alertas">
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </Card>
    );
  }

  const getAlertColor = (type) => {
    const colors = {
      vaccine_due: 'warning',
      payment_due: 'danger',
      pregnancy_check: 'info',
      appointment_reminder: 'primary',
    };
    return colors[type] || 'secondary';
  };

  return (
    <Card
      title="Alertas"
      headerActions={
        <Link to="/notifications" className="btn btn-sm btn-outline-primary">
          Ver todos
        </Link>
      }
    >
      {alerts.length === 0 ? (
        <EmptyState
          icon={FiBell}
          title="Nenhum alerta"
          description="Você não tem alertas pendentes"
        />
      ) : (
        <div className="list-group list-group-flush">
          {alerts.slice(0, 5).map((alert, index) => (
            <div key={index} className="list-group-item">
              <div className="d-flex align-items-start gap-3">
                <div
                  className={`rounded-circle bg-${getAlertColor(alert.type)} bg-opacity-10 p-2 flex-shrink-0`}
                >
                  <FiAlertTriangle
                    className={`text-${getAlertColor(alert.type)}`}
                    size={16}
                  />
                </div>
                <div className="flex-grow-1 min-width-0">
                  <p className="mb-1 fw-medium text-truncate">{alert.title}</p>
                  <p className="mb-0 small text-muted text-truncate">
                    {alert.message}
                  </p>
                  {alert.dueDate && (
                    <small className="text-muted">
                      {formatRelativeDate(alert.dueDate)}
                    </small>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AlertsWidget;
