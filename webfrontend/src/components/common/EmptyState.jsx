import { FiInbox } from 'react-icons/fi';

const EmptyState = ({
  icon: Icon = FiInbox,
  title = 'Nenhum item encontrado',
  description,
  action,
  actionText = 'Adicionar',
  onAction,
}) => {
  return (
    <div className="text-center py-5">
      <Icon className="text-muted mb-3" size={48} />
      <h5 className="text-muted">{title}</h5>
      {description && <p className="text-muted">{description}</p>}
      {action || (onAction && (
        <button className="btn btn-primary mt-3" onClick={onAction}>
          {actionText}
        </button>
      ))}
    </div>
  );
};

export default EmptyState;
