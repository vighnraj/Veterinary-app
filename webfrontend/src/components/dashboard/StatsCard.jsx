const StatsCard = ({ title, value, icon: Icon, color = 'primary', subtitle, trend }) => {
  return (
    <div className="card stats-card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted mb-1 small">{title}</p>
            <h3 className="mb-0 fw-bold">{value}</h3>
            {subtitle && <small className="text-muted">{subtitle}</small>}
            {trend && (
              <small className={`d-block mt-1 text-${trend > 0 ? 'success' : 'danger'}`}>
                {trend > 0 ? '+' : ''}{trend}% em relação ao mês anterior
              </small>
            )}
          </div>
          {Icon && (
            <div className={`rounded-circle bg-${color} bg-opacity-10 p-3`}>
              <Icon className={`text-${color}`} size={24} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
