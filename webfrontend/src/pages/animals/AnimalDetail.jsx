import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiEdit2, FiTrash2, FiActivity, FiHeart, FiShield } from 'react-icons/fi';
import { animalsApi, sanitaryApi, reproductiveApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { STATUS_LABELS } from '../../constants/enums';
import {
  formatWeight,
  formatDate,
  formatNumber,
} from '../../utils/formatters';
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

const AnimalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  const { data: animal, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ANIMAL, id],
    queryFn: () => animalsApi.getAnimal(id),
    select: (res) => res.data.data,
  });

  const { data: weightHistory } = useQuery({
    queryKey: [QUERY_KEYS.ANIMAL, id, 'weight'],
    queryFn: () => animalsApi.getWeightHistory(id),
    select: (res) => res.data.data,
    enabled: activeTab === 'weight',
  });

  const { data: vaccinations } = useQuery({
    queryKey: [QUERY_KEYS.ANIMAL, id, 'vaccinations'],
    queryFn: () => sanitaryApi.getAnimalVaccinations(id),
    select: (res) => res.data.data,
    enabled: activeTab === 'sanitary',
  });

  const { data: reproductiveHistory } = useQuery({
    queryKey: [QUERY_KEYS.ANIMAL, id, 'reproductive'],
    queryFn: () => reproductiveApi.getAnimalHistory(id),
    select: (res) => res.data.data,
    enabled: activeTab === 'reproductive',
  });

  const { data: genealogy } = useQuery({
    queryKey: [QUERY_KEYS.ANIMAL, id, 'genealogy'],
    queryFn: () => animalsApi.getGenealogy(id, { generations: 2 }),
    select: (res) => res.data.data,
    enabled: activeTab === 'genealogy',
  });

  const deleteMutation = useMutation({
    mutationFn: () => animalsApi.deleteAnimal(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.ANIMALS]);
      navigate(ROUTES.ANIMALS);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setShowDelete(false);
    },
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!animal) {
    return (
      <div className="text-center py-5">
        <h5>Animal não encontrado</h5>
        <Link to={ROUTES.ANIMALS} className="btn btn-primary mt-3">
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
                <Link to={ROUTES.ANIMALS}>Animais</Link>
              </li>
              <li className="breadcrumb-item active">{animal.identifier}</li>
            </ol>
          </nav>
          <h1 className="page-title">
            {animal.identifier}
            {animal.name && (
              <small className="text-muted ms-2">({animal.name})</small>
            )}
          </h1>
          <div className="d-flex gap-2 align-items-center">
            <Badge status={animal.status} />
            {animal.sex && (
              <span className="text-muted">
                {STATUS_LABELS[animal.sex]}
              </span>
            )}
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link to={`/animals/${id}/edit`} className="btn btn-outline-primary">
            <FiEdit2 className="me-2" />
            Editar
          </Link>
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

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Informações
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'weight' ? 'active' : ''}`}
            onClick={() => setActiveTab('weight')}
          >
            Peso
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'sanitary' ? 'active' : ''}`}
            onClick={() => setActiveTab('sanitary')}
          >
            Sanitário
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'reproductive' ? 'active' : ''}`}
            onClick={() => setActiveTab('reproductive')}
          >
            Reprodutivo
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'genealogy' ? 'active' : ''}`}
            onClick={() => setActiveTab('genealogy')}
          >
            Genealogia
          </button>
        </li>
      </ul>

      {/* Info Tab */}
      {activeTab === 'info' && (
        <div className="row g-4">
          <div className="col-lg-6">
            <Card title="Dados do Animal">
              <div className="row g-3">
                <div className="col-6">
                  <small className="text-muted d-block">Espécie</small>
                  <span>{animal.species?.name || '-'}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Raça</small>
                  <span>{animal.breed?.name || '-'}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Data de Nascimento</small>
                  <span>{formatDate(animal.dateOfBirth) || '-'}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Pelagem</small>
                  <span>{animal.coatColor || '-'}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Peso Atual</small>
                  <span>{formatWeight(animal.currentWeight)}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Última Pesagem</small>
                  <span>{formatDate(animal.lastWeighingDate) || '-'}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="col-lg-6">
            <Card title="Proprietário e Localização">
              <div className="row g-3">
                <div className="col-12">
                  <small className="text-muted d-block">Proprietário</small>
                  {animal.client ? (
                    <Link to={`/clients/${animal.client.id}`}>
                      {animal.client.name}
                    </Link>
                  ) : (
                    '-'
                  )}
                </div>
                <div className="col-12">
                  <small className="text-muted d-block">Propriedade</small>
                  <span>{animal.property?.name || '-'}</span>
                </div>
                {animal.batch && (
                  <div className="col-12">
                    <small className="text-muted d-block">Lote</small>
                    <Link to={`/batches/${animal.batch.id}`}>
                      {animal.batch.name}
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {animal.sex === 'female' && (
            <div className="col-lg-6">
              <Card title="Dados Reprodutivos">
                <div className="row g-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Status Reprodutivo</small>
                    <Badge status={animal.reproductiveStatus} />
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Nº de Partos</small>
                    <span>{animal.numberOfCalvings || 0}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Último Parto</small>
                    <span>{formatDate(animal.lastCalvingDate) || '-'}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Previsão de Parto</small>
                    <span>{formatDate(animal.expectedCalvingDate) || '-'}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {animal.notes && (
            <div className="col-12">
              <Card title="Observações">
                <p className="mb-0">{animal.notes}</p>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Weight Tab */}
      {activeTab === 'weight' && (
        <Card title="Histórico de Peso" noPadding>
          <DataTable
            columns={[
              {
                key: 'weighingDate',
                title: 'Data',
                render: (value) => formatDate(value),
              },
              {
                key: 'weight',
                title: 'Peso',
                render: (value) => formatWeight(value),
              },
              {
                key: 'notes',
                title: 'Observações',
                render: (value) => value || '-',
              },
            ]}
            data={weightHistory || []}
            emptyTitle="Nenhuma pesagem registrada"
          />
        </Card>
      )}

      {/* Sanitary Tab */}
      {activeTab === 'sanitary' && (
        <Card title="Histórico Sanitário" noPadding>
          <DataTable
            columns={[
              {
                key: 'applicationDate',
                title: 'Data',
                render: (value) => formatDate(value),
              },
              {
                key: 'vaccination',
                title: 'Vacina',
                render: (value) => value?.name || '-',
              },
              {
                key: 'doseNumber',
                title: 'Dose',
                render: (value) => value || 1,
              },
              {
                key: 'nextDoseDate',
                title: 'Próxima Dose',
                render: (value) => formatDate(value) || '-',
              },
            ]}
            data={vaccinations || []}
            emptyTitle="Nenhuma vacinação registrada"
          />
        </Card>
      )}

      {/* Reproductive Tab */}
      {activeTab === 'reproductive' && (
        <Card title="Histórico Reprodutivo" noPadding>
          <DataTable
            columns={[
              {
                key: 'date',
                title: 'Data',
                render: (value) => formatDate(value),
              },
              {
                key: 'type',
                title: 'Tipo',
                render: (value) => STATUS_LABELS[value] || value,
              },
              {
                key: 'result',
                title: 'Resultado',
                render: (value) => value || '-',
              },
              {
                key: 'notes',
                title: 'Observações',
                render: (value) => value || '-',
              },
            ]}
            data={reproductiveHistory || []}
            emptyTitle="Nenhum registro reprodutivo"
          />
        </Card>
      )}

      {/* Genealogy Tab */}
      {activeTab === 'genealogy' && (
        <Card title="Genealogia">
          {genealogy ? (
            <div className="row g-4">
              <div className="col-md-6">
                <h6>Pai (Sire)</h6>
                {genealogy.sire ? (
                  <Link to={`/animals/${genealogy.sire.id}`} className="d-block">
                    {genealogy.sire.identifier}
                    {genealogy.sire.name && ` - ${genealogy.sire.name}`}
                  </Link>
                ) : (
                  <span className="text-muted">Não informado</span>
                )}
              </div>
              <div className="col-md-6">
                <h6>Mãe (Dam)</h6>
                {genealogy.dam ? (
                  <Link to={`/animals/${genealogy.dam.id}`} className="d-block">
                    {genealogy.dam.identifier}
                    {genealogy.dam.name && ` - ${genealogy.dam.name}`}
                  </Link>
                ) : (
                  <span className="text-muted">Não informado</span>
                )}
              </div>
              {genealogy.offspring?.length > 0 && (
                <div className="col-12">
                  <h6>Filhos ({genealogy.offspring.length})</h6>
                  <div className="list-group">
                    {genealogy.offspring.map((child) => (
                      <Link
                        key={child.id}
                        to={`/animals/${child.id}`}
                        className="list-group-item list-group-item-action"
                      >
                        {child.identifier}
                        {child.name && ` - ${child.name}`}
                        <Badge status={child.sex} className="ms-2" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted mb-0">Informações de genealogia não disponíveis</p>
          )}
        </Card>
      )}

      <ConfirmDialog
        show={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Excluir Animal"
        message="Tem certeza que deseja excluir este animal? Esta ação não pode ser desfeita."
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AnimalDetail;
