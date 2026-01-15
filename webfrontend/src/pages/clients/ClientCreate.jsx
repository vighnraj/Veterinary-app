import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { clientsApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { clientSchema } from '../../utils/validators';
import { getErrorMessage } from '../../utils/helpers';
import { Card, Input, Button, Alert, Loading } from '../../components/common';

const ClientCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const [error, setError] = useState('');

  const { data: client, isLoading: loadingClient } = useQuery({
    queryKey: [QUERY_KEYS.CLIENT, id],
    queryFn: () => clientsApi.getClient(id),
    select: (res) => res.data.data,
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      document: '',
      documentType: 'cpf',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (client) {
      reset({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        whatsapp: client.whatsapp || '',
        document: client.document || '',
        documentType: client.documentType || 'cpf',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        zipCode: client.zipCode || '',
        notes: client.notes || '',
      });
    }
  }, [client, reset]);

  const createMutation = useMutation({
    mutationFn: (data) => clientsApi.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.CLIENTS]);
      navigate(ROUTES.CLIENTS);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => clientsApi.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.CLIENTS]);
      queryClient.invalidateQueries([QUERY_KEYS.CLIENT, id]);
      navigate(`/clients/${id}`);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const onSubmit = (data) => {
    setError('');
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (isEditing && loadingClient) {
    return <Loading fullScreen />;
  }

  return (
    <div>
      <div className="page-header">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-1">
            <li className="breadcrumb-item">
              <Link to={ROUTES.CLIENTS}>Clientes</Link>
            </li>
            <li className="breadcrumb-item active">
              {isEditing ? 'Editar' : 'Novo'}
            </li>
          </ol>
        </nav>
        <h1 className="page-title">
          {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>
      </div>

      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-4">
          <div className="col-lg-8">
            <Card title="Dados Básicos">
              <div className="row">
                <div className="col-12">
                  <Input
                    label="Nome"
                    placeholder="Nome completo ou razão social"
                    error={errors.name?.message}
                    required
                    {...register('name')}
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="email@exemplo.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="Telefone"
                    placeholder="(00) 00000-0000"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="WhatsApp"
                    placeholder="(00) 00000-0000"
                    error={errors.whatsapp?.message}
                    {...register('whatsapp')}
                  />
                </div>
                <div className="col-md-3">
                  <Input
                    label="Tipo Documento"
                    type="select"
                    error={errors.documentType?.message}
                    {...register('documentType')}
                  >
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="other">Outro</option>
                  </Input>
                </div>
                <div className="col-md-3">
                  <Input
                    label="Documento"
                    placeholder="000.000.000-00"
                    error={errors.document?.message}
                    {...register('document')}
                  />
                </div>
              </div>
            </Card>

            <Card title="Endereço" className="mt-4">
              <div className="row">
                <div className="col-12">
                  <Input
                    label="Endereço"
                    placeholder="Rua, número, bairro"
                    error={errors.address?.message}
                    {...register('address')}
                  />
                </div>
                <div className="col-md-5">
                  <Input
                    label="Cidade"
                    placeholder="Cidade"
                    error={errors.city?.message}
                    {...register('city')}
                  />
                </div>
                <div className="col-md-3">
                  <Input
                    label="Estado"
                    type="select"
                    error={errors.state?.message}
                    {...register('state')}
                  >
                    <option value="">Selecione</option>
                    <option value="AC">AC</option>
                    <option value="AL">AL</option>
                    <option value="AP">AP</option>
                    <option value="AM">AM</option>
                    <option value="BA">BA</option>
                    <option value="CE">CE</option>
                    <option value="DF">DF</option>
                    <option value="ES">ES</option>
                    <option value="GO">GO</option>
                    <option value="MA">MA</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="MG">MG</option>
                    <option value="PA">PA</option>
                    <option value="PB">PB</option>
                    <option value="PR">PR</option>
                    <option value="PE">PE</option>
                    <option value="PI">PI</option>
                    <option value="RJ">RJ</option>
                    <option value="RN">RN</option>
                    <option value="RS">RS</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="SC">SC</option>
                    <option value="SP">SP</option>
                    <option value="SE">SE</option>
                    <option value="TO">TO</option>
                  </Input>
                </div>
                <div className="col-md-4">
                  <Input
                    label="CEP"
                    placeholder="00000-000"
                    error={errors.zipCode?.message}
                    {...register('zipCode')}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="col-lg-4">
            <Card title="Observações">
              <Input
                type="textarea"
                rows={5}
                placeholder="Observações sobre o cliente..."
                error={errors.notes?.message}
                {...register('notes')}
              />
            </Card>

            <div className="d-grid gap-2 mt-4">
              <Button type="submit" loading={isLoading}>
                {isEditing ? 'Salvar Alterações' : 'Criar Cliente'}
              </Button>
              <Link to={ROUTES.CLIENTS} className="btn btn-outline-secondary">
                Cancelar
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClientCreate;
