import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const PaymentMethodsCard = ({ onSelectMethod, selectedMethod }) => {
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    methodsGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    methodButton: {
      flex: 1,
      borderWidth: 2,
      borderColor: colors.borderLight,
      borderRadius: 10,
      paddingVertical: 14,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    methodButtonSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.accentLight,
    },
    methodIcon: {
      fontSize: 28,
      marginBottom: 6,
    },
    methodLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    methodDesc: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 4,
    },
  }), [colors]);

  const paymentMethods = [
    {
      id: 'pix',
      label: 'PIX',
      icon: '💳',
      description: 'Instantâneo',
    },
    {
      id: 'credit_card',
      label: 'Cartão',
      icon: '💰',
      description: 'Crédito/Débito',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha a forma de pagamento</Text>
      <View style={styles.methodsGrid}>
        {paymentMethods.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodButton,
              selectedMethod === method.id && styles.methodButtonSelected
            ]}
            onPress={() => onSelectMethod(method.id)}
          >
            <Text style={styles.methodIcon}>{method.icon}</Text>
            <Text style={styles.methodLabel}>{method.label}</Text>
            <Text style={styles.methodDesc}>{method.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default PaymentMethodsCard;
