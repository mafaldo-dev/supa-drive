import { useState, useEffect } from 'react';
import { subscriptionService, planService } from '../services/apiService';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  const checkSubscription = async () => {
    try {
      setIsLoading(true);
      const status = await subscriptionService.checkSubscriptionStatus();

      setSubscription(status);
      setIsPremium(status.active);
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  return {
    subscription,
    isPremium,
    isLoading,
    refreshSubscription: checkSubscription
  };
};

// Hook para gerenciar planos
export const usePlans = () => {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const plansData = await planService.getPlans();
      setPlans(plansData);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  return {
    plans,
    isLoading,
    refreshPlans: loadPlans
  };
};

export const usePromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPromotions = async () => {
    try {
      setIsLoading(true);
      const promotionsData = await subscriptionService.getActivePromotions();
      setPromotions(promotionsData);
    } catch (error) {
      console.error('Erro ao carregar promoções:', error);
      setPromotions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyPromotionCode = async (code, planId) => {
    try {
      const result = await subscriptionService.applyPromotionCode(code, planId);
      return result;
    } catch (error) {
      console.error('Erro ao aplicar código:', error);
      return { valid: false, message: 'Erro ao aplicar código' };
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  return {
    promotions,
    isLoading,
    applyPromotionCode,
    refreshPromotions: loadPromotions
  };
};

export const useDriverSettings = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const settingsData = await subscriptionService.getDriverSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setSettings(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      let result;
      if (settings) {
         result = await subscriptionService.updateDriverSettings(newSettings);
      } else {
        
        result = await subscriptionService.createDriverSettings(newSettings);
      }

      if (result) {
        setSettings(result);
        return { success: true };
      }
      return { success: false, message: 'Erro ao salvar configurações' };
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    isLoading,
    updateSettings,
    refreshSettings: loadSettings
  };
};