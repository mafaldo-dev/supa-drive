import * as Notifications from 'expo-notifications';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = '@motoristapro:notifications_enabled';

// Configura como as notificações aparecem quando o app está em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── usado pelo ConfiguracoesScreen ───────────────────────────────────────────
export const requestNotificationPermissions = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch { return false; }
};

export const getNotificationStatus = async () => {
  try {
    const saved = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    return saved ? JSON.parse(saved) : false;
  } catch { return false; }
};

export const setNotificationStatus = async (enabled) => {
  try {
    if (enabled) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(true));
        return true;
      }
      return false;
    } else {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(false));
      return true;
    }
  } catch { return false; }
};

// ─── usado pelo JornadaScreen ─────────────────────────────────────────────────
export const notificationService = {

  requestPermissions: async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch { return false; }
  },

  // Alerta automático após 4h dirigindo
  scheduleFourHourAlert: async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🛑 Hora de uma pausa!',
          body: 'Você está dirigindo há 4 horas. Sua segurança é prioridade — pare e descanse.',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: { seconds: 4 * 60 * 60 },
      });
    } catch (e) { console.log('scheduleFourHourAlert error:', e); }
  },

  cancelFourHourAlert: async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) { console.log('cancelFourHourAlert error:', e); }
  },

  // Push de encerramento da jornada — trigger 1s funciona melhor no Android
  sendEndOfDayPush: async ({ durationSeconds, earnings, ridesCount }) => {
    try {
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.floor((durationSeconds % 3600) / 60);
      const timeStr = hours > 0 ? `${hours}h ${minutes}min` : `${minutes} minutos`;
      const earningsStr = Number(earnings).toLocaleString('pt-BR', {
        style: 'currency', currency: 'BRL',
      });
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏁 Jornada encerrada!',
          body: `Você dirigiu ${timeStr}, fez ${ridesCount} corridas e ganhou ${earningsStr}. Bom trabalho! 💪`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: { seconds: 1 },
      });
      console.log('End of day push scheduled', Notifications.scheduleNotificationAsync);
    } catch (e) { console.log('sendEndOfDayPush error:', e); }
  },

  // Voz de encerramento — premium
  speakEndOfDay: ({ durationSeconds, earnings, ridesCount }) => {
    try {
      const hours = Math.floor(durationSeconds / 3600);
      const minutes = Math.floor((durationSeconds % 3600) / 60);
      const timeStr = hours > 0
        ? `${hours} horas e ${minutes} minutos`
        : `${minutes} minutos`;
      const earningsStr = Number(earnings).toLocaleString('pt-BR', {
        style: 'currency', currency: 'BRL',
      });
      const message = `Jornada encerrada! Você dirigiu ${timeStr}, realizou ${ridesCount} corridas e ganhou ${earningsStr} hoje. Excelente trabalho, descanse bem!`;
      Speech.speak(message, { language: 'pt-BR', pitch: 1.0, rate: 0.95 });
    } catch (e) { console.log('speakEndOfDay error:', e); }
  },

  stopSpeech: () => {
    try { Speech.stop(); } catch {}
  },
};