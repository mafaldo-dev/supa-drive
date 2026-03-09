import AsyncStorage from '@react-native-async-storage/async-storage';

// Chaves de storage
export const STORAGE_KEYS = {
  JWT_TOKEN: 'jwt_token',
  DRIVER_ID: 'driver_id',
  USER_PLAN: 'userPlan',
  USERNAME: 'username',
  USER_EMAIL: 'user_email',
  USER_NAME: 'user_name',
  USER_FULL_NAME: 'user_full_name',
  USER_PHOTO: 'user_photo',
  RIDE_HISTORY: 'ride_history',
  APP_SETTINGS: 'app_settings',
  NOTIFICATIONS: 'notifications',
};

/**
 * Salva dados no storage
 * @param {string} key - Chave do storage
 * @param {any} value - Valor a ser salvo
 */
export const saveData = async (key, value) => {
  try {
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    return false;
  }
};

/**
 * Recupera dados do storage
 * @param {string} key - Chave do storage
 * @param {boolean} parse - Se deve fazer parse do JSON
 * @returns {any} Dados recuperados
 */
export const getData = async (key, parse = true) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    return parse ? JSON.parse(value) : value;
  } catch (error) {
    console.error('Erro ao recuperar dados:', error);
    return null;
  }
};

/**
 * Remove dados do storage
 * @param {string} key - Chave do storage
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Erro ao remover dados:', error);
    return false;
  }
};

/**
 * Remove múltiplos dados do storage
 * @param {Array} keys - Lista de chaves
 */
export const removeMultipleData = async (keys) => {
  try {
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('Erro ao remover múltiplos dados:', error);
    return false;
  }
};

/**
 * Recupera múltiplos dados do storage
 * @param {Array} keys - Lista de chaves
 * @returns {Object} Objeto com os dados
 */
export const getMultipleData = async (keys) => {
  try {
    const values = await AsyncStorage.multiGet(keys);
    return values.reduce((acc, [key, value]) => {
      try {
        acc[key] = value ? JSON.parse(value) : null;
      } catch {
        acc[key] = value;
      }
      return acc;
    }, {});
  } catch (error) {
    console.error('Erro ao recuperar múltiplos dados:', error);
    return {};
  }
};

/**
 * Limpa todo o storage
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Erro ao limpar storage:', error);
    return false;
  }
};

/**
 * Salva histórico de corridas
 * @param {Array} rides - Lista de corridas
 */
export const saveRideHistory = async (rides) => {
  return saveData(STORAGE_KEYS.RIDE_HISTORY, rides);
};

/**
 * Recupera histórico de corridas
 * @returns {Array} Histórico de corridas
 */
export const getRideHistory = async () => {
  return getData(STORAGE_KEYS.RIDE_HISTORY) || [];
};

/**
 * Adiciona uma corrida ao histórico
 * @param {Object} ride - Corrida a adicionar
 */
export const addRideToHistory = async (ride) => {
  const history = await getRideHistory();
  history.unshift(ride); // Adiciona no início
  return saveRideHistory(history.slice(0, 100)); // Mantém apenas as 100 mais recentes
};

/**
 * Salva configurações do app
 * @param {Object} settings - Configurações
 */
export const saveAppSettings = async (settings) => {
  const currentSettings = await getAppSettings();
  return saveData(STORAGE_KEYS.APP_SETTINGS, { ...currentSettings, ...settings });
};

/**
 * Recupera configurações do app
 * @returns {Object} Configurações
 */
export const getAppSettings = async () => {
  const defaultSettings = {
    notifications: true,
    darkMode: false,
    offlineMode: false,
    autoTrafficLight: false,
    language: 'pt-BR',
  };
  
  const settings = await getData(STORAGE_KEYS.APP_SETTINGS);
  return { ...defaultSettings, ...settings };
};