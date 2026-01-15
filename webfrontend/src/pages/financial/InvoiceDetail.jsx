import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiDownload, FiDollarSign } from 'react-icons/fi';
import { financialApi, reportsApi } from '../../api';
import { QUERY_KEYS } from '../../constants/config';
import { ROUTES } from '../../constants/routes';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { getErrorMessage, downloadFile } from '../../utils/helpers';
import {
  Loading,
  Card,
  Badge,
  Button,
  Alert,
  DataTable,
  Modal,
  Input,
} from '../../components/common';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { paymentSchema } from '../../utils/validators';

const InvoiceDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.INVOICE, id],
    queryFn: () => financialApi.getInvoice(id),
    select: (res) => res.data.data,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(paymentSchema),
    defaultValues: {
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'pix',
      reference: '',
      notes: '',
    },
  });

  const paymentMutation = useMutation({
    mutationFn: (data) => financialApi.recordPayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.INVOICE, id]);
      setShowPaymentModal(false);
      reset();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const handleDownloadPdf = async () => {
    try {
      const response = await reportsApi.generateInvoiceReport(id);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fatura-${invoice.invoiceNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!invoice) {
    return (
      <div className="text-center py-5">
        <h5>Fatura não encontrada</h5>
        <Link to={ROUTES.INVOICES} className="btn btn-primary mt-3">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  const balance = invoice.totalAmount - invoice.paidAmount;

  return (
    <div>
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <Link to={ROUTES.INVOICES}>Faturas</Link>
              </li>
              <li className="breadcrumb-item active">#{invoice.invoiceNumber}</li>
            </ol>
          </nav>
          <h1 className="page-title">Fatura #{invoice.invoiceNumber}</h1>
          <Badge status={invoice.status} />
        </div>
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={handleDownloadPdf}>
            <FiDownload className="me-2" />
            PDF
          </Button>
          {balance > 0 && (
            <Button onClick={() => setShowPaymentModal(true)}>
              <FiDollarSign className="me-2" />
              Registrar Pagamento
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="row g-4">
        {/* Info */}
        <div className="col-lg-6">
          <Card title="Informações">
            <div className="row g-3">
              <div className="col-6">
                <small className="text-muted d-block">Cliente</small>
                {invoice.client ? (
                  <Link to={`/clients/${invoice.client.id}`}>
                    {invoice.client.name}
                  </Link>
                ) : (
                  '-'
                )}
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Emissão</small>
                <span>{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Vencimento</small>
                <span>{formatDate(invoice.dueDate)}</span>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Pagamento</small>
                <span>{formatDate(invoice.paidDate) || '-'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Totals */}
        <div className="col-lg-6">
          <Card title="Valores">
            <div className="row g-3">
              <div className="col-6">
                <small className="text-muted d-block">Subtotal</small>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="col-6">
                  <small className="text-muted d-block">Desconto</small>
                  <span className="text-danger">
                    -{formatCurrency(invoice.discountAmount)}
                  </span>
                </div>
              )}
              <div className="col-6">
                <small className="text-muted d-block">Total</small>
                <h5 className="text-primary mb-0">
                  {formatCurrency(invoice.totalAmount)}
                </h5>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Pago</small>
                <h5 className="text-success mb-0">
                  {formatCurrency(invoice.paidAmount)}
                </h5>
              </div>
              {balance > 0 && (
                <div className="col-12">
                  <hr />
                  <small className="text-muted d-block">Saldo em Aberto</small>
                  <h4 className="text-danger mb-0">{formatCurrency(balance)}</h4>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Items */}
        <div className="col-12">
          <Card title="Itens" noPadding>
            <DataTable
              columns={[
                {
                  key: 'description',
                  title: 'Descrição',
                  render: (_, row) =>
                    row.description || row.service?.name || '-',
                },
                {
                  key: 'quantity',
                  title: 'Qtd',
                },
                {
                  key: 'unitPrice',
                  title: 'Valor Unit.',
                  render: (value) => formatCurrency(value),
                },
                {
                  key: 'totalPrice',
                  title: 'Total',
                  render: (value) => formatCurrency(value),
                },
              ]}
              data={invoice.items || []}
              emptyTitle="Nenhum item"
            />
          </Card>
        </div>

        {/* Payments */}
        {invoice.payments?.length > 0 && (
          <div className="col-12">
            <Card title="Pagamentos" noPadding>
              <DataTable
                columns={[
                  {
                    key: 'paymentDate',
                    title: 'Data',
                    render: (value) => formatDate(value),
                  },
                  {
                    key: 'amount',
                    title: 'Valor',
                    render: (value) => formatCurrency(value),
                  },
                  {
                    key: 'paymentMethod',
                    title: 'Método',
                    render: (value) => {
                      const methods = {
                        cash: 'Dinheiro',
                        card: 'Cartão',
                        pix: 'PIX',
                        bank_transfer: 'Transferência',
                        check: 'Cheque',
                      };
                      return methods[value] || value;
                    },
                  },
                  {
                    key: 'reference',
                    title: 'Referência',
                    render: (value) => value || '-',
                  },
                ]}
                data={invoice.payments}
              />
            </Card>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Modal
        show={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          reset();
        }}
        title="Registrar Pagamento"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowPaymentModal(false);
                reset();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit((data) =>
                paymentMutation.mutate({
                  ...data,
                  paymentDate: new Date(data.paymentDate).toISOString(),
                })
              )}
              loading={paymentMutation.isPending}
            >
              Registrar
            </Button>
          </>
        }
      >
        <form>
          <Input
            label="Valor"
            type="number"
            step="0.01"
            placeholder={balance.toFixed(2)}
            error={errors.amount?.message}
            required
            {...register('amount')}
          />
          <Input
            label="Data"
            type="date"
            error={errors.paymentDate?.message}
            required
            {...register('paymentDate')}
          />
          <Input
            label="Método"
            type="select"
            error={errors.paymentMethod?.message}
            required
            {...register('paymentMethod')}
          >
            <option value="pix">PIX</option>
            <option value="cash">Dinheiro</option>
            <option value="card">Cartão</option>
            <option value="bank_transfer">Transferência</option>
            <option value="check">Cheque</option>
          </Input>
          <Input
            label="Referência"
            placeholder="ID da transação, nº do cheque, etc."
            {...register('reference')}
          />
        </form>
      </Modal>
    </div>
  );
};

export default InvoiceDetail;
