import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  Clipboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/helpers'
import { useTheme } from '../context/ThemeContext';
import PaymentMethodsCard from '../components/PaymentMethodsCard';
import { PLAN_PRICE, PAYMENT_METHODS, createPayment, generatePixQRCode, PLAN_PRICES } from '../services/paymentService';

const PaymentScreen = ({ navigation, onPaymentSuccess }) => {
  const { colors } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState(null);

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
      paddingBottom: 100, // Aumentado para dar espaço ao botão fixo
    },
    planCard: {
      backgroundColor: colors.cardBackground,
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
      marginTop: 20,
      alignItems: 'center',
    },
    pixTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    pixAmount: {
      fontSize: 16,
      color: colors.accent,
      marginBottom: 16,
    },
    qrCode: {
      width: 200,
      height: 200,
      marginBottom: 16,
    },
    pixCode: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    copyButton: {
      backgroundColor: colors.accent,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    copyButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
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
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 15,
    },
    paymentButtonDisabled: {
      opacity: 0.6,
    },
    processingText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 12,
    },
  });

  const benefits = [
    { icon: 'local-activity', text: 'Semáforo Automático' },
    { icon: 'timer', text: 'Cronometro' },
    { icon: 'trending-up', text: 'Análise Detalhada' },
    { icon: 'calculate', text: 'Cálculo de R$/km' },
    { icon: 'warning', text: 'Alerta de Áreas de Risco' },
    { icon: 'headset-mic', text: 'Suporte Prioritário' },
  ];

  const handlePaymentMethodSelect = (method) => {
    setSelectedMethod(method);
    setPixData(null);
  };

  const generatePixCode = async () => {
    if (!selectedMethod) {
      Alert.alert('Atenção', 'Selecione uma forma de pagamento');
      return;
    }

    if (selectedMethod === PAYMENT_METHODS.PIX) {
      const pix = generatePixQRCode(PLAN_PRICES[1] ? PLAN_PRICES[1].monthly : PLAN_PRICE, `SUPA${Date.now()}`);
      setPixData(pix);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Atenção', 'Selecione uma forma de pagamento');
      return;
    }

    setIsProcessing(true);

    try {
      if (selectedMethod === PAYMENT_METHODS.PIX) {
        if (!pixData) {
          await generatePixCode();
          setIsProcessing(false);
          return;
        }
        
        const paymentResult = await createPayment({
          method: selectedMethod,
          amount: PLAN_PRICES[1] ? PLAN_PRICES[1].monthly : PLAN_PRICE,
          description: 'Plano Premium Supa Drive',
          pixCode: pixData.code
        });

        Alert.alert(
          'Pagamento Iniciado',
          'Escaneie o QR Code ou copie o código PIX para confirmar o pagamento',
          [{ text: 'OK' }]
        );
        
        if (onPaymentSuccess) {
          onPaymentSuccess(paymentResult);
        }
      } else {
        // Credit card payment
        const result = await createPayment({
          method: selectedMethod,
          amount: PLAN_PRICES[1] ? PLAN_PRICES[1].monthly : PLAN_PRICE,
          description: 'Plano Premium Supa Drive'
        });

        if (result) {
          Alert.alert('Sucesso!', 'Pagamento realizado com sucesso!');
          if (onPaymentSuccess) {
            onPaymentSuccess(result);
          }
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Erro', 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copiado!', 'Código PIX copiado para área de transferência');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plano Premium</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plan Details */}
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Plano Premium</Text>
          <Text style={styles.planPrice}>
              {PLAN_PRICES[1] ? formatCurrency(PLAN_PRICES[1].monthly) : formatCurrency(PLAN_PRICE)}
            <Text style={styles.planSubtitle}>/mês</Text>
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>O que você recebe:</Text>
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

        {/* PIX QR Code */}
        {selectedMethod === PAYMENT_METHODS.PIX && (
          <View style={styles.pixQRContainer}>
            {!pixData ? (
              <TouchableOpacity
                style={styles.copyButton}
                onPress={generatePixCode}
                disabled={true}
              >
                <MaterialIcons name="qr-code-2" size={20} color="#FFFFFF" />
                <Text style={styles.copyButtonText}>Gerar QR Code PIX</Text>
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.pixTitle}>QR Code PIX</Text>
                <Text style={styles.pixAmount}>R$ {PLAN_PRICES[1] ? PLAN_PRICES[1].monthly.toFixed(2) : PLAN_PRICE.toFixed(2)}</Text>
                {pixData.qrCodeBase64 && (
                  <Image
                    source={{ uri: `data:image/png;base64,${pixData.qrCodeBase64}` }}
                    style={styles.qrCode}
                    resizeMode="contain"
                  />
                )}
                <Text style={styles.pixCode} numberOfLines={2}>
                  {pixData.code}
                </Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(pixData.code)}
                >
                  <MaterialIcons name="content-copy" size={20} color="#FFFFFF" />
                  <Text style={styles.copyButtonText}>Copiar Código</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Credit Card Info */}
        {selectedMethod === PAYMENT_METHODS.CREDIT_CARD && (
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>💳 Cartão de Crédito</Text>
            <Text style={styles.processingText}>
              Clique em "Confirmar Pagamento" para prosseguir com o pagamento via cartão.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Payment Button */}
      {selectedMethod && (
        <TouchableOpacity
          style={[
            styles.paymentButton,
            isProcessing && styles.paymentButtonDisabled
          ]}
          onPress={handlePayment}
          disabled
        >
          {isProcessing ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.paymentButtonText}>Processando...</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
              <Text style={styles.paymentButtonText}>
                Pagar R$ {formatCurrency(PLAN_PRICES[1] ? PLAN_PRICES[1].monthly : PLAN_PRICE)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PaymentScreen;