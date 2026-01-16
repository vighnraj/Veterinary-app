import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import { notificationsApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { formatRelativeDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/helpers';
import {
  Card,
  Button,
  Loading,
  Alert,
  EmptyState,
  Pagination,
} from '../../components/common';

const Notifications = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, { page }],
    queryFn: () => notificationsApi.getNotifications({ page, limit: 20 }),
    select: (res) => res.data,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.NOTIFICATIONS]);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.NOTIFICATIONS]);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.NOTIFICATIONS]);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const notifications = data?.data?.notifications || [];
  const pagination = data?.data?.pagination;

  const getNotificationIcon = (type) => {
    // Could customize based on type
    return FiBell;
  };

  const getNotificationColor = (type) => {
    const colors = {
      appointment_reminder: 'primary',
      vaccine_due: 'warning',
      payment_due: 'danger',
      pregnancy_check: 'info',
    };
    return colors[type] || 'secondary';
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">Notificações</h1>
          <p className="page-subtitle">Suas notificações e alertas</p>
        </div>
        {notifications.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            loading={markAllReadMutation.isPending}
          >
            <FiCheck className="me-2" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card noPadding>
        {notifications.length === 0 ? (
          <EmptyState
            icon={FiBell}
            title="Nenhuma notificação"
            description="Você não tem notificações no momento"
          />
        ) : (
          <>
            <div className="list-group list-group-flush">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const color = getNotificationColor(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={`list-group-item ${
                      !notification.read ? 'bg-light' : ''
                    }`}
                  >
                    <div className="d-flex gap-3">
                      <div
                        className={`rounded-circle bg-${color} bg-opacity-10 p-2 flex-shrink-0 align-self-start`}
                      >
                        <Icon className={`text-${color}`} size={18} />
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">
                              {notification.title}
                              {!notification.read && (
                                <span className="badge bg-primary ms-2">Nova</span>
                              )}
                            </h6>
                            <p className="mb-1 text-muted">
                              {notification.message}
                            </p>
                            <small className="text-muted">
                              {formatRelativeDate(notification.createdAt)}
                            </small>
                          </div>
                          <div className="d-flex gap-1">
                            {!notification.read && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                title="Marcar como lida"
                                onClick={() =>
                                  markReadMutation.mutate(notification.id)
                                }
                              >
                                <FiCheck size={14} />
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Excluir"
                              onClick={() =>
                                deleteMutation.mutate(notification.id)
                              }
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {pagination && (
              <div className="p-3 border-top">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  limit={pagination.limit}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default Notifications;
