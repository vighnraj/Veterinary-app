import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiEdit2, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { animalsApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { STATUS_LABELS } from '../../constants/enums';
import { getErrorMessage } from '../../utils/helpers';
import {
  Loading,
  Card,
  Badge,
  Button,
  ConfirmDialog,
  Alert,
  DataTable,
} from '../../components/common';

const BatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState('');

  const { data: batch, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.BATCH, id],
    queryFn: () => animalsApi.getBatch(id),
    select: (res) => res.data.data,
  });

  const deleteMutation = useMutation({
    mutationFn: () => animalsApi.deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.BATCHES]);
      navigate(ROUTES.BATCHES);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setShowDelete(false);
    },
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!batch) {
    return (
      <div className="text-center py-5">
        <h5>Lote não encontrado</h5>
        <Link to={ROUTES.BATCHES} className="btn btn-primary mt-3">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <Link to={ROUTES.BATCHES}>Lotes</Link>
              </li>
              <li className="breadcrumb-item active">{batch.name}</li>
            </ol>
          </nav>
          <h1 className="page-title">{batch.name}</h1>
          {batch.description && (
            <p className="page-subtitle">{batch.description}</p>
          )}
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-danger"
            onClick={() => setShowDelete(true)}
          >
            <FiTrash2 className="me-2" />
            Excluir
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Info */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <Card>
            <div className="text-center">
              <h4 className="mb-0">{batch._count?.animals || 0}</h4>
              <small className="text-muted">Animais no Lote</small>
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <div className="text-center">
              <h6 className="mb-0">{batch.client?.name || '-'}</h6>
              <small className="text-muted">Proprietário</small>
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card>
            <div className="text-center">
              <h6 className="mb-0">{batch.property?.name || '-'}</h6>
              <small className="text-muted">Propriedade</small>
            </div>
          </Card>
        </div>
      </div>

      {/* Animals */}
      <Card title="Animais do Lote" noPadding>
        <DataTable
          columns={[
            {
              key: 'identifier',
              title: 'Identificação',
              render: (_, row) => (
                <Link to={`/animals/${row.id}`}>
                  {row.identifier}
                  {row.name && (
                    <small className="text-muted ms-2">({row.name})</small>
                  )}
                </Link>
              ),
            },
            {
              key: 'species',
              title: 'Espécie',
              render: (value) => value?.name || '-',
            },
            {
              key: 'sex',
              title: 'Sexo',
              render: (value) => STATUS_LABELS[value] || value,
            },
            {
              key: 'status',
              title: 'Status',
              render: (value) => <Badge status={value} />,
            },
          ]}
          data={batch.animals || []}
          emptyTitle="Nenhum animal neste lote"
          emptyDescription="Adicione animais a este lote"
        />
      </Card>

      <ConfirmDialog
        show={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Excluir Lote"
        message="Tem certeza que deseja excluir este lote? Os animais do lote não serão excluídos."
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default BatchDetail;
