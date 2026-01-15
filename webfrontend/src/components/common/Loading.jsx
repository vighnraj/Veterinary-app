const Loading = ({ size = 'md', fullScreen = false, text = 'Carregando...' }) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border',
  };

  if (fullScreen) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
        <div className={`spinner-border text-primary ${sizeClasses[size]}`} role="status">
          <span className="visually-hidden">{text}</span>
        </div>
        {text && <p className="mt-3 text-muted">{text}</p>}
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center p-4">
      <div className={`spinner-border text-primary ${sizeClasses[size]}`} role="status">
        <span className="visually-hidden">{text}</span>
      </div>
    </div>
  );
};

export default Loading;
