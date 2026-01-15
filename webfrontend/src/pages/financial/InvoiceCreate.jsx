import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { financialApi, clientsApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { invoiceSchema } from '../../utils/validators';
import { getErrorMessage } from '../../utils/helpers';
import { Card, Input, Button, Alert } from '../../components/common';

const InvoiceCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const { data: clients } = useQuery({
    queryKey: [QUERY_KEYS.CLIENTS, 'all'],
    queryFn: () => clientsApi.getClients({ limit: 100 }),
    select: (res) => res.data.data,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(invoiceSchema),
    defaultValues: {
      clientId: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => financialApi.createInvoice(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries([QUERY_KEYS.INVOICES]);
      navigate(`/financial/invoices/${res.data.data.id}`);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const onSubmit = (data) => {
    setError('');
    createMutation.mutate({
      ...data,
      issueDate: new Date(data.issueDate).toISOString(),
      dueDate: new Date(data.dueDate).toISOString(),
    });
  };

  return (
    <div>
      <div className="page-header">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-1">
            <li className="breadcrumb-item">
              <Link to={ROUTES.INVOICES}>Faturas</Link>
            </li>
            <li className="breadcrumb-item active">Nova</li>
          </ol>
        </nav>
        <h1 className="page-title">Nova Fatura</h1>
      </div>

      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-4">
          <div className="col-lg-8">
            <Card title="Dados da Fatura">
              <div className="row">
                <div className="col-md-12">
                  <Input
                    label="Cliente"
                    type="select"
                    error={errors.clientId?.message}
                    required
                    {...register('clientId')}
                  >
                    <option value="">Selecione um cliente</option>
                    {clients?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Input>
                </div>
                <div className="col-md-6">
                  <Input
                    label="Data de Emissão"
                    type="date"
                    error={errors.issueDate?.message}
                    required
                    {...register('issueDate')}
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="Data de Vencimento"
                    type="date"
                    error={errors.dueDate?.message}
                    required
                    {...register('dueDate')}
                  />
                </div>
                <div className="col-12">
                  <Input
                    label="Observações"
                    type="textarea"
                    rows={3}
                    placeholder="Observações da fatura..."
                    {...register('notes')}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="col-lg-4">
            <Card title="Ações">
              <div className="d-grid gap-2">
                <Button type="submit" loading={createMutation.isPending}>
                  Criar Fatura
                </Button>
                <Link
                  to={ROUTES.INVOICES}
                  className="btn btn-outline-secondary"
                >
                  Cancelar
                </Link>
              </div>
              <hr />
              <small className="text-muted">
                Após criar a fatura, você poderá adicionar itens e registrar
                pagamentos.
              </small>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceCreate;
