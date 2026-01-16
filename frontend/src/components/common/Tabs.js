import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function Tab({ tab, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-3 flex-row items-center ${
        active ? 'border-b-2 border-primary-500' : ''
      }`}
    >
      {tab.icon && (
        <Ionicons
          name={tab.icon}
          size={18}
          color={active ? '#2563eb' : '#9ca3af'}
          style={{ marginRight: 6 }}
        />
      )}
      <Text
        className={`font-medium ${
          active ? 'text-primary-600' : 'text-gray-500'
        }`}
      >
        {tab.label}
      </Text>
      {tab.badge !== undefined && (
        <View className={`ml-2 px-2 py-0.5 rounded-full ${
          active ? 'bg-primary-100' : 'bg-gray-100'
        }`}>
          <Text className={`text-xs font-bold ${
            active ? 'text-primary-600' : 'text-gray-500'
          }`}>
            {tab.badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
  scrollable = false,
  variant = 'default', // 'default', 'pills', 'underline'
}) {
  const Container = scrollable ? ScrollView : View;
  const containerProps = scrollable ? {
    horizontal: true,
    showsHorizontalScrollIndicator: false,
    contentContainerStyle: { paddingHorizontal: 4 },
  } : {};

  if (variant === 'pills') {
    return (
      <Container {...containerProps} className="flex-row bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            className={`flex-1 px-4 py-2 rounded-md items-center ${
              activeTab === tab.key ? 'bg-white shadow-sm' : ''
            }`}
          >
            {tab.icon && (
              <Ionicons
                name={tab.icon}
                size={18}
                color={activeTab === tab.key ? '#2563eb' : '#6b7280'}
              />
            )}
            <Text
              className={`font-medium ${
                activeTab === tab.key ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Container>
    );
  }

  return (
    <Container
      {...containerProps}
      className="flex-row border-b border-gray-200"
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.key}
          tab={tab}
          active={activeTab === tab.key}
          onPress={() => onTabChange(tab.key)}
        />
      ))}
    </Container>
  );
}
