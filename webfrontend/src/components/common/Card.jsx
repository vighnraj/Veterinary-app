const Card = ({
  children,
  title,
  subtitle,
  headerActions,
  footer,
  className = '',
  bodyClassName = '',
  noPadding = false,
}) => {
  return (
    <div className={`card shadow-sm ${className}`}>
      {(title || headerActions) && (
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <div>
            {title && <h5 className="card-title mb-0">{title}</h5>}
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      <div className={`card-body ${noPadding ? 'p-0' : ''} ${bodyClassName}`}>
        {children}
      </div>
      {footer && <div className="card-footer bg-white">{footer}</div>}
    </div>
  );
};

export default Card;
