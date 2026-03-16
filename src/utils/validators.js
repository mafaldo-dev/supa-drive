export const formatCardNumber = (text) => {
  const clean = text.replace(/\D/g, '').slice(0, 16);
  return clean.replace(/(.{4})/g, '$1 ').trim();
};

export const formatExpiry = (text) => {
  const clean = text.replace(/\D/g, '').slice(0, 4);
  if (clean.length >= 3) return clean.slice(0, 2) + '/' + clean.slice(2);
  return clean;
};

export const getCardBrand = () => {
  const num = cardNumber.replace(/\s/g, '');
  if (num.startsWith('4')) return 'VISA';
  if (/^5[1-5]/.test(num)) return 'MASTER';
  if (/^3[47]/.test(num)) return 'AMEX';
  return null;
};

export const validateFields = () => {
  const num = cardNumber.replace(/\s/g, '');
  if (num.length < 16) { Alert.alert('Atenção', 'Número do cartão inválido.'); return false; }
  if (!cardName.trim()) { Alert.alert('Atenção', 'Informe o nome no cartão.'); return false; }
  if (expiry.length < 5) { Alert.alert('Atenção', 'Data de validade inválida.'); return false; }
  if (cvv.length < 3) { Alert.alert('Atenção', 'CVV inválido.'); return false; }
  return true;
};

export const formatCurrency = (val) => {
  if (!val) return 'R$ 0,00';
  return `R$ ${parseFloat(val).toFixed(2).replace('.', ',')}`;
};

export const formatDuration = (seconds) => {
  if (!seconds) return '0min';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
};

export const formatDiscount = (type, value) => {
    if (type === 'percentage') return `${value}% OFF`;
    return `R$ ${value.toFixed(2).replace('.', ',')} OFF`;
  };

export   const getDaysLeft = (dateStr) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

export const formatHours = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const fmt = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
