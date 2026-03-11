import { NativeModules, NativeEventEmitter } from 'react-native';

const { SupaDriverModule } = NativeModules;

if (!SupaDriverModule) {
  console.warn('SupaDriverModule não disponível — usando fallback JS');
}

const emitter = SupaDriverModule ? new NativeEventEmitter(SupaDriverModule) : null;

export const nativeService = {

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
    catch (e) {}
  },

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
    catch (e) {}
  },

  onRideDetected: (callback) => {
    if (!emitter) return { remove: () => {} };
    return emitter.addListener('onRideDetected', callback);
  },
};

export default nativeService;
