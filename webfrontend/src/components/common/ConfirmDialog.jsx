import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  show,
  onClose,
  onConfirm,
  title = 'Confirmar',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
}) => {
  return (
    <Modal
      show={show}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="mb-0">{message}</p>
    </Modal>
  );
};

export default ConfirmDialog;
