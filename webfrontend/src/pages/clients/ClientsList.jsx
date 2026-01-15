import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { clientsApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { formatPhone, getWhatsAppLink } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/helpers';
import {
  Card,
  DataTable,
  SearchInput,
  Button,
  ConfirmDialog,
  Alert,
} from '../../components/common';

const ClientsList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CLIENTS, { search, page }],
    queryFn: () => clientsApi.getClients({ search, page, limit: 20 }),
    select: (res) => res.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => clientsApi.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.CLIENTS]);
      setDeleteId(null);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setDeleteId(null);
    },
  });

  const columns = [
    {
      key: 'name',
      title: 'Nome',
      render: (_, row) => (
        <div>
          <span className="fw-medium">{row.name}</span>
          {row.email && (
            <small className="d-block text-muted">{row.email}</small>
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'Telefone',
      render: (value) => formatPhone(value) || '-',
    },
    {
      key: 'city',
      title: 'Cidade',
      render: (_, row) => (row.city ? `${row.city}/${row.state}` : '-'),
    },
    {
      key: '_count',
      title: 'Animais',
      render: (value) => value?.animals || 0,
    },
    {
      key: 'actions',
      title: '',
      width: '150px',
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Link
            to={`/clients/${row.id}`}
            className="btn btn-sm btn-outline-primary"
            title="Visualizar"
          >
            <FiEye size={14} />
          </Link>
          <Link
            to={`/clients/${row.id}/edit`}
            className="btn btn-sm btn-outline-secondary"
            title="Editar"
          >
            <FiEdit2 size={14} />
          </Link>
          {row.whatsapp && (
            <a
              href={getWhatsAppLink(row.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-success"
              title="WhatsApp"
            >
              <FaWhatsapp size={14} />
            </a>
          )}
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
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">Gerencie seus clientes e produtores</p>
        </div>
        <Link to={ROUTES.CLIENT_CREATE} className="btn btn-primary">
          <FiPlus className="me-2" />
          Novo Cliente
        </Link>
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
                placeholder="Buscar por nome, email ou telefone..."
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
          onRowClick={(row) => navigate(`/clients/${row.id}`)}
          emptyTitle="Nenhum cliente encontrado"
          emptyDescription="Adicione seu primeiro cliente para começar"
        />
      </Card>

      <ConfirmDialog
        show={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ClientsList;
