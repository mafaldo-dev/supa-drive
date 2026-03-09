import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { usePromotions, usePlans } from '../hooks/useSubscription';

const PromocoesScreen = () => {

  const { colors } = useTheme();
  const { promotions, isLoading: promotionsLoading, applyPromotionCode } = usePromotions();
  const { plans } = usePlans();

  const [promoCode, setPromoCode] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedPromotions, setAppliedPromotions] = useState(new Set());

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.headerBackground,
      paddingHorizontal: 16,
      paddingTop: 50,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    content: {
      padding: 16,
    },
    promoCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    promoEmoji: {
      fontSize: 32,
      textAlign: 'center',
      marginBottom: 12,
    },
    promoTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 8,
    },
    promoDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    promoCodeInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 12,
      color: colors.textPrimary,
    },
    planSelector: {
      marginBottom: 16,
    },
    planSelectorTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    planOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginBottom: 8,
    },
    planOptionSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.accentLight,
    },
    planOptionText: {
      marginLeft: 8,
      fontSize: 14,
      color: colors.textPrimary,
    },
    applyButton: {
      backgroundColor: colors.accent,
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
      marginBottom: 12,
    },
    applyButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    appliedBadge: {
      backgroundColor: '#4CAF50',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignSelf: 'flex-start',
    },
    appliedBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
  });

  const handleApplyPromotion = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Erro', 'Digite um código promocional');
      return;
    }

    if (!selectedPlan) {
      Alert.alert('Erro', 'Selecione um plano');
      return;
    }

    setIsApplying(true);
    try {
      const result = await applyPromotionCode(promoCode.toUpperCase(), selectedPlan);

      if (result.valid) {
        setAppliedPromotions(prev => new Set([...prev, promoCode.toUpperCase()]));
        Alert.alert(
          'Sucesso!',
          `Código aplicado! ${result.discount_amount > 0 ? `Desconto: R$ ${result.discount_amount.toFixed(2)}` : ''}\nPreço final: R$ ${result.final_price.toFixed(2)}`,
          [{ text: 'OK' }]
        );
        setPromoCode('');
      } else {
        Alert.alert('Erro', result.message);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao aplicar código promocional');
    } finally {
      setIsApplying(false);
    }
  };

  const renderPromotionCard = (promotion) => {
    const isApplied = appliedPromotions.has(promotion.code);

    return (
      <View key={promotion.id} style={styles.promoCard}>
        <Text style={styles.promoEmoji}>🎉</Text>
        <Text style={styles.promoTitle}>{promotion.name}</Text>
        <Text style={styles.promoDescription}>{promotion.description}</Text>

        {isApplied && (
          <View style={styles.appliedBadge}>
            <Text style={styles.appliedBadgeText}>✓ Aplicado</Text>
          </View>
        )}
      </View>
    );
  };

  if (promotionsLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Promoções</Text>
      </View>

      <View style={styles.content}>
        {/* Aplicar código promocional */}
        <View style={styles.promoCard}>
          <Text style={styles.promoEmoji}>🎟️</Text>
          <Text style={styles.promoTitle}>Aplicar Código Promocional</Text>
          <Text style={styles.promoDescription}>
            Digite seu código e selecione o plano para aplicar o desconto
          </Text>

          <TextInput
            style={styles.promoCodeInput}
            placeholder="Digite o código promocional"
            placeholderTextColor={colors.textSecondary}
            value={promoCode}
            onChangeText={setPromoCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <View style={styles.planSelector}>
            <Text style={styles.planSelectorTitle}>Selecione o plano:</Text>
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planOption,
                  selectedPlan === plan.id && styles.planOptionSelected
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                <MaterialIcons
                  name={selectedPlan === plan.id ? "radio-button-checked" : "radio-button-unchecked"}
                  size={20}
                  color={selectedPlan === plan.id ? colors.accent : colors.textSecondary}
                />
                <Text style={styles.planOptionText}>
                  {plan.name} - R$ {plan.price_monthly}/mês
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyPromotion}
            disabled={isApplying}
          >
            {isApplying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.applyButtonText}>Aplicar Código</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Lista de promoções ativas */}
        {promotions.length > 0 && (
          <>
            <Text style={[styles.headerTitle, { marginBottom: 16, textAlign: 'left' }]}>
              Promoções Ativas
            </Text>
            {promotions.map(renderPromotionCard)}
          </>
        )}

        {promotions.length === 0 && !promotionsLoading && (
          <View style={styles.promoCard}>
            <Text style={styles.promoEmoji}>😔</Text>
            <Text style={styles.promoTitle}>Nenhuma promoção ativa</Text>
            <Text style={styles.promoDescription}>
              No momento não há promoções disponíveis. Fique ligado para as próximas ofertas!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default PromocoesScreen;
