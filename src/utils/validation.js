// Funções de validação

/**
 * Valida se um campo não está vazio
 * @param {string} value - Valor a ser validado
 * @returns {boolean} true se não estiver vazio
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return false;
};

/**
 * Valida tamanho mínimo de string
 * @param {string} value - Valor a ser validado
 * @param {number} min - Tamanho mínimo
 * @returns {boolean} true se atender ao mínimo
 */
export const minLength = (value, min) => {
  if (typeof value !== 'string') return false;
  return value.length >= min;
};

/**
 * Valida tamanho máximo de string
 * @param {string} value - Valor a ser validado
 * @param {number} max - Tamanho máximo
 * @returns {boolean} true se não ultrapassar o máximo
 */
export const maxLength = (value, max) => {
  if (typeof value !== 'string') return false;
  return value.length <= max;
};

/**
 * Valida se é um número
 * @param {any} value - Valor a ser validado
 * @returns {boolean} true se for número
 */
export const isNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Valida se é um número inteiro
 * @param {any} value - Valor a ser validado
 * @returns {boolean} true se for inteiro
 */
export const isInteger = (value) => {
  return Number.isInteger(Number(value));
};

/**
 * Valida se valor está dentro de um range
 * @param {number} value - Valor a ser validado
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} true se estiver no range
 */
export const isInRange = (value, min, max) => {
  const num = Number(value);
  return num >= min && num <= max;
};

/**
 * Valida se é um CPF válido
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} true se for válido
 */
export const isValidCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
};

/**
 * Valida se é um telefone válido
 * @param {string} phone - Telefone a ser validado
 * @returns {boolean} true se for válido
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/[^\d]/g, ''));
};

/**
 * Valida se é uma data válida
 * @param {string} date - Data a ser validada
 * @param {string} format - Formato esperado
 * @returns {boolean} true se for válida
 */
export const isValidDate = (date, format = 'DD/MM/YYYY') => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

/**
 * Valida se é um CEP válido
 * @param {string} cep - CEP a ser validado
 * @returns {boolean} true se for válido
 */
export const isValidCEP = (cep) => {
  const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
  return cepRegex.test(cep.replace(/[^\d]/g, ''));
};

/**
 * Valida objeto de corrida
 * @param {Object} ride - Corrida a ser validada
 * @returns {Object} Resultado da validação
 */
export const validateRide = (ride) => {
  const errors = {};
  
  if (!isRequired(ride.platform)) {
    errors.platform = 'Plataforma é obrigatória';
  }
  
  if (!isRequired(ride.value) || !isNumber(ride.value)) {
    errors.value = 'Valor inválido';
  } else if (!isInRange(ride.value, 3, 1000)) {
    errors.value = 'Valor deve estar entre R$ 3 e R$ 1000';
  }
  
  if (!isRequired(ride.distance) || !isNumber(ride.distance)) {
    errors.distance = 'Distância inválida';
  } else if (!isInRange(ride.distance, 0.5, 200)) {
    errors.distance = 'Distância deve estar entre 0.5km e 200km';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};