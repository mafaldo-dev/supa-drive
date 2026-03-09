import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useMemo } from 'react';

const DefinirMetas = ({ preferences, isEditing, onChange, formatCurrency }) => {
  const inputs = [
    { field: 'metaDiaria', label: 'Meta diária (R$)', placeholder: 'Quanto quer ganhar hoje?' },
    { field: 'combustivelDiario', label: 'Combustível hoje (R$)', placeholder: 'Gasto com combustível' },
    { field: 'metaSemanal', label: 'Meta semanal (R$)', placeholder: 'Quanto quer ganhar na semana?' },
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
    rangeContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    rangeInput: {
      borderWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.textPrimary,
      backgroundColor: colors.background,
      width: '48%',
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Definir Metas</Text>

      {inputs.map((input) => (
        <View key={input.field} style={styles.inputContainer}>
          <Text style={styles.label}>{input.label}</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={preferences[input.field]}
              onChangeText={(text) => {
                const formatted = formatCurrency(text);
                onChange(input.field, formatted);
              }}
              keyboardType="numeric"
              placeholder={input.placeholder}
            />
          ) : (
            <Text style={styles.valueText}>
              {preferences[input.field] ? `R$ ${preferences[input.field]}` : 'Não definido'}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};


export default DefinirMetas;