import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FiEdit2,
  FiTrash2,
  FiPhone,
  FiMail,
  FiMapPin,
  FiPlus,
  FiBox,
  FiDollarSign,
  FiCalendar,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { clientsApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import {
  formatPhone,
  formatDocument,
  formatCurrency,
  formatDate,
  getWhatsAppLink,
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

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  const { data: client, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CLIENT, id],
    queryFn: () => clientsApi.getClient(id),
    select: (res) => res.data.data,
  });

  const { data: financial } = useQuery({
    queryKey: [QUERY_KEYS.CLIENT, id, 'financial'],
    queryFn: () => clientsApi.getFinancialSummary(id),
    select: (res) => res.data.data,
    enabled: activeTab === 'financial',
  });

  const { data: history } = useQuery({
    queryKey: [QUERY_KEYS.CLIENT, id, 'history'],
    queryFn: () => clientsApi.getServiceHistory(id),
    select: (res) => res.data,
    enabled: activeTab === 'history',
  });

  const { data: properties } = useQuery({
    queryKey: [QUERY_KEYS.PROPERTIES, id],
    queryFn: () => clientsApi.getProperties(id),
    select: (res) => res.data.data,
    enabled: activeTab === 'properties',
  });

  const deleteMutation = useMutation({
    mutationFn: () => clientsApi.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.CLIENTS]);
      navigate(ROUTES.CLIENTS);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setShowDelete(false);
    },
  });

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!client) {
    return (
      <div className="text-center py-5">
        <h5>Cliente não encontrado</h5>
        <Link to={ROUTES.CLIENTS} className="btn btn-primary mt-3">
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
                <Link to={ROUTES.CLIENTS}>Clientes</Link>
              </li>
              <li className="breadcrumb-item active">{client.name}</li>
            </ol>
          </nav>
          <h1 className="page-title">{client.name}</h1>
          {client.document && (
            <p className="page-subtitle">
              {client.documentType?.toUpperCase()}: {formatDocument(client.document)}
            </p>
          )}
        </div>
        <div className="d-flex gap-2">
          {client.whatsapp && (
            <a
              href={getWhatsAppLink(client.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success"
            >
              <FaWhatsapp className="me-2" />
              WhatsApp
            </a>
          )}
          <Link to={`/clients/${id}/edit`} className="btn btn-outline-primary">
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
            className={`nav-link ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            Propriedades
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'financial' ? 'active' : ''}`}
            onClick={() => setActiveTab('financial')}
          >
            Financeiro
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Histórico
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="row g-4">
          <div className="col-lg-6">
            <Card title="Dados de Contato">
              <div className="row g-3">
                {client.email && (
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2">
                      <FiMail className="text-muted" />
                      <span>{client.email}</span>
                    </div>
                  </div>
                )}
                {client.phone && (
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2">
                      <FiPhone className="text-muted" />
                      <span>{formatPhone(client.phone)}</span>
                    </div>
                  </div>
                )}
                {client.whatsapp && (
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2">
                      <FaWhatsapp className="text-success" />
                      <span>{formatPhone(client.whatsapp)}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="col-lg-6">
            <Card title="Endereço">
              {client.address || client.city ? (
                <div className="d-flex align-items-start gap-2">
                  <FiMapPin className="text-muted mt-1" />
                  <div>
                    {client.address && <p className="mb-1">{client.address}</p>}
                    {client.city && (
                      <p className="mb-1">
                        {client.city}
                        {client.state && ` - ${client.state}`}
                      </p>
                    )}
                    {client.zipCode && (
                      <p className="mb-0 text-muted">CEP: {client.zipCode}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted mb-0">Endereço não informado</p>
              )}
            </Card>
          </div>

          {client.notes && (
            <div className="col-12">
              <Card title="Observações">
                <p className="mb-0">{client.notes}</p>
              </Card>
            </div>
          )}

          {/* Quick Stats */}
          <div className="col-12">
            <div className="row g-3">
              <div className="col-sm-4">
                <Card>
                  <div className="text-center">
                    <FiBox size={32} className="text-primary mb-2" />
                    <h4 className="mb-0">{client._count?.animals || 0}</h4>
                    <small className="text-muted">Animais</small>
                  </div>
                </Card>
              </div>
              <div className="col-sm-4">
                <Card>
                  <div className="text-center">
                    <FiCalendar size={32} className="text-info mb-2" />
                    <h4 className="mb-0">{client._count?.appointments || 0}</h4>
                    <small className="text-muted">Atendimentos</small>
                  </div>
                </Card>
              </div>
              <div className="col-sm-4">
                <Card>
                  <div className="text-center">
                    <FiDollarSign size={32} className="text-success mb-2" />
                    <h4 className="mb-0">{client._count?.invoices || 0}</h4>
                    <small className="text-muted">Faturas</small>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'properties' && (
        <Card
          title="Propriedades"
          headerActions={
            <Button size="sm" onClick={() => {}}>
              <FiPlus className="me-1" /> Nova Propriedade
            </Button>
          }
        >
          {properties?.length > 0 ? (
            <div className="list-group list-group-flush">
              {properties.map((prop) => (
                <div key={prop.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">{prop.name}</h6>
                      {prop.city && (
                        <small className="text-muted">
                          {prop.city}/{prop.state}
                        </small>
                      )}
                      {prop.totalAreaHectares && (
                        <small className="text-muted ms-2">
                          {prop.totalAreaHectares} ha
                        </small>
                      )}
                    </div>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary">
                        <FiEdit2 size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-danger">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-4">
              Nenhuma propriedade cadastrada
            </p>
          )}
        </Card>
      )}

      {activeTab === 'financial' && (
        <div className="row g-4">
          <div className="col-sm-6 col-lg-3">
            <Card>
              <div className="text-center">
                <small className="text-muted">Total Faturado</small>
                <h4 className="mb-0 text-primary">
                  {formatCurrency(financial?.totalBilled || 0)}
                </h4>
              </div>
            </Card>
          </div>
          <div className="col-sm-6 col-lg-3">
            <Card>
              <div className="text-center">
                <small className="text-muted">Total Pago</small>
                <h4 className="mb-0 text-success">
                  {formatCurrency(financial?.totalPaid || 0)}
                </h4>
              </div>
            </Card>
          </div>
          <div className="col-sm-6 col-lg-3">
            <Card>
              <div className="text-center">
                <small className="text-muted">A Receber</small>
                <h4 className="mb-0 text-warning">
                  {formatCurrency(financial?.totalPending || 0)}
                </h4>
              </div>
            </Card>
          </div>
          <div className="col-sm-6 col-lg-3">
            <Card>
              <div className="text-center">
                <small className="text-muted">Em Atraso</small>
                <h4 className="mb-0 text-danger">
                  {formatCurrency(financial?.totalOverdue || 0)}
                </h4>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <Card title="Histórico de Atendimentos" noPadding>
          <DataTable
            columns={[
              {
                key: 'scheduledDate',
                title: 'Data',
                render: (value) => formatDate(value),
              },
              {
                key: 'services',
                title: 'Serviços',
                render: (_, row) =>
                  row.appointmentServices?.map((s) => s.service?.name).join(', ') ||
                  '-',
              },
              {
                key: 'status',
                title: 'Status',
                render: (value) => <Badge status={value} />,
              },
            ]}
            data={history?.data || []}
            emptyTitle="Nenhum atendimento"
            emptyDescription="Este cliente ainda não tem histórico de atendimentos"
          />
        </Card>
      )}

      <ConfirmDialog
        show={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ClientDetail;
