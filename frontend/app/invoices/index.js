import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Card, Loading, Badge, EmptyState } from '../../src/components/common';
import { financialApi } from '../../src/api';
import { QUERY_KEYS } from '../../src/constants/config';

const STATUS_CONFIG = {
  draft: { color: 'secondary', label: 'Rascunho' },
  sent: { color: 'primary', label: 'Enviada' },
  paid: { color: 'success', label: 'Paga' },
  partial: { color: 'warning', label: 'Parcial' },
  overdue: { color: 'danger', label: 'Vencida' },
  cancelled: { color: 'secondary', label: 'Cancelada' },
};

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'paid', label: 'Pagas' },
  { key: 'overdue', label: 'Vencidas' },
];

function FilterChip({ filter, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-2 ${
        active ? 'bg-primary-500' : 'bg-gray-200'
      }`}
    >
      <Text className={`font-medium ${active ? 'text-white' : 'text-gray-600'}`}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );
}

function InvoiceCard({ invoice, onPress }) {
  const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;
  const isOverdue = invoice.status === 'sent' && dayjs(invoice.dueDate).isBefore(dayjs());

  return (
    <TouchableOpacity onPress={onPress}>
      <Card className="mb-3">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="font-bold text-gray-900 text-lg">
              #{invoice.invoiceNumber}
            </Text>
            <Text className="text-gray-600">{invoice.client?.name}</Text>
          </View>
          <Badge variant={isOverdue ? 'danger' : statusConfig.color} size="sm">
            {isOverdue ? 'Vencida' : statusConfig.label}
          </Badge>
        </View>

        <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
          <View>
            <Text className="text-gray-500 text-xs">Emissão</Text>
            <Text className="text-gray-700">
              {dayjs(invoice.issueDate).format('DD/MM/YYYY')}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-500 text-xs">Vencimento</Text>
            <Text className={`${isOverdue ? 'text-danger-600' : 'text-gray-700'}`}>
              {dayjs(invoice.dueDate).format('DD/MM/YYYY')}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-500 text-xs">Valor</Text>
            <Text className="text-primary-600 font-bold">
              R$ {(invoice.totalAmount || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {invoice.paidAmount > 0 && invoice.paidAmount < invoice.totalAmount && (
          <View className="mt-2 pt-2 border-t border-gray-100">
            <View className="flex-row justify-between">
              <Text className="text-gray-500 text-sm">Pago</Text>
              <Text className="text-success-600">R$ {invoice.paidAmount.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500 text-sm">Restante</Text>
              <Text className="text-warning-600">
                R$ {(invoice.totalAmount - invoice.paidAmount).toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

function StatsCard({ stats }) {
  return (
    <Card className="mb-4">
      <View className="flex-row">
        <View className="flex-1 items-center py-2">
          <Text className="text-2xl font-bold text-gray-900">
            {stats?.totalInvoices || 0}
          </Text>
          <Text className="text-gray-500 text-xs">Faturas</Text>
        </View>
        <View className="w-px bg-gray-200" />
        <View className="flex-1 items-center py-2">
          <Text className="text-2xl font-bold text-success-600">
            R$ {((stats?.paidAmount || 0) / 1000).toFixed(1)}k
          </Text>
          <Text className="text-gray-500 text-xs">Recebido</Text>
        </View>
        <View className="w-px bg-gray-200" />
        <View className="flex-1 items-center py-2">
          <Text className="text-2xl font-bold text-warning-600">
            R$ {((stats?.pendingAmount || 0) / 1000).toFixed(1)}k
          </Text>
          <Text className="text-gray-500 text-xs">Pendente</Text>
        </View>
      </View>
    </Card>
  );
}

export default function InvoicesListScreen() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);

  const getStatusFilter = () => {
    switch (activeFilter) {
      case 'pending':
        return ['sent', 'partial'];
      case 'paid':
        return ['paid'];
      case 'overdue':
        return ['overdue'];
      default:
        return undefined;
    }
  };

  const { data: invoicesData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [QUERY_KEYS.INVOICES, { page, status: getStatusFilter() }],
    queryFn: () => financialApi.getInvoices({ page, limit: 20, status: getStatusFilter() }),
  });

  const { data: statsData } = useQuery({
    queryKey: [QUERY_KEYS.FINANCIAL_STATS],
    queryFn: financialApi.getStats,
  });

  const invoices = invoicesData?.data?.data || [];
  const pagination = invoicesData?.data?.pagination || {};
  const stats = statsData?.data || {};

  const handleLoadMore = () => {
    if (pagination.hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  if (isLoading && page === 1) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Faturas</Text>
        <TouchableOpacity onPress={() => router.push('/invoices/new')}>
          <Ionicons name="add-circle" size={28} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <FilterChip
              filter={item}
              active={activeFilter === item.key}
              onPress={() => {
                setActiveFilter(item.key);
                setPage(1);
              }}
            />
          )}
        />
      </View>

      {/* Content */}
      <FlatList
        className="flex-1 px-4 pt-4"
        data={invoices}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<StatsCard stats={stats} />}
        renderItem={({ item }) => (
          <InvoiceCard
            invoice={item}
            onPress={() => router.push(`/invoices/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="Nenhuma fatura encontrada"
            message="Crie sua primeira fatura para começar"
            actionLabel="Nova Fatura"
            onAction={() => router.push('/invoices/new')}
          />
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading && page > 1 ? <Loading /> : <View className="h-6" />
        }
      />
    </SafeAreaView>
  );
}
