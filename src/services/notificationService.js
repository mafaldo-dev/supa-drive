import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = '@motoristapro:notifications_enabled';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermissions = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificações:', error);
    return false;
  }
};

export const getNotificationStatus = async () => {
  try {
    const saved = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    return saved ? JSON.parse(saved) : false;
  } catch (error) {
    console.error('Erro ao obter status de notificações:', error);
    return false;
  }
};

export const setNotificationStatus = async (enabled) => {
  try {
    if (enabled) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(true));
        scheduleWelcomeNotification();
        return true;
      } else {
        return false;
      }
    } else {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(false));
      return true;
    }
  } catch (error) {
    console.error('Erro ao definir status de notificações:', error);
    return false;
  }
};

export const scheduleWelcomeNotification = async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Notificações Ativadas! 🔔',
        body: 'Você agora receberá atualizações e ofertas especiais.',
        data: { deepLink: 'home' },
      },
      trigger: { seconds: 2 },
    });
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
  }
};

export const sendNotificationToDriver = async (title, body, data = {}) => {
  try {
    const enabled = await getNotificationStatus();
    if (enabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // Imediato
      });
    }
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
};

export const sendPromoNotification = async () => {
  try {
    const enabled = await getNotificationStatus();
    if (enabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Promoção Disponível! 🎉',
          body: 'Confira a promoção especial para motoristas.',
          data: { deepLink: 'promocoes' },
        },
        trigger: { seconds: 5 },
      });
    }
  } catch (error) {
    console.error('Erro ao enviar notificação de promoção:', error);
  }
};

export const sendReminderNotification = async () => {
  try {
    const enabled = await getNotificationStatus();
    if (enabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Você tem preferências definidas! 📊',
          body: 'Verifique suas metas e ganhos esperados.',
          data: { deepLink: 'preferencias' },
        },
        trigger: { seconds: 10 },
      });
    }
  } catch (error) {
    console.error('Erro ao enviar notificação de lembrete:', error);
  }
};
