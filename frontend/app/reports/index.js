import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Card from '../../src/components/common/Card';

const reportTypes = [
  {
    id: 'animals',
    title: 'Relatório de Animais',
    description: 'Lista completa de animais cadastrados com informações detalhadas',
    icon: 'paw',
    color: '#10b981',
  },
  {
    id: 'health',
    title: 'Relatório Sanitário',
    description: 'Histórico de vacinas, vermifugações e tratamentos',
    icon: 'medkit',
    color: '#ef4444',
  },
  {
    id: 'reproductive',
    title: 'Relatório Reprodutivo',
    description: 'Procedimentos reprodutivos, gestações e nascimentos',
    icon: 'heart',
    color: '#ec4899',
  },
  {
    id: 'financial',
    title: 'Relatório Financeiro',
    description: 'Faturamento, receitas e contas a receber',
    icon: 'cash',
    color: '#f59e0b',
  },
  {
    id: 'appointments',
    title: 'Relatório de Atendimentos',
    description: 'Histórico de atendimentos e procedimentos realizados',
    icon: 'calendar',
    color: '#3b82f6',
  },
  {
    id: 'clients',
    title: 'Relatório de Clientes',
    description: 'Lista de clientes com dados de contato e propriedades',
    icon: 'people',
    color: '#8b5cf6',
  },
];

export default function ReportsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Relatórios</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <Text className="text-gray-500 mb-4">
          Selecione o tipo de relatório que deseja gerar
        </Text>

        {reportTypes.map((report) => (
          <TouchableOpacity
            key={report.id}
            onPress={() => router.push(`/reports/generate?type=${report.id}`)}
          >
            <Card className="mb-3">
              <View className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${report.color}20` }}
                >
                  <Ionicons name={report.icon} size={24} color={report.color} />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900">{report.title}</Text>
                  <Text className="text-gray-500 text-sm">{report.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
