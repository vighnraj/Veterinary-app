import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { appointmentsApi, clientsApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { appointmentSchema } from '../../utils/validators';
import { getErrorMessage } from '../../utils/helpers';
import { Card, Input, Button, Alert } from '../../components/common';

const AppointmentCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const { data: clients } = useQuery({
    queryKey: [QUERY_KEYS.CLIENTS, 'all'],
    queryFn: () => clientsApi.getClients({ limit: 100 }),
    select: (res) => res.data.data,
  });

  const { data: services } = useQuery({
    queryKey: [QUERY_KEYS.SERVICES],
    queryFn: () => appointmentsApi.getServices(),
    select: (res) => res.data.data,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(appointmentSchema),
    defaultValues: {
      clientId: '',
      scheduledDate: '',
      locationType: 'property',
      locationNotes: '',
      notes: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => appointmentsApi.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.APPOINTMENTS]);
      navigate(ROUTES.APPOINTMENTS);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const onSubmit = (data) => {
    setError('');
    createMutation.mutate({
      ...data,
      scheduledDate: new Date(data.scheduledDate).toISOString(),
    });
  };

  return (
    <div>
      <div className="page-header">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-1">
            <li className="breadcrumb-item">
              <Link to={ROUTES.APPOINTMENTS}>Agendamentos</Link>
            </li>
            <li className="breadcrumb-item active">Novo</li>
          </ol>
        </nav>
        <h1 className="page-title">Novo Agendamento</h1>
      </div>

      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-4">
          <div className="col-lg-8">
            <Card title="Dados do Agendamento">
              <div className="row">
                <div className="col-md-6">
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
                    label="Data e Hora"
                    type="datetime-local"
                    error={errors.scheduledDate?.message}
                    required
                    {...register('scheduledDate')}
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="Local"
                    type="select"
                    error={errors.locationType?.message}
                    {...register('locationType')}
                  >
                    <option value="property">Na propriedade</option>
                    <option value="clinic">Na clínica</option>
                    <option value="other">Outro</option>
                  </Input>
                </div>
                <div className="col-md-6">
                  <Input
                    label="Detalhes do Local"
                    placeholder="Endereço ou referência"
                    error={errors.locationNotes?.message}
                    {...register('locationNotes')}
                  />
                </div>
              </div>
            </Card>

            <Card title="Observações" className="mt-4">
              <Input
                type="textarea"
                rows={4}
                placeholder="Observações sobre o agendamento..."
                error={errors.notes?.message}
                {...register('notes')}
              />
            </Card>
          </div>

          <div className="col-lg-4">
            <Card title="Ações">
              <div className="d-grid gap-2">
                <Button type="submit" loading={createMutation.isPending}>
                  Criar Agendamento
                </Button>
                <Link
                  to={ROUTES.APPOINTMENTS}
                  className="btn btn-outline-secondary"
                >
                  Cancelar
                </Link>
              </div>
              <hr />
              <small className="text-muted">
                Após criar o agendamento, você poderá adicionar serviços e
                animais.
              </small>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AppointmentCreate;
