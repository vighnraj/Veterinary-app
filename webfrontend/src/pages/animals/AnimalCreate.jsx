import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { animalsApi, clientsApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { animalSchema } from '../../utils/validators';
import { getErrorMessage } from '../../utils/helpers';
import { Card, Input, Button, Alert, Loading } from '../../components/common';

const AnimalCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const [error, setError] = useState('');

  const { data: animal, isLoading: loadingAnimal } = useQuery({
    queryKey: [QUERY_KEYS.ANIMAL, id],
    queryFn: () => animalsApi.getAnimal(id),
    select: (res) => res.data.data,
    enabled: isEditing,
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

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(animalSchema),
    defaultValues: {
      identifier: '',
      name: '',
      speciesId: '',
      breedId: '',
      sex: '',
      clientId: '',
      propertyId: '',
      dateOfBirth: '',
      coatColor: '',
      currentWeight: '',
      notes: '',
    },
  });

  const selectedSpeciesId = watch('speciesId');
  const selectedClientId = watch('clientId');

  const { data: breeds } = useQuery({
    queryKey: [QUERY_KEYS.BREEDS, selectedSpeciesId],
    queryFn: () => animalsApi.getBreedsBySpecies(selectedSpeciesId),
    select: (res) => res.data.data,
    enabled: !!selectedSpeciesId,
  });

  const { data: properties } = useQuery({
    queryKey: [QUERY_KEYS.PROPERTIES, selectedClientId],
    queryFn: () => clientsApi.getProperties(selectedClientId),
    select: (res) => res.data.data,
    enabled: !!selectedClientId,
  });

  useEffect(() => {
    if (animal) {
      reset({
        identifier: animal.identifier || '',
        name: animal.name || '',
        speciesId: animal.speciesId || '',
        breedId: animal.breedId || '',
        sex: animal.sex || '',
        clientId: animal.clientId || '',
        propertyId: animal.propertyId || '',
        dateOfBirth: animal.dateOfBirth
          ? new Date(animal.dateOfBirth).toISOString().split('T')[0]
          : '',
        coatColor: animal.coatColor || '',
        currentWeight: animal.currentWeight || '',
        notes: animal.notes || '',
      });
    }
  }, [animal, reset]);

  const createMutation = useMutation({
    mutationFn: (data) => animalsApi.createAnimal(data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.ANIMALS]);
      navigate(ROUTES.ANIMALS);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => animalsApi.updateAnimal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.ANIMALS]);
      queryClient.invalidateQueries([QUERY_KEYS.ANIMAL, id]);
      navigate(`/animals/${id}`);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const onSubmit = (data) => {
    setError('');
    // Clean up empty strings
    const cleanData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === '' ? null : v])
    );

    if (isEditing) {
      updateMutation.mutate(cleanData);
    } else {
      createMutation.mutate(cleanData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (isEditing && loadingAnimal) {
    return <Loading fullScreen />;
  }

  return (
    <div>
      <div className="page-header">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-1">
            <li className="breadcrumb-item">
              <Link to={ROUTES.ANIMALS}>Animais</Link>
            </li>
            <li className="breadcrumb-item active">
              {isEditing ? 'Editar' : 'Novo'}
            </li>
          </ol>
        </nav>
        <h1 className="page-title">
          {isEditing ? 'Editar Animal' : 'Novo Animal'}
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
            <Card title="Identificação">
              <div className="row">
                <div className="col-md-6">
                  <Input
                    label="Identificação"
                    placeholder="Brinco, tatuagem, etc."
                    error={errors.identifier?.message}
                    required
                    {...register('identifier')}
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="Nome"
                    placeholder="Nome do animal (opcional)"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                </div>
              </div>
            </Card>

            <Card title="Classificação" className="mt-4">
              <div className="row">
                <div className="col-md-4">
                  <Input
                    label="Espécie"
                    type="select"
                    error={errors.speciesId?.message}
                    required
                    {...register('speciesId')}
                  >
                    <option value="">Selecione</option>
                    {species?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Input>
                </div>
                <div className="col-md-4">
                  <Input
                    label="Raça"
                    type="select"
                    error={errors.breedId?.message}
                    disabled={!selectedSpeciesId}
                    {...register('breedId')}
                  >
                    <option value="">Selecione</option>
                    {breeds?.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Input>
                </div>
                <div className="col-md-4">
                  <Input
                    label="Sexo"
                    type="select"
                    error={errors.sex?.message}
                    required
                    {...register('sex')}
                  >
                    <option value="">Selecione</option>
                    <option value="male">Macho</option>
                    <option value="female">Fêmea</option>
                  </Input>
                </div>
              </div>
            </Card>

            <Card title="Proprietário e Localização" className="mt-4">
              <div className="row">
                <div className="col-md-6">
                  <Input
                    label="Proprietário"
                    type="select"
                    error={errors.clientId?.message}
                    required
                    {...register('clientId')}
                  >
                    <option value="">Selecione</option>
                    {clients?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Input>
                </div>
                <div className="col-md-6">
                  <Input
                    label="Propriedade"
                    type="select"
                    error={errors.propertyId?.message}
                    disabled={!selectedClientId}
                    {...register('propertyId')}
                  >
                    <option value="">Selecione (opcional)</option>
                    {properties?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Input>
                </div>
              </div>
            </Card>

            <Card title="Dados Físicos" className="mt-4">
              <div className="row">
                <div className="col-md-4">
                  <Input
                    label="Data de Nascimento"
                    type="date"
                    error={errors.dateOfBirth?.message}
                    {...register('dateOfBirth')}
                  />
                </div>
                <div className="col-md-4">
                  <Input
                    label="Pelagem"
                    placeholder="Cor da pelagem"
                    error={errors.coatColor?.message}
                    {...register('coatColor')}
                  />
                </div>
                <div className="col-md-4">
                  <Input
                    label="Peso Atual (kg)"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    error={errors.currentWeight?.message}
                    {...register('currentWeight')}
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
                placeholder="Observações sobre o animal..."
                error={errors.notes?.message}
                {...register('notes')}
              />
            </Card>

            <div className="d-grid gap-2 mt-4">
              <Button type="submit" loading={isLoading}>
                {isEditing ? 'Salvar Alterações' : 'Criar Animal'}
              </Button>
              <Link to={ROUTES.ANIMALS} className="btn btn-outline-secondary">
                Cancelar
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AnimalCreate;
