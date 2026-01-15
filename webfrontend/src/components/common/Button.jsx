const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  outline = false,
  block = false,
  className = '',
  onClick,
  ...props
}) => {
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  const variantClass = outline ? `btn-outline-${variant}` : `btn-${variant}`;

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClasses[size]} ${block ? 'w-100' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          />
          Aguarde...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
