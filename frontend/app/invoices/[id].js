import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Card, Loading, Badge, Button, Input } from '../../src/components/common';
import { financialApi, reportsApi } from '../../src/api';
import { QUERY_KEYS } from '../../src/constants/config';

const STATUS_CONFIG = {
  draft: { color: 'secondary', label: 'Rascunho', icon: 'document-outline' },
  sent: { color: 'primary', label: 'Enviada', icon: 'paper-plane-outline' },
  paid: { color: 'success', label: 'Paga', icon: 'checkmark-circle-outline' },
  partial: { color: 'warning', label: 'Parcial', icon: 'pie-chart-outline' },
  overdue: { color: 'danger', label: 'Vencida', icon: 'alert-circle-outline' },
  cancelled: { color: 'secondary', label: 'Cancelada', icon: 'close-circle-outline' },
};

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Dinheiro', icon: 'cash-outline' },
  { key: 'pix', label: 'PIX', icon: 'qr-code-outline' },
  { key: 'card', label: 'Cartão', icon: 'card-outline' },
  { key: 'bank_transfer', label: 'Transferência', icon: 'swap-horizontal-outline' },
  { key: 'check', label: 'Cheque', icon: 'document-text-outline' },
];

function InfoRow({ label, value, valueColor }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-50">
      <Text className="text-gray-500">{label}</Text>
      <Text className={`font-medium ${valueColor || 'text-gray-900'}`}>{value || '-'}</Text>
    </View>
  );
}

function InvoiceItemRow({ item }) {
  return (
    <View className="py-3 border-b border-gray-50">
      <View className="flex-row justify-between mb-1">
        <Text className="font-medium text-gray-900 flex-1">{item.description}</Text>
        <Text className="text-gray-900 font-medium">R$ {(item.totalPrice || 0).toFixed(2)}</Text>
      </View>
      <View className="flex-row">
        <Text className="text-gray-500 text-sm">
          {item.quantity} x R$ {(item.unitPrice || 0).toFixed(2)}
        </Text>
        {item.discount > 0 && (
          <Text className="text-danger-500 text-sm ml-2">
            (-{item.discount}%)
          </Text>
        )}
      </View>
    </View>
  );
}

function PaymentModal({ visible, onClose, onSubmit, maxAmount, loading }) {
  const [amount, setAmount] = useState(maxAmount.toString());
  const [method, setMethod] = useState('pix');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      Alert.alert('Erro', 'Informe um valor válido');
      return;
    }
    if (paymentAmount > maxAmount) {
      Alert.alert('Erro', 'Valor maior que o saldo devedor');
      return;
    }
    onSubmit({ amount: paymentAmount, method, notes });
  };

  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-end">
      <View className="bg-white rounded-t-3xl p-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-900">Registrar Pagamento</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <Input
          label="Valor"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          leftIcon={<Text className="text-gray-500">R$</Text>}
        />

        <Text className="text-gray-700 font-medium mb-2">Método de Pagamento</Text>
        <View className="flex-row flex-wrap mb-4">
          {PAYMENT_METHODS.map((pm) => (
            <TouchableOpacity
              key={pm.key}
              onPress={() => setMethod(pm.key)}
              className={`flex-row items-center px-3 py-2 rounded-lg mr-2 mb-2 ${
                method === pm.key ? 'bg-primary-100 border border-primary-500' : 'bg-gray-100'
              }`}
            >
              <Ionicons
                name={pm.icon}
                size={16}
                color={method === pm.key ? '#2563eb' : '#6b7280'}
              />
              <Text className={`ml-1 text-sm ${
                method === pm.key ? 'text-primary-600' : 'text-gray-600'
              }`}>
                {pm.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Observações"
          value={notes}
          onChangeText={setNotes}
          placeholder="Opcional..."
        />

        <Button
          variant="success"
          className="mt-4"
          onPress={handleSubmit}
          loading={loading}
        >
          Confirmar Pagamento
        </Button>
      </View>
    </View>
  );
}

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.INVOICES, id],
    queryFn: () => financialApi.getInvoice(id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status) => financialApi.updateInvoiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.INVOICES]);
    },
  });

  const paymentMutation = useMutation({
    mutationFn: (data) => financialApi.recordPayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.INVOICES]);
      setShowPaymentModal(false);
      Alert.alert('Sucesso', 'Pagamento registrado com sucesso!');
    },
    onError: (error) => {
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao registrar pagamento');
    },
  });

  const handleSendInvoice = () => {
    Alert.alert(
      'Enviar Fatura',
      'Deseja marcar esta fatura como enviada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: () => updateStatusMutation.mutate('sent') },
      ]
    );
  };

  const handleGeneratePDF = async () => {
    try {
      const response = await reportsApi.generateInvoicePDF(id);
      if (response.data?.url) {
        await Share.share({
          message: `Fatura #${invoice.invoiceNumber}`,
          url: response.data.url,
        });
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao gerar PDF');
    }
  };

  const handleGenerateNFe = () => {
    Alert.alert(
      'Emitir NF-e',
      'Deseja emitir a Nota Fiscal Eletrônica para esta fatura?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Emitir',
          onPress: async () => {
            try {
              await financialApi.generateNFe(id);
              queryClient.invalidateQueries([QUERY_KEYS.INVOICES]);
              Alert.alert('Sucesso', 'NF-e emitida com sucesso!');
            } catch (error) {
              Alert.alert('Erro', error.response?.data?.message || 'Erro ao emitir NF-e');
            }
          }
        },
      ]
    );
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const invoice = invoiceData?.data;
  const statusConfig = STATUS_CONFIG[invoice?.status] || STATUS_CONFIG.draft;
  const items = invoice?.items || [];
  const payments = invoice?.payments || [];

  const remainingAmount = (invoice?.totalAmount || 0) - (invoice?.paidAmount || 0);
  const isOverdue = invoice?.status === 'sent' && dayjs(invoice.dueDate).isBefore(dayjs());

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">
            Fatura #{invoice?.invoiceNumber}
          </Text>
          <Text className="text-gray-500 text-sm">{invoice?.client?.name}</Text>
        </View>
        <TouchableOpacity onPress={handleGeneratePDF} className="mr-3">
          <Ionicons name="download-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Status Card */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                isOverdue ? 'bg-danger-100' : `bg-${statusConfig.color}-100`
              }`}>
                <Ionicons
                  name={isOverdue ? 'alert-circle-outline' : statusConfig.icon}
                  size={24}
                  color={
                    isOverdue ? '#ef4444' :
                    statusConfig.color === 'success' ? '#22c55e' :
                    statusConfig.color === 'warning' ? '#f59e0b' :
                    statusConfig.color === 'danger' ? '#ef4444' :
                    statusConfig.color === 'primary' ? '#2563eb' : '#6b7280'
                  }
                />
              </View>
              <View>
                <Text className="text-gray-500 text-sm">Status</Text>
                <Text className="text-lg font-bold text-gray-900">
                  {isOverdue ? 'Vencida' : statusConfig.label}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-gray-500 text-xs">Valor Total</Text>
              <Text className="text-2xl font-bold text-primary-600">
                R$ {(invoice?.totalAmount || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Payment Progress */}
        {invoice?.paidAmount > 0 && (
          <Card className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Pago</Text>
              <Text className="text-success-600 font-medium">
                R$ {(invoice.paidAmount || 0).toFixed(2)}
              </Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <View
                className="h-full bg-success-500 rounded-full"
                style={{ width: `${((invoice.paidAmount / invoice.totalAmount) * 100).toFixed(0)}%` }}
              />
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Restante</Text>
              <Text className="text-warning-600 font-medium">
                R$ {remainingAmount.toFixed(2)}
              </Text>
            </View>
          </Card>
        )}

        {/* Actions */}
        {invoice?.status !== 'paid' && invoice?.status !== 'cancelled' && (
          <View className="flex-row mb-4">
            {invoice?.status === 'draft' && (
              <Button
                variant="primary"
                className="flex-1 mr-2"
                onPress={handleSendInvoice}
                loading={updateStatusMutation.isPending}
              >
                Enviar
              </Button>
            )}
            {remainingAmount > 0 && (
              <Button
                variant="success"
                className="flex-1 mr-2"
                onPress={() => setShowPaymentModal(true)}
              >
                Pagamento
              </Button>
            )}
            {!invoice?.fiscalNumber && (
              <Button
                variant="outline"
                className="flex-1"
                onPress={handleGenerateNFe}
              >
                Emitir NF-e
              </Button>
            )}
          </View>
        )}

        {/* Invoice Details */}
        <Card title="Detalhes" className="mb-4">
          <InfoRow label="Data de Emissão" value={dayjs(invoice?.issueDate).format('DD/MM/YYYY')} />
          <InfoRow
            label="Data de Vencimento"
            value={dayjs(invoice?.dueDate).format('DD/MM/YYYY')}
            valueColor={isOverdue ? 'text-danger-600' : undefined}
          />
          <InfoRow label="Condição de Pagamento" value={invoice?.paymentTerms} />
          {invoice?.fiscalNumber && (
            <InfoRow label="NF-e" value={`#${invoice.fiscalNumber}`} />
          )}
        </Card>

        {/* Items */}
        <Card title="Itens" subtitle={`${items.length} itens`} className="mb-4">
          {items.map((item, index) => (
            <InvoiceItemRow key={index} item={item} />
          ))}
          <View className="pt-3 mt-2">
            {invoice?.discount > 0 && (
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Desconto</Text>
                <Text className="text-danger-600">-R$ {invoice.discount.toFixed(2)}</Text>
              </View>
            )}
            {invoice?.taxAmount > 0 && (
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Impostos</Text>
                <Text className="text-gray-900">R$ {invoice.taxAmount.toFixed(2)}</Text>
              </View>
            )}
            <View className="flex-row justify-between pt-2 border-t border-gray-200">
              <Text className="font-bold text-gray-900">Total</Text>
              <Text className="font-bold text-primary-600">
                R$ {(invoice?.totalAmount || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Payments */}
        {payments.length > 0 && (
          <Card title="Pagamentos" subtitle={`${payments.length} registros`} className="mb-4">
            {payments.map((payment, index) => (
              <View key={index} className="flex-row items-center py-3 border-b border-gray-50">
                <View className="w-10 h-10 bg-success-100 rounded-lg items-center justify-center mr-3">
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">
                    R$ {(payment.amount || 0).toFixed(2)}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {PAYMENT_METHODS.find(m => m.key === payment.method)?.label || payment.method}
                  </Text>
                </View>
                <Text className="text-gray-400 text-sm">
                  {dayjs(payment.paymentDate).format('DD/MM/YY')}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Notes */}
        {invoice?.notes && (
          <Card title="Observações" className="mb-4">
            <Text className="text-gray-600">{invoice.notes}</Text>
          </Card>
        )}

        <View className="h-6" />
      </ScrollView>

      {/* Payment Modal */}
      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={(data) => paymentMutation.mutate(data)}
        maxAmount={remainingAmount}
        loading={paymentMutation.isPending}
      />
    </SafeAreaView>
  );
}
