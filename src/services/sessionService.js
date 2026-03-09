import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../utils/constants';
import { STORAGE_KEYS } from '../utils/storage';

const TIMER_KEY = 'jornada_start_time';
const SESSIONS_CACHE_KEY = 'sessions_cache';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const timerService = {
  // Salva o startTime localmente para persistir em background
  startTimer: async () => {
    const startTime = Date.now();
    await AsyncStorage.setItem(TIMER_KEY, String(startTime));
    return startTime;
  },

  getStartTime: async () => {
    const val = await AsyncStorage.getItem(TIMER_KEY);
    return val ? parseInt(val) : null;
  },

  stopTimer: async () => {
    await AsyncStorage.removeItem(TIMER_KEY);
  },

  getElapsedSeconds: async () => {
    const startTime = await timerService.getStartTime();
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  },
};

export const sessionService = {
  // Salva sessão no backend + cache local
  saveSession: async ({ durationSeconds, earnings, ridesCount, date }) => {
    try {
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      const response = await fetch(`${BACKEND_URL}/api/sessions`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          driver_id: parseInt(driverId),
          duration_seconds: durationSeconds,
          earnings,
          rides_count: ridesCount,
          date: date || new Date().toISOString().split('T')[0],
        })
      });
      const result = await response.json();

      // Salva no cache local também
      await sessionService.cacheSession({
        id: result.id || Date.now(),
        driver_id: parseInt(driverId),
        duration_seconds: durationSeconds,
        earnings,
        rides_count: ridesCount,
        date: date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      });

      return { success: true, data: result };
    } catch (error) {
      // Se falhar no backend, salva só local
      console.error('Erro ao salvar sessão no backend:', error);
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      await sessionService.cacheSession({
        id: Date.now(),
        driver_id: parseInt(driverId),
        duration_seconds: durationSeconds,
        earnings,
        rides_count: ridesCount,
        date: date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        pending_sync: true,
      });
      return { success: false, cached: true };
    }
  },

  // Busca sessões do backend com fallback pro cache
  getSessions: async (days = 30) => {
    try {
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      const response = await fetch(`${BACKEND_URL}/api/sessions/${driverId}?days=${days}`, {
        headers: await getAuthHeaders()
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        // Atualiza cache
        await AsyncStorage.setItem(SESSIONS_CACHE_KEY, JSON.stringify(data));
        return data;
      }
      return await sessionService.getCachedSessions();
    } catch (error) {
      return await sessionService.getCachedSessions();
    }
  },

  cacheSession: async (session) => {
    const cached = await sessionService.getCachedSessions();
    const updated = [session, ...cached.filter(s => s.id !== session.id)];
    await AsyncStorage.setItem(SESSIONS_CACHE_KEY, JSON.stringify(updated));
  },

  getCachedSessions: async () => {
    try {
      const data = await AsyncStorage.getItem(SESSIONS_CACHE_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  // Calcula resumo semanal
  getWeeklySummary: (sessions) => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekSessions = sessions.filter(s => new Date(s.date) >= weekAgo);

    const totalSeconds = weekSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
    const totalEarnings = weekSessions.reduce((acc, s) => acc + (s.earnings || 0), 0);
    const totalRides = weekSessions.reduce((acc, s) => acc + (s.rides_count || 0), 0);
    const daysWorked = weekSessions.length;

    return {
      sessions: weekSessions,
      totalSeconds,
      totalHours: totalSeconds / 3600,
      totalEarnings,
      totalRides,
      daysWorked,
      avgEarningsPerDay: daysWorked > 0 ? totalEarnings / daysWorked : 0,
      avgEarningsPerHour: totalSeconds > 0 ? totalEarnings / (totalSeconds / 3600) : 0,
      avgRidesPerDay: daysWorked > 0 ? totalRides / daysWorked : 0,
    };
  },
};