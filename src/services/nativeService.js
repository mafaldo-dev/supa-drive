import { NativeModules, NativeEventEmitter } from 'react-native';

const { SupaDriverModule, NotificationListenerModule } = NativeModules;

if (!SupaDriverModule) {
  console.warn('SupaDriverModule não disponível — usando fallback JS');
}

// Event emitter para notificações
const supaEmitter = SupaDriverModule ? new NativeEventEmitter(SupaDriverModule) : null;
const notificationEmitter = NotificationListenerModule ? new NativeEventEmitter(NotificationListenerModule) : null;

export const nativeService = {

  // ========== BACKGROUND SERVICE ==========
  startBackground: async () => {
    if (!SupaDriverModule) return false;
    try { return await SupaDriverModule.startForegroundService(); }
    catch (e) { console.log('startBackground error:', e); return false; }
  },

  stopBackground: async () => {
    if (!SupaDriverModule) return false;
    try { return await SupaDriverModule.stopForegroundService(); }
    catch (e) { console.log('stopBackground error:', e); return false; }
  },

  // ========== ACCESSIBILITY ==========
  isAccessibilityEnabled: async () => {
    if (!SupaDriverModule) return false;
    try { return await SupaDriverModule.isAccessibilityEnabled(); }
    catch (e) { return false; }
  },

  openAccessibilitySettings: async () => {
    if (!SupaDriverModule) return;
    try { await SupaDriverModule.openAccessibilitySettings(); }
    catch (e) { console.log('openAccessibilitySettings error:', e); }
  },

  // ========== SPEECH (TTS) ==========
  speakJourneyEnd: async ({ durationSeconds, earnings, ridesCount }) => {
    if (!SupaDriverModule) return;
    try { await SupaDriverModule.speakJourneyEnd(durationSeconds, earnings, ridesCount); }
    catch (e) { console.log('speakJourneyEnd error:', e); }
  },

  speak: async (text) => {
    if (!SupaDriverModule) return;
    try { await SupaDriverModule.speak(text); }
    catch (e) { console.log('speak error:', e); }
  },

  stopSpeech: async () => {
    if (!SupaDriverModule) return;
    try { await SupaDriverModule.stopSpeech(); }
    catch (e) { console.log('stopSpeech error:', e); }
  },

  // ========== NOTIFICAÇÕES PUSH ==========
  sendJourneyEndPush: async ({ durationSeconds, earnings, ridesCount }) => {
    if (!SupaDriverModule) return;
    try { await SupaDriverModule.sendJourneyEndPush(durationSeconds, earnings, ridesCount); }
    catch (e) { console.log('sendJourneyEndPush error:', e); }
  },

  sendFourHourAlert: async () => {
    if (!SupaDriverModule) return;
    try { await SupaDriverModule.sendFourHourAlert(); }
    catch (e) { console.log('sendFourHourAlert error:', e); }
  },

  cancelAllNotifications: async () => {
    if (!SupaDriverModule) return;
    try { await SupaDriverModule.cancelAllNotifications(); }
    catch (e) { console.log('cancelAllNotifications error:', e); }
  },

  sendLocalNotification: async (title, body) => {
    if (!SupaDriverModule) return false;
    try { return await SupaDriverModule.sendLocalNotification(title, body); }
    catch (e) { console.log('sendLocalNotification error:', e); return false; }
  },

  sendRideAnalysis: async (price, distance, pricePerKm, timeMin, rating, signal) => {
    if (!SupaDriverModule) return;
    try {
      const title = signal === 'green' ? '🚗 Corrida Boa!' : signal === 'yellow' ? '🚕 Corrida Razoável' : '🚫 Corrida Ruim';
      const body = signal === 'green'
        ? `R$ ${price.toFixed(2)} por ${distance.toFixed(1)}km (R$ ${pricePerKm.toFixed(2)}/km) - Aceite!`
        : signal === 'yellow'
        ? `R$ ${price.toFixed(2)} por ${distance.toFixed(1)}km - Avalie antes de aceitar`
        : `R$ ${price.toFixed(2)} por ${distance.toFixed(1)}km - Recuse!`;
      await SupaDriverModule.sendLocalNotification(title, body);
    } catch (e) { console.log('sendRideAnalysis error:', e); }
  },

  // ========== NOTIFICATION LISTENER (Leitura de notificações de outros apps) ==========
  startNotificationListener: () => {
    if (NotificationListenerModule) {
      NotificationListenerModule.startListening();
    }
  },

  stopNotificationListener: () => {
    if (NotificationListenerModule) {
      NotificationListenerModule.stopListening();
    }
  },

  checkNotificationPermission: async () => {
    if (!NotificationListenerModule) return false;
    try { return await NotificationListenerModule.checkPermission(); }
    catch (e) { return false; }
  },

  requestNotificationPermission: () => {
    if (NotificationListenerModule) {
      NotificationListenerModule.requestPermission();
    }
  },

  openAppSettings: () => {
    if (NotificationListenerModule) {
      NotificationListenerModule.openAppSettings();
    }
  },

  // ========== EVENTOS DE CORRIDA (via notificações) ==========
  onRideDetected: (callback) => {
    if (!notificationEmitter) {
      console.warn('NotificationListenerModule não disponível');
      return { remove: () => {} };
    }
    
    const subscription = notificationEmitter.addListener('newRide', async (notificationData) => {
      try {
        // Converte os dados da notificação para o formato esperado pelo SemaforoScreen
        const rideData = {
          app: notificationData.app,
          packageName: notificationData.packageName,
          price: parseFloat(notificationData.price?.replace(',', '.')) || 0,
          distance_km: parseFloat(notificationData.distance?.replace(',', '.')) || 0,
          price_per_km: 0,
          time_min: 0,
          rating: 0,
          destination: notificationData.destination || '',
          timestamp: notificationData.timestamp,
          rawText: notificationData.text || ''
        };
        
        // Calcula preço por km se tiver distância
        if (rideData.price > 0 && rideData.distance_km > 0) {
          rideData.price_per_km = rideData.price / rideData.distance_km;
        }
        
        // Tenta extrair tempo da notificação (se disponível)
        const timeMatch = rideData.rawText.match(/(\d+)\s*min/i);
        if (timeMatch) {
          rideData.time_min = parseInt(timeMatch[1], 10);
        }
        
        // Tenta extrair avaliação da notificação (se disponível)
        const ratingMatch = rideData.rawText.match(/avaliação\s*(\d+[,.]\d+)/i);
        if (ratingMatch) {
          rideData.rating = parseFloat(ratingMatch[1].replace(',', '.'));
        }
        
        callback(rideData);
      } catch (e) {
        console.log('Erro ao processar notificação:', e);
      }
    });
    
    return {
      remove: () => subscription.remove()
    };
  },

  onNotificationRemoved: (callback) => {
    if (!notificationEmitter) return { remove: () => {} };
    const subscription = notificationEmitter.addListener('notificationRemoved', callback);
    return { remove: () => subscription.remove() };
  },

  // ========== FLOATING WINDOW ==========
  checkOverlayPermission: async () => {
    if (!SupaDriverModule) return false;
    try { return await SupaDriverModule.checkOverlayPermission(); }
    catch { return false; }
  },

  requestOverlayPermission: async () => {
    if (!SupaDriverModule) return;
    try { await SupaDriverModule.requestOverlayPermission(); }
    catch (e) { console.log('requestOverlayPermission error:', e); }
  },

  startFloating: async () => {
    if (!SupaDriverModule) return;
    try { await SupaDriverModule.startFloatingWidget(); }
    catch (e) { console.log('startFloating error:', e); }
  },

  stopFloating: async () => {
    if (!SupaDriverModule) return;
    try { await SupaDriverModule.stopFloatingWidget(); }
    catch (e) { console.log('stopFloating error:', e); }
  },

  updateFloatingTime: async (time) => {
    if (!SupaDriverModule) return;
    try { await SupaDriverModule.updateFloatingTime(time); }
    catch (e) { console.log('updateFloatingTime error:', e); }
  },

  startFloatingAppIcon: async () => {
    if (!SupaDriverModule) return;
    try { await SupaDriverModule.startFloatingAppIcon(); }
    catch (e) { console.log(e); }
  },

  // ========== UTILITÁRIOS ==========
  getAppNames: () => {
    if (!NotificationListenerModule) return {};
    return NotificationListenerModule.TARGET_APPS || {};
  },
};

export default nativeService;