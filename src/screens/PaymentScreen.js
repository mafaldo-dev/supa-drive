import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import swal from 'sweetalert2';
import { useGlobalStyles } from '../styles/useGlobalStyles';
import { useTheme } from '../context/ThemeContext';
import PaymentMethodsCard from '../components/PaymentMethodsCard';
import { PREMIUM_PLAN_PRICE, PAYMENT_METHODS, createPayment, generatePixQRCode } from '../services/paymentService';

const PaymentScreen = ({ navigation, onPaymentSuccess }) => {
  const globalStyles = useGlobalStyles();
  const { colors } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState(null);

  const styles = useMemo(() => StyleSheet.create({
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    content: {
      padding: 16,
      paddingBottom: 80,
    },
    planCard: {
      backgroundColor: colors.accentLight,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: colors.accent,
      alignItems: 'center',
    },
    planTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.accent,
      marginBottom: 8,
    },
    planPrice: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.accent,
      marginBottom: 4,
    },
    planSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    benefitsCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    benefitsTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    benefit: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    benefitText: {
      marginLeft: 10,
      fontSize: 14,
      color: colors.textPrimary,
      flex: 1,
    },
    pixQRContainer: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      alignItems: 'center',
    },
    pixQRTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    pixQRBox: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      width: '100%',
    },
    pixQRText: {
      fontFamily: 'monospace',
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    copyButton: {
      backgroundColor: colors.accent,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    copyButtonText: {
      color: colors.onAccent,
      fontWeight: '600',
      fontSize: 12,
    },
    processingText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 12,
    },
    paymentButton: {
      position: 'absolute',
      bottom: 20,
      left: 16,
      right: 16,
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    paymentButtonText: {
      color: colors.onAccent,
      fontWeight: '700',
      fontSize: 15,
    },
    paymentButtonDisabled: {
      opacity: 0.6,
    },
  }), [colors]);

  const benefits = [
    { icon: 'local-activity', text: 'Semáforo Automático' },
    { icon: 'warning', text: 'Alerta de Áreas de Risco' },
    { icon: 'calculate', text: 'Cálculo de R$/km' },
    { icon: 'headset-mic', text: 'Suporte Prioritário' },
    { icon: 'trending-up', text: 'Análise Detalhada' },
  ];

  const handlePaymentMethodSelect = (method) => {
    setSelectedMethod(method);
    setPixData(null);
  };

  const generatePixCode = async () => {
    if (!selectedMethod) {
      swal.fire('Atenção', 'Selecione uma forma de pagamento', 'info');
      return;
    }

    if (selectedMethod === PAYMENT_METHODS.PIX) {
      const pix = generatePixQRCode(PREMIUM_PLAN_PRICE, `SUPA${Date.now()}`);
      setPixData(pix);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      swal.fire('Atenção', 'Selecione uma forma de pagamento', 'info');
      return;
    }

    setIsProcessing(true);

    try {
      let paymentData = {
        method: selectedMethod,
        description: 'Premium Plan - Supa Driver',
      };

      if (selectedMethod === PAYMENT_METHODS.PIX) {
        if (!pixData) {
          await generatePixCode();
          setIsProcessing(false);
          return;
        }
        paymentData.pixCode = pixData.copyPaste;
      } else if (selectedMethod === PAYMENT_METHODS.CREDIT_CARD) {
        paymentData.cardInfo = 'Será redirecionado para gateway de pagamento';
      }

      const payment = await createPayment(paymentData);

      if (payment) {
        swal.fire({
          title: 'Pagamento Iniciado',
          text: selectedMethod === PAYMENT_METHODS.PIX
            ? 'Escaneie o QR Code ou copie o código PIX para confirmar o pagamento'
            : 'Você será redirecionado para confirmar o pagamento com cartão',
          icon: 'success',
          showConfirmButton: true,
        });

        if (onPaymentSuccess) {
          onPaymentSuccess(payment);
        }
      }
    } catch (error) {
      console.error('Erro no pagamento:', error);
      swal.fire('Erro', 'Erro ao processar pagamento. Tente novamente.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade para Premium</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plan Card */}
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>🌟 Premium</Text>
          <Text style={styles.planPrice}>R$ {PREMIUM_PLAN_PRICE.toFixed(2)}</Text>
          <Text style={styles.planSubtitle}>/mês • Pagamento único, sem renovação automática</Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>O que você ganha:</Text>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefit}>
              <MaterialIcons name={benefit.icon} size={18} color={colors.accent} />
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </View>

        {/* Payment Methods */}
        <PaymentMethodsCard
          onSelectMethod={handlePaymentMethodSelect}
          selectedMethod={selectedMethod}
        />

        {/* PIX QR Code Display */}
        {selectedMethod === PAYMENT_METHODS.PIX && (
          <View style={styles.pixQRContainer}>
            {!pixData ? (
              <TouchableOpacity
                onPress={generatePixCode}
                style={styles.copyButton}
              >
                <MaterialIcons name="qr-code-2" size={18} color={colors.onAccent} />
                <Text style={styles.copyButtonText}>Gerar QR Code PIX</Text>
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.pixQRTitle}>📱 QR Code PIX</Text>
                <View style={styles.pixQRBox}>
                  <Text style={styles.pixQRText}>{pixData.copyPaste}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    // Copy to clipboard
                    swal.fire('Copiado!', 'Código PIX copiado para área de transferência', 'success');
                  }}
                  style={styles.copyButton}
                >
                  <MaterialIcons name="content-copy" size={16} color={colors.onAccent} />
                  <Text style={styles.copyButtonText}>Copiar Código</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Credit Card Info */}
        {selectedMethod === PAYMENT_METHODS.CREDIT_CARD && (
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>💳 Cartão de Crédito/Débito</Text>
            <Text style={styles.processingText}>
              Clique em "Confirmar Pagamento" e você será redirecionado para completar a transação com segurança.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Payment Button */}
      <TouchableOpacity
        style={[
          styles.paymentButton,
          !selectedMethod && styles.paymentButtonDisabled,
        ]}
        onPress={handlePayment}
        disabled={!selectedMethod || isProcessing}
      >
        {isProcessing ? (
          <>
            <ActivityIndicator color={colors.onAccent} size="small" />
            <Text style={styles.paymentButtonText}>Processando...</Text>
          </>
        ) : (
          <>
            <MaterialIcons name="check-circle" size={20} color={colors.onAccent} />
            <Text style={styles.paymentButtonText}>Confirmar Pagamento</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PaymentScreen;
