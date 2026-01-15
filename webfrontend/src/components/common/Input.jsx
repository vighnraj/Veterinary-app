import { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      name,
      type = 'text',
      placeholder,
      error,
      helpText,
      required = false,
      disabled = false,
      className = '',
      inputClassName = '',
      ...props
    },
    ref
  ) => {
    const inputId = `input-${name}`;

    if (type === 'textarea') {
      return (
        <div className={`mb-3 ${className}`}>
          {label && (
            <label htmlFor={inputId} className="form-label">
              {label}
              {required && <span className="text-danger ms-1">*</span>}
            </label>
          )}
          <textarea
            ref={ref}
            id={inputId}
            name={name}
            placeholder={placeholder}
            disabled={disabled}
            className={`form-control ${error ? 'is-invalid' : ''} ${inputClassName}`}
            {...props}
          />
          {error && <div className="invalid-feedback">{error}</div>}
          {helpText && !error && <div className="form-text">{helpText}</div>}
        </div>
      );
    }

    if (type === 'select') {
      return (
        <div className={`mb-3 ${className}`}>
          {label && (
            <label htmlFor={inputId} className="form-label">
              {label}
              {required && <span className="text-danger ms-1">*</span>}
            </label>
          )}
          <select
            ref={ref}
            id={inputId}
            name={name}
            disabled={disabled}
            className={`form-select ${error ? 'is-invalid' : ''} ${inputClassName}`}
            {...props}
          />
          {error && <div className="invalid-feedback">{error}</div>}
          {helpText && !error && <div className="form-text">{helpText}</div>}
        </div>
      );
    }

    return (
      <div className={`mb-3 ${className}`}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          id={inputId}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-control ${error ? 'is-invalid' : ''} ${inputClassName}`}
          {...props}
        />
        {error && <div className="invalid-feedback">{error}</div>}
        {helpText && !error && <div className="form-text">{helpText}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
