// Funções utilitárias gerais

/**
 * Formata um valor para moeda brasileira (BRL)
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado (ex: R$ 1.234,56)
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata uma data para o padrão brasileiro
 * @param {Date|string} date - Data a ser formatada
 * @param {boolean} includeTime - Incluir hora na formatação
 * @returns {string} Data formatada (ex: 15/03/2025 14:30)
 */
export const formatDate = (date, includeTime = false) => {
  const d = new Date(date);
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' })
  };
  return d.toLocaleDateString('pt-BR', options);
};

/**
 * Trunca um texto com limite de caracteres
 * @param {string} text - Texto original
 * @param {number} limit - Limite máximo de caracteres
 * @returns {string} Texto truncado com "..."
 */
export const truncateText = (text, limit = 30) => {
  if (text.length <= limit) return text;
  return text.substring(0, limit) + '...';
};

/**
 * Gera uma cor baseada em uma string (para avatares)
 * @param {string} str - String de entrada
 * @returns {string} Código da cor em hexadecimal
 */
export const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

/**
 * Valida se um email é válido
 * @param {string} email - Email a ser validado
 * @returns {boolean} true se for válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Calcula a distância entre dois pontos geográficos (fórmula de Haversine)
 * @param {number} lat1 - Latitude do ponto 1
 * @param {number} lon1 - Longitude do ponto 1
 * @param {number} lat2 - Latitude do ponto 2
 * @param {number} lon2 - Longitude do ponto 2
 * @returns {number} Distância em quilômetros
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Retorna a cor do semáforo baseado no valor por km
 * @param {number} valuePerKm - Valor por quilômetro
 * @returns {string} Cor do semáforo ('green', 'yellow', 'red')
 */
export const getTrafficLightColor = (valuePerKm) => {
  if (valuePerKm > 3.5) return 'green';
  if (valuePerKm > 2.0) return 'yellow';
  return 'red';
};

/**
 * Retorna o texto do semáforo baseado na cor
 * @param {string} color - Cor do semáforo
 * @returns {string} Texto descritivo
 */
export const getTrafficLightText = (color) => {
  const texts = {
    green: 'BOA CORRIDA!',
    yellow: 'AVALIAR',
    red: 'EVITAR'
  };
  return texts[color] || 'ANALISANDO';
};

/**
 * Gera um ID único
 * @returns {string} ID único
 */
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Debounce para evitar chamadas excessivas
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} Função com debounce
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle para limitar taxa de execução
 * @param {Function} func - Função a ser executada
 * @param {number} limit - Limite em ms
 * @returns {Function} Função com throttle
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};