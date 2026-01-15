import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { animalsApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { getErrorMessage } from '../../utils/helpers';
import {
  Card,
  DataTable,
  SearchInput,
  Button,
  Modal,
  ConfirmDialog,
  Alert,
  Input,
} from '../../components/common';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { batchSchema } from '../../utils/validators';

const BatchesList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.BATCHES, { search, page }],
    queryFn: () => animalsApi.getBatches({ search, page, limit: 20 }),
    select: (res) => res.data,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(batchSchema),
    defaultValues: {
      name: '',
      description: '',
      clientId: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      editingBatch
        ? animalsApi.updateBatch(editingBatch.id, data)
        : animalsApi.createBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.BATCHES]);
      setShowModal(false);
      setEditingBatch(null);
      reset();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => animalsApi.deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.BATCHES]);
      setDeleteId(null);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setDeleteId(null);
    },
  });

  const openModal = (batch = null) => {
    if (batch) {
      setEditingBatch(batch);
      reset({
        name: batch.name,
        description: batch.description || '',
        clientId: batch.clientId || '',
      });
    } else {
      setEditingBatch(null);
      reset({
        name: '',
        description: '',
        clientId: '',
      });
    }
    setShowModal(true);
  };

  const columns = [
    {
      key: 'name',
      title: 'Nome',
      render: (_, row) => (
        <div>
          <span className="fw-medium">{row.name}</span>
          {row.description && (
            <small className="d-block text-muted">{row.description}</small>
          )}
        </div>
      ),
    },
    {
      key: 'client',
      title: 'Proprietário',
      render: (value) => value?.name || '-',
    },
    {
      key: '_count',
      title: 'Animais',
      render: (value) => value?.animals || 0,
    },
    {
      key: 'actions',
      title: '',
      width: '100px',
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Link
            to={`/batches/${row.id}`}
            className="btn btn-sm btn-outline-primary"
            title="Visualizar"
          >
            <FiEye size={14} />
          </Link>
          <button
            className="btn btn-sm btn-outline-secondary"
            title="Editar"
            onClick={(e) => {
              e.stopPropagation();
              openModal(row);
            }}
          >
            <FiEdit2 size={14} />
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            title="Excluir"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(row.id);
            }}
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">Lotes</h1>
          <p className="page-subtitle">Gerencie lotes de animais</p>
        </div>
        <Button onClick={() => openModal()}>
          <FiPlus className="me-2" />
          Novo Lote
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card noPadding>
        <div className="p-3 border-bottom">
          <div className="row g-3">
            <div className="col-md-4">
              <SearchInput
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                placeholder="Buscar lote..."
              />
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
          onRowClick={(row) => navigate(`/batches/${row.id}`)}
          emptyTitle="Nenhum lote encontrado"
          emptyDescription="Crie seu primeiro lote para organizar os animais"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingBatch(null);
          reset();
        }}
        title={editingBatch ? 'Editar Lote' : 'Novo Lote'}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setEditingBatch(null);
                reset();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit((data) => createMutation.mutate(data))}
              loading={createMutation.isPending}
            >
              {editingBatch ? 'Salvar' : 'Criar'}
            </Button>
          </>
        }
      >
        <form>
          <Input
            label="Nome do Lote"
            placeholder="Ex: Lote Bezerros 2024"
            error={errors.name?.message}
            required
            {...register('name')}
          />
          <Input
            label="Descrição"
            type="textarea"
            rows={3}
            placeholder="Descrição do lote (opcional)"
            error={errors.description?.message}
            {...register('description')}
          />
        </form>
      </Modal>

      <ConfirmDialog
        show={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Excluir Lote"
        message="Tem certeza que deseja excluir este lote? Os animais do lote não serão excluídos."
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default BatchesList;
