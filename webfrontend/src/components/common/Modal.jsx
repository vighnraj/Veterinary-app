import { useEffect } from 'react';

const Modal = ({
  show,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  centered = true,
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    if (show) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    };
  }, [show]);

  if (!show) return null;

  const sizeClasses = {
    sm: 'modal-sm',
    md: '',
    lg: 'modal-lg',
    xl: 'modal-xl',
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        onClick={handleBackdropClick}
      >
        <div
          className={`modal-dialog ${sizeClasses[size]} ${centered ? 'modal-dialog-centered' : ''}`}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Fechar"
              />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

export default Modal;
