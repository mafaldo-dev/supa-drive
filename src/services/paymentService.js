import AsyncStorage from '@react-native-async-storage/async-storage';
import { paymentService as apiPaymentService, subscriptionService } from './apiService'

const PAYMENT_KEY = '@motoristapro:payments';
const SUBSCRIPTION_KEY = '@motoristapro:subscription';

// Constantes atualizadas para os planos do backend
export const PLAN_PRICES = {
  1: { monthly: 12.90, yearly: 154.80 },

};

export const PLAN_TYPES = {
  PREMIUM: 1
};

export const PAYMENT_METHODS = {
  PIX: 'pix',
  CREDIT_CARD: 'credit_card',
};

export const createPayment = async (paymentData) => {
  try {
    // Primeiro criar assinatura se não existir
    let subscription = await subscriptionService.getUserSubscription();

    if (!subscription || subscription.status !== 'active') {
      subscription = await subscriptionService.createSubscription(paymentData.planId);
      if (!subscription) {
        throw new Error('Erro ao criar assinatura');
      }
    }

    // Criar intenção de pagamento
    const paymentIntent = await apiPaymentService.createPaymentIntent(
      subscription.id,
      paymentData.method,
      paymentData.billingType || 'monthly'
    );

    if (!paymentIntent) {
      throw new Error('Erro ao criar intenção de pagamento');
    }

    const payment = {
      id: paymentIntent.payment_id || Date.now().toString(),
      subscriptionId: subscription.id,
      amount: paymentIntent.amount,
      method: paymentData.method,
      timestamp: new Date().toISOString(),
      status: 'pending',
      planId: paymentData.planId,
      billingType: paymentData.billingType || 'monthly',
      clientSecret: paymentIntent.client_secret,
      ...paymentData,
    };

    // Save payment record locally
    const payments = await AsyncStorage.getItem(PAYMENT_KEY);
    const paymentHistory = payments ? JSON.parse(payments) : [];
    paymentHistory.push(payment);
    await AsyncStorage.setItem(PAYMENT_KEY, JSON.stringify(paymentHistory));

    return payment;
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return null;
  }
};

export const getPaymentHistory = async () => {
  try {
    const payments = await AsyncStorage.getItem(PAYMENT_KEY);
    return payments ? JSON.parse(payments) : [];
  } catch (error) {
    console.error('Erro ao obter histórico de pagamentos:', error);
    return [];
  }
};

export const saveSubscription = async (subscriptionData) => {
  try {
    const subscription = {
      ...subscriptionData,
      startDate: new Date().toISOString(),
      planType: PREMIUM_PLAN_TYPE,
      price: PREMIUM_PLAN_PRICE,
      autoRenew: false,
    };

    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
    return subscription;
  } catch (error) {
    console.error('Erro ao salvar assinatura:', error);
    return null;
  }
};

export const getSubscription = async () => {
  try {
    const subscription = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
    return subscription ? JSON.parse(subscription) : null;
  } catch (error) {
    console.error('Erro ao obter assinatura:', error);
    return null;
  }
};

export const generatePixQRCode = (amount, orderId) => {
  return {
    type: 'PIX',
    amount: amount,
    orderId: orderId,
    qrCode: `00020126580014br.gov.bcb.pix013650550570001051051.0053039865502${amount.toFixed(2).replace('.', '')}5303986630410122220000300124241${orderId}52040000530398665406${amount.toFixed(2)}63041D3D`,
    copyPaste: `00020126580014br.gov.bcb.pix0136505505700010510510053039865502${amount.toFixed(2).replace('.', '')}5303986630410122220000300124241${orderId}52040000530398665406${amount.toFixed(2)}63041D3D`,
    expiresIn: 3600, // 1 hour
  };
};

export const validatePayment = async (paymentId) => {
  try {
    const payments = await getPaymentHistory();
    const payment = payments.find(p => p.id === paymentId);
    
    if (payment) {
      // Simulated validation - in production, check with actual payment provider
      const isValid = payment.status === 'pending' && payment.amount === PREMIUM_PLAN_PRICE;
      
      if (isValid) {
        payment.status = 'completed';
        await AsyncStorage.setItem(PAYMENT_KEY, JSON.stringify(payments));
        await saveSubscription(payment);
      }
      
      return payment;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao validar pagamento:', error);
    return null;
  }
};

export const cancelPayment = async (paymentId) => {
  try {
    const payments = await getPaymentHistory();
    const payment = payments.find(p => p.id === paymentId);
    
    if (payment) {
      payment.status = 'cancelled';
      await AsyncStorage.setItem(PAYMENT_KEY, JSON.stringify(payments));
    }
    
    return payment;
  } catch (error) {
    console.error('Erro ao cancelar pagamento:', error);
    return null;
  }
};
