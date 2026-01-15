import { FiX, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

const icons = {
  danger: FiAlertCircle,
  success: FiCheckCircle,
  warning: FiAlertTriangle,
  info: FiInfo,
};

const Alert = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
  icon = true,
}) => {
  const Icon = icons[variant] || FiInfo;

  return (
    <div className={`alert alert-${variant} ${dismissible ? 'alert-dismissible' : ''} ${className}`} role="alert">
      <div className="d-flex align-items-start">
        {icon && <Icon className="me-2 flex-shrink-0 mt-1" size={18} />}
        <div className="flex-grow-1">
          {title && <h6 className="alert-heading mb-1">{title}</h6>}
          {children}
        </div>
      </div>
      {dismissible && (
        <button
          type="button"
          className="btn-close"
          aria-label="Fechar"
          onClick={onDismiss}
        />
      )}
    </div>
  );
};

export default Alert;
