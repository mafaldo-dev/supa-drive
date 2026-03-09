import AsyncStorage from '@react-native-async-storage/async-storage';

const PAYMENT_KEY = '@motoristapro:payments';
const SUBSCRIPTION_KEY = '@motoristapro:subscription';

export const PREMIUM_PLAN_PRICE = 12.90;
export const PREMIUM_PLAN_TYPE = 'premium';
export const FREE_PLAN_TYPE = 'free';

export const PAYMENT_METHODS = {
  PIX: 'pix',
  CREDIT_CARD: 'credit_card',
};

export const createPayment = async (paymentData) => {
  try {
    const payment = {
      id: Date.now().toString(),
      amount: PREMIUM_PLAN_PRICE,
      method: paymentData.method,
      timestamp: new Date().toISOString(),
      status: 'pending',
      planType: PREMIUM_PLAN_TYPE,
      ...paymentData,
    };

    // Save payment record
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
      autoRenew: false, // Não automático conforme solicitado
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
  // Simulated PIX QR Code - in production, integrate with real PIX API
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
