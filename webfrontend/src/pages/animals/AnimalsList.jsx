import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiFilter } from 'react-icons/fi';
import { animalsApi, clientsApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { STATUS_LABELS } from '../../constants/enums';
import { formatWeight, formatDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/helpers';
import {
  Card,
  DataTable,
  SearchInput,
  Badge,
  ConfirmDialog,
  Alert,
  Input,
} from '../../components/common';

const AnimalsList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    speciesId: '',
    clientId: '',
    status: '',
    sex: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ANIMALS, { search, page, ...filters }],
    queryFn: () =>
      animalsApi.getAnimals({
        search,
        page,
        limit: 20,
        ...Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== '')
        ),
      }),
    select: (res) => res.data,
  });

  const { data: species } = useQuery({
    queryKey: [QUERY_KEYS.SPECIES],
    queryFn: () => animalsApi.getSpecies(),
    select: (res) => res.data.data,
  });

  const { data: clients } = useQuery({
    queryKey: [QUERY_KEYS.CLIENTS, 'all'],
    queryFn: () => clientsApi.getClients({ limit: 100 }),
    select: (res) => res.data.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => animalsApi.deleteAnimal(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.ANIMALS]);
      setDeleteId(null);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setDeleteId(null);
    },
  });

  const columns = [
    {
      key: 'identifier',
      title: 'Identificação',
      render: (_, row) => (
        <div>
          <span className="fw-medium">{row.identifier}</span>
          {row.name && <small className="d-block text-muted">{row.name}</small>}
        </div>
      ),
    },
    {
      key: 'species',
      title: 'Espécie/Raça',
      render: (_, row) => (
        <div>
          <span>{row.species?.name || '-'}</span>
          {row.breed && (
            <small className="d-block text-muted">{row.breed.name}</small>
          )}
        </div>
      ),
    },
    {
      key: 'sex',
      title: 'Sexo',
      render: (value) => STATUS_LABELS[value] || value,
    },
    {
      key: 'client',
      title: 'Proprietário',
      render: (value) => value?.name || '-',
    },
    {
      key: 'currentWeight',
      title: 'Peso',
      render: (value) => formatWeight(value),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => <Badge status={value} />,
    },
    {
      key: 'actions',
      title: '',
      width: '120px',
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Link
            to={`/animals/${row.id}`}
            className="btn btn-sm btn-outline-primary"
            title="Visualizar"
          >
            <FiEye size={14} />
          </Link>
          <Link
            to={`/animals/${row.id}/edit`}
            className="btn btn-sm btn-outline-secondary"
            title="Editar"
          >
            <FiEdit2 size={14} />
          </Link>
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
          <h1 className="page-title">Animais</h1>
          <p className="page-subtitle">Gerencie os animais cadastrados</p>
        </div>
        <Link to={ROUTES.ANIMAL_CREATE} className="btn btn-primary">
          <FiPlus className="me-2" />
          Novo Animal
        </Link>
      </div>

      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card noPadding>
        <div className="p-3 border-bottom">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <SearchInput
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                placeholder="Buscar por identificação ou nome..."
              />
            </div>
            <div className="col-md-8 text-md-end">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter className="me-2" />
                Filtros
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="row g-3 mt-2">
              <div className="col-md-3">
                <Input
                  type="select"
                  label="Espécie"
                  value={filters.speciesId}
                  onChange={(e) =>
                    setFilters({ ...filters, speciesId: e.target.value })
                  }
                >
                  <option value="">Todas</option>
                  {species?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Input>
              </div>
              <div className="col-md-3">
                <Input
                  type="select"
                  label="Proprietário"
                  value={filters.clientId}
                  onChange={(e) =>
                    setFilters({ ...filters, clientId: e.target.value })
                  }
                >
                  <option value="">Todos</option>
                  {clients?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Input>
              </div>
              <div className="col-md-3">
                <Input
                  type="select"
                  label="Sexo"
                  value={filters.sex}
                  onChange={(e) =>
                    setFilters({ ...filters, sex: e.target.value })
                  }
                >
                  <option value="">Todos</option>
                  <option value="male">Macho</option>
                  <option value="female">Fêmea</option>
                </Input>
              </div>
              <div className="col-md-3">
                <Input
                  type="select"
                  label="Status"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="">Todos</option>
                  <option value="active">Ativo</option>
                  <option value="sold">Vendido</option>
                  <option value="deceased">Falecido</option>
                  <option value="transferred">Transferido</option>
                </Input>
              </div>
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
          onRowClick={(row) => navigate(`/animals/${row.id}`)}
          emptyTitle="Nenhum animal encontrado"
          emptyDescription="Adicione seu primeiro animal para começar"
        />
      </Card>

      <ConfirmDialog
        show={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Excluir Animal"
        message="Tem certeza que deseja excluir este animal? Esta ação não pode ser desfeita."
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AnimalsList;
