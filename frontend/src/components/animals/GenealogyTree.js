import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

function AnimalNode({ animal, onPress, isMain = false }) {
  if (!animal) {
    return (
      <View className="items-center">
        <View className={`${isMain ? 'w-20 h-20' : 'w-16 h-16'} bg-gray-200 rounded-lg items-center justify-center`}>
          <Ionicons name="help" size={isMain ? 24 : 18} color="#9ca3af" />
        </View>
        <Text className="text-gray-400 text-xs mt-1">Desconhecido</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} className="items-center">
      <View
        className={`${isMain ? 'w-20 h-20' : 'w-16 h-16'} rounded-lg items-center justify-center ${
          animal.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100'
        }`}
      >
        <Ionicons
          name={animal.gender === 'male' ? 'male' : 'female'}
          size={isMain ? 24 : 18}
          color={animal.gender === 'male' ? '#3b82f6' : '#ec4899'}
        />
      </View>
      <Text
        className={`text-center mt-1 ${isMain ? 'font-bold text-gray-900' : 'text-xs text-gray-600'}`}
        numberOfLines={1}
      >
        {animal.name}
      </Text>
      {animal.identifier && (
        <Text className="text-gray-400 text-xs">{animal.identifier}</Text>
      )}
    </TouchableOpacity>
  );
}

function ConnectorLine({ type }) {
  if (type === 'horizontal') {
    return <View className="w-4 h-0.5 bg-gray-300" />;
  }
  if (type === 'vertical') {
    return <View className="w-0.5 h-4 bg-gray-300" />;
  }
  return null;
}

export default function GenealogyTree({ animal, sire, dam, paternalGrandSire, paternalGrandDam, maternalGrandSire, maternalGrandDam, offspring = [] }) {
  const router = useRouter();

  const navigateToAnimal = (animalData) => {
    if (animalData?.id) {
      router.push(`/animals/${animalData.id}`);
    }
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="p-4">
        {/* Grandparents Row */}
        <View className="flex-row justify-around mb-2">
          {/* Paternal Grandparents */}
          <View className="items-center">
            <View className="flex-row items-center">
              <AnimalNode
                animal={paternalGrandSire}
                onPress={() => navigateToAnimal(paternalGrandSire)}
              />
              <ConnectorLine type="horizontal" />
              <AnimalNode
                animal={paternalGrandDam}
                onPress={() => navigateToAnimal(paternalGrandDam)}
              />
            </View>
            <ConnectorLine type="vertical" />
          </View>

          {/* Maternal Grandparents */}
          <View className="items-center">
            <View className="flex-row items-center">
              <AnimalNode
                animal={maternalGrandSire}
                onPress={() => navigateToAnimal(maternalGrandSire)}
              />
              <ConnectorLine type="horizontal" />
              <AnimalNode
                animal={maternalGrandDam}
                onPress={() => navigateToAnimal(maternalGrandDam)}
              />
            </View>
            <ConnectorLine type="vertical" />
          </View>
        </View>

        {/* Parents Row */}
        <View className="flex-row justify-around mb-2 px-8">
          <View className="items-center">
            <AnimalNode
              animal={sire}
              onPress={() => navigateToAnimal(sire)}
            />
            <Text className="text-gray-400 text-xs">Pai</Text>
          </View>
          <View className="w-8" />
          <View className="items-center">
            <AnimalNode
              animal={dam}
              onPress={() => navigateToAnimal(dam)}
            />
            <Text className="text-gray-400 text-xs">Mãe</Text>
          </View>
        </View>

        {/* Connection to Main Animal */}
        <View className="items-center mb-2">
          <View className="flex-row items-center">
            <View className="w-16" />
            <View className="w-0.5 h-6 bg-gray-300" />
            <View className="w-16" />
          </View>
        </View>

        {/* Main Animal */}
        <View className="items-center mb-4">
          <AnimalNode
            animal={animal}
            onPress={() => {}}
            isMain
          />
          <View className="bg-primary-100 px-2 py-0.5 rounded-full mt-1">
            <Text className="text-primary-700 text-xs font-medium">Principal</Text>
          </View>
        </View>

        {/* Offspring */}
        {offspring.length > 0 && (
          <>
            <View className="items-center mb-2">
              <View className="w-0.5 h-6 bg-gray-300" />
            </View>

            <View className="items-center">
              <Text className="text-gray-500 text-xs mb-2">Crias ({offspring.length})</Text>
              <View className="flex-row flex-wrap justify-center">
                {offspring.slice(0, 5).map((child, index) => (
                  <View key={child.id || index} className="mx-2 mb-2">
                    <AnimalNode
                      animal={child}
                      onPress={() => navigateToAnimal(child)}
                    />
                  </View>
                ))}
                {offspring.length > 5 && (
                  <View className="items-center justify-center w-16 h-16 bg-gray-100 rounded-lg">
                    <Text className="text-gray-500 font-bold">+{offspring.length - 5}</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
