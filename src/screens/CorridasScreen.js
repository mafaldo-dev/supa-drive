import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useGlobalStyles } from '../styles/useGlobalStyles';


const CorridasScreen = () => {
	const globalStyles = useGlobalStyles();
	const { colors } = useTheme();

return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.screenTitle}>Minhas Corridas</Text>
      <View style={globalStyles.emptyState}>
        <MaterialIcons name="list-alt" size={60} color={colors.borderLight} />
        <Text style={globalStyles.emptyText}>Nenhuma corrida registrada ainda.</Text>
      </View>
    </View>
  );
};

export default CorridasScreen;
