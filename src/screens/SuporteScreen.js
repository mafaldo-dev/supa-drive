import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useGlobalStyles } from '../styles/useGlobalStyles';


const SuporteScreen = () => {
  const globalStyles = useGlobalStyles();
  const { colors } = useTheme();


  const supportItems = [
    { icon: 'chat', label: 'Enviar Mensagem' },
    { icon: 'email', label: 'Enviar e-mail' },
    { icon: 'help', label: 'FAQ' }
  ];

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.screenTitle}>Suporte</Text>
      {supportItems.map((s, i) => (
        <TouchableOpacity key={i} style={globalStyles.supportRow}>
          <MaterialIcons name={s.icon} size={22} color={colors.accent} />
          <Text style={globalStyles.supportLabel}>{s.label}</Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SuporteScreen;
