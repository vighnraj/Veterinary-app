import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { appointmentsApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { formatCurrency } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/helpers';
import {
  Card,
  DataTable,
  Button,
  Modal,
  ConfirmDialog,
  Alert,
  Input,
  Badge,
} from '../../components/common';

const ServicesList = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SERVICES],
    queryFn: () => appointmentsApi.getServices(),
    select: (res) => res.data.data,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: 'clinical',
      defaultPrice: '',
      estimatedDurationMinutes: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      editingService
        ? appointmentsApi.updateService(editingService.id, data)
        : appointmentsApi.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.SERVICES]);
      setShowModal(false);
      setEditingService(null);
      reset();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => appointmentsApi.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.SERVICES]);
      setDeleteId(null);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setDeleteId(null);
    },
  });

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      reset({
        name: service.name,
        description: service.description || '',
        category: service.category || 'clinical',
        defaultPrice: service.defaultPrice || '',
        estimatedDurationMinutes: service.estimatedDurationMinutes || '',
      });
    } else {
      setEditingService(null);
      reset({
        name: '',
        description: '',
        category: 'clinical',
        defaultPrice: '',
        estimatedDurationMinutes: '',
      });
    }
    setShowModal(true);
  };

  const columns = [
    {
      key: 'name',
      title: 'Serviço',
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
      key: 'category',
      title: 'Categoria',
      render: (value) => {
        const labels = {
          reproductive: 'Reprodutivo',
          sanitary: 'Sanitário',
          clinical: 'Clínico',
          surgical: 'Cirúrgico',
          consulting: 'Consultoria',
        };
        return labels[value] || value;
      },
    },
    {
      key: 'defaultPrice',
      title: 'Preço',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'estimatedDurationMinutes',
      title: 'Duração',
      render: (value) => (value ? `${value} min` : '-'),
    },
    {
      key: 'actions',
      title: '',
      width: '100px',
      render: (_, row) => (
        <div className="d-flex gap-1">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => openModal(row)}
          >
            <FiEdit2 size={14} />
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => setDeleteId(row.id)}
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
          <h1 className="page-title">Serviços</h1>
          <p className="page-subtitle">Gerencie os serviços oferecidos</p>
        </div>
        <Button onClick={() => openModal()}>
          <FiPlus className="me-2" />
          Novo Serviço
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card noPadding>
        <DataTable
          columns={columns}
          data={data || []}
          loading={isLoading}
          emptyTitle="Nenhum serviço cadastrado"
          emptyDescription="Adicione serviços para usar nos agendamentos"
        />
      </Card>

      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingService(null);
          reset();
        }}
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setEditingService(null);
                reset();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit((data) => createMutation.mutate(data))}
              loading={createMutation.isPending}
            >
              {editingService ? 'Salvar' : 'Criar'}
            </Button>
          </>
        }
      >
        <form>
          <Input
            label="Nome"
            placeholder="Nome do serviço"
            error={errors.name?.message}
            required
            {...register('name')}
          />
          <Input
            label="Descrição"
            type="textarea"
            rows={2}
            placeholder="Descrição do serviço"
            {...register('description')}
          />
          <div className="row">
            <div className="col-md-6">
              <Input
                label="Categoria"
                type="select"
                {...register('category')}
              >
                <option value="clinical">Clínico</option>
                <option value="reproductive">Reprodutivo</option>
                <option value="sanitary">Sanitário</option>
                <option value="surgical">Cirúrgico</option>
                <option value="consulting">Consultoria</option>
              </Input>
            </div>
            <div className="col-md-6">
              <Input
                label="Preço Padrão"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('defaultPrice')}
              />
            </div>
          </div>
          <Input
            label="Duração Estimada (minutos)"
            type="number"
            placeholder="60"
            {...register('estimatedDurationMinutes')}
          />
        </form>
      </Modal>

      <ConfirmDialog
        show={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Excluir Serviço"
        message="Tem certeza que deseja excluir este serviço?"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ServicesList;
