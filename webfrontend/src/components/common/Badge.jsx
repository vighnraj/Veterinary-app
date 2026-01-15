import { STATUS_LABELS } from '../../constants/enums';
import { getStatusColor } from '../../utils/helpers';

const Badge = ({ status, label, variant, className = '' }) => {
  const color = variant || getStatusColor(status);
  const text = label || STATUS_LABELS[status] || status;

  return (
    <span className={`badge bg-${color} ${className}`}>
      {text}
    </span>
  );
};

export default Badge;
