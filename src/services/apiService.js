import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../utils/constants';
import { STORAGE_KEYS } from '../utils/storage';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// ===== PLANOS =====
export const planService = {
  getPlans: async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/plans`, {
        headers: await getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      return [];
    }
  },

  getPlan: async (planId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/plans/${planId}`, {
        headers: await getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
      return null;
    }
  }
};

// ===== ASSINATURAS =====
export const subscriptionService = {
  createSubscription: async (planId) => {
    try {
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      const response = await fetch(`${BACKEND_URL}/api/subscriptions`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ driver_id: parseInt(driverId), plan_id: planId })
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      return null;
    }
  },

getUserSubscription: async () => {
    try {
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      const response = await fetch(`${BACKEND_URL}/api/subscriptions/driver/${driverId}`, {
        headers: await getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      return null;
    }
  },

  checkSubscriptionStatus: async () => {
    try {
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      const response = await fetch(`${BACKEND_URL}/api/subscriptions/status/${driverId}`, {
        headers: await getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return { active: false, status: 'error' };
    }
  },

  // ===== CONFIGURAÇÕES DO MOTORISTA =====
  getDriverSettings: async () => {
    try {
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      const response = await fetch(`${BACKEND_URL}/api/driver/profit/${driverId}`, {
        headers: await getAuthHeaders()
      });
      const text = await response.text();
      return JSON.parse(text);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return null;
    }
  },

  updateDriverSettings: async (settingsData) => {
    try {
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      const response = await fetch(`${BACKEND_URL}/api/driver/settings/${driverId}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ ...settingsData, driver_id: parseInt(driverId) })
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return null;
    }
  },

  createDriverSettings: async (settingsData) => {
    try {
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      const response = await fetch(`${BACKEND_URL}/api/driver/settings`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ ...settingsData, driver_id: parseInt(driverId) })
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar configurações:', error);
      return null;
    }
  },

  // ===== PROMOÇÕES =====
  getActivePromotions: async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/promotions/active`, {
        headers: await getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar promoções:', error);
      return [];
    }
  },

  applyPromotionCode: async (code, planId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/promotions/apply`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ code, plan_id: planId })
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao aplicar promoção:', error);
      return { valid: false, message: 'Erro de conexão' };
    }
  }
};

// ===== PAGAMENTOS =====
export const paymentService = {
  createPaymentIntent: async (subscriptionId, paymentMethod, billingType = 'monthly') => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/payments/intent`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          subscription_id: subscriptionId,
          payment_method: paymentMethod,
          billing_type: billingType
        })
      });
      const data = await response.json();
      if (paymentMethod === 'pix' && data.qr_code_base64) {
        await AsyncStorage.setItem('pix_qr_data', JSON.stringify({
          qrCode: data.qr_code,
          qrCodeBase64: data.qr_code_base64,
          paymentId: data.payment_id
        }));
      }
      return data;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      return null;
    }
  },

  getPixData: async () => {
    try {
      const pixData = await AsyncStorage.getItem('pix_qr_data');
      return pixData ? JSON.parse(pixData) : null;
    } catch (error) {
      return null;
    }
  },

  clearPixData: async () => {
    await AsyncStorage.removeItem('pix_qr_data');
  }
};

// ===== CORRIDAS =====
export const rideService = {
  analyzeRide: async (rideData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/ride/analyze`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(rideData)
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao analisar corrida:', error);
      return null;
    }
  }
};

// ===== PERFIL DO MOTORISTA =====
export const driverService = {
  updateProfile: async (name) => {
    try {
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      const response = await fetch(`${BACKEND_URL}/api/driver/${driverId}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ name })
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return null;
    }
  }
};