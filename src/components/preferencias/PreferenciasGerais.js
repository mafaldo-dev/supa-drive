import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useMemo } from 'react';

const PreferenciasGerais = ({ preferences, isEditing, onChange, formatCurrency }) => {
  const inputs = [
    { field: 'ganhoPorMinuto', label: 'Ganho por minuto (R$)', keyboard: 'numeric' },
    { field: 'ganhoPorHora', label: 'Ganho por hora (R$)', keyboard: 'numeric' },
    { field: 'ganhoPorKm', label: 'Ganho por km (R$)', keyboard: 'numeric' },
    { field: 'rateMinimo', label: 'Rate mínimo (R$)', keyboard: 'numeric' },
  ];

  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.textPrimary,
      backgroundColor: colors.background,
    },
    valueText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.accent,
      paddingVertical: 8,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Preferências de Ganhos</Text>
      </View>

      {inputs.map((input) => (
        <View key={input.field} style={styles.inputContainer}>
          <Text style={styles.label}>{input.label}</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={preferences[input.field]}
              onChangeText={(text) => {
                if (input.keyboard === 'numeric') {
                  const formatted = formatCurrency(text);
                  onChange(input.field, formatted);
                } else {
                  onChange(input.field, text);
                }
              }}
              keyboardType="numeric"
              placeholder="0,00"
            />
          ) : (
            <Text style={styles.valueText}>
              R$ {preferences[input.field] || '0,00'}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};



export default PreferenciasGerais;