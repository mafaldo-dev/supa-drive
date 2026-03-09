import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@motoristapro:preferencias';

// Valores padrão
export const DEFAULT_PREFERENCES = {
  // Preferências de ganhos
  ganhoPorMinuto: '1,86',
  ganhoPorHora: '43,00',
  ganhoPorKm: '2,33',
  rateMinimo: '4,84',
  
  // Metas
  metaDiaria: '',
  combustivelDiario: '',
  metaSemanal: '',
  
  // Informações do veículo
  modeloCarro: '',
  tipoCombustivel: '',
  metaMensal: '',
  gastosMensais: '',
  
  // Apps selecionados
  appsUsados: {
    uber: false,
    '99': false,
    indrive: false,
    lalamove: false,
  },
  
  // Categorias selecionadas
  categorias: {
    uberx: false,
    '99pop': false,
    comfort: false,
    black: false,
    entregas: false,
    taxi: false,
    flash: false,
    vip: false,
  },
};

export const loadPreferences = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Erro ao carregar preferências:', error);
    return DEFAULT_PREFERENCES;
  }
};

export const savePreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Erro ao salvar preferências:', error);
    return false;
  }
};