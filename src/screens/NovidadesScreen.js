import React from 'react';
import { View, Text } from 'react-native';
import { useGlobalStyles } from '../styles/useGlobalStyles';

const NovidadesScreen = () => {
  const globalStyles = useGlobalStyles();

return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.screenTitle}>Novidades</Text>
      <View style={globalStyles.newsCard}>
        <Text style={globalStyles.newsTag}>🆕 v1.0.0</Text>
        <Text style={globalStyles.newsTitle}>Lançamento do MotoristaPro!</Text>
        <Text style={globalStyles.newsBody}>Análise inteligente de corridas, semáforo automático e muito mais.</Text>
      </View>
    </View>
  );
};

export default NovidadesScreen;
