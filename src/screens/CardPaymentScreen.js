import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { BACKEND_URL } from '../utils/constants';
import { STORAGE_KEYS } from '../utils/storage';
import { saveUserPlan } from '../services/authService';

const PRICE = 14.90;
const STRIPE_PUBLISHABLE_KEY = 'pk_live_SEU_TOKEN_AQUI'; // substitua pela sua pk_live_

const CardPaymentScreen = ({ onBack, onSuccess, setUserPlan }) => {
  const { isDark } = useTheme();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const C = {
    bg: isDark ? '#0d0d14' : '#f0f0f7',
    card: isDark ? '#1a1a2e' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    borderFocus: '#FF6B6B',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a2e',
    textSecondary: isDark ? '#8888aa' : '#888899',
    accent: '#FF6B6B',
    green: '#4ade80',
    input: isDark ? '#16213e' : '#ffffff',
    accentSoft: isDark ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.08)',
  };

  const formatCardNumber = (text) => {
    const clean = text.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (text) => {
    const clean = text.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) return clean.slice(0, 2) + '/' + clean.slice(2);
    return clean;
  };

  const getCardBrand = () => {
    const num = cardNumber.replace(/\s/g, '');
    if (num.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(num)) return 'mastercard';
    if (/^3[47]/.test(num)) return 'amex';
    return null;
  };

  const validateFields = () => {
    const num = cardNumber.replace(/\s/g, '');
    if (num.length < 16) { Alert.alert('Atenção', 'Número do cartão inválido.'); return false; }
    if (!cardName.trim()) { Alert.alert('Atenção', 'Informe o nome no cartão.'); return false; }
    if (expiry.length < 5) { Alert.alert('Atenção', 'Data de validade inválida.'); return false; }
    if (cvv.length < 3) { Alert.alert('Atenção', 'CVV inválido.'); return false; }
    return true;
  };

  const handlePay = async () => {
    if (!validateFields()) return;
    setLoading(true);
    try {
      // 1. Tokeniza o cartão direto no Stripe (sem passar dados pelo backend)
      const [expMonth, expYear] = expiry.split('/');
      const stripeRes = await fetch('https://api.stripe.com/v1/tokens', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: [
          `card[number]=${cardNumber.replace(/\s/g, '')}`,
          `card[exp_month]=${expMonth}`,
          `card[exp_year]=20${expYear}`,
          `card[cvc]=${cvv}`,
          `card[name]=${encodeURIComponent(cardName)}`,
        ].join('&'),
      });

      const stripeData = await stripeRes.json();
      if (stripeData.error) throw new Error(stripeData.error.message);

      const token = stripeData.id; // ex: tok_visa

      // 2. Envia o token pro backend que cria a cobrança
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      const res = await fetch(`${BACKEND_URL}/api/payments/card/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id: parseInt(driverId),
          stripe_token: token,
          amount: PRICE,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao processar pagamento');

      if (data.premium_activated) {
        await saveUserPlan('premium', setUserPlan);
        setPaid(true);
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (e) {
      Alert.alert('Erro no pagamento', e.message);
    } finally {
      setLoading(false);
    }
  };

  // Tela de sucesso
  if (paid) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: C.green + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
          <MaterialIcons name="check-circle" size={48} color={C.green} />
        </View>
        <Text style={{ fontSize: 24, fontWeight: '800', color: C.textPrimary, textAlign: 'center', marginBottom: 8 }}>
          Pagamento confirmado!
        </Text>
        <Text style={{ fontSize: 14, color: C.textSecondary, textAlign: 'center' }}>
          Seu plano Premium está ativo por 30 dias. 🎉
        </Text>
      </View>
    );
  }

  const brand = getCardBrand();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 }}>
        <MaterialIcons name="arrow-back" size={22} color={C.textPrimary} />
        <Text style={{ fontSize: 14, color: C.textPrimary, fontWeight: '600' }}>Voltar ao PIX</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 22, fontWeight: '800', color: C.textPrimary, marginBottom: 4 }}>
        Cartão de Crédito 💳
      </Text>
      <Text style={{ fontSize: 13, color: C.textSecondary, marginBottom: 24 }}>
        Pagamento seguro via Stripe
      </Text>

      {/* Valor */}
      <View style={{ backgroundColor: C.accentSoft, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: C.accent + '30' }}>
        <Text style={{ fontSize: 13, color: C.textSecondary, marginBottom: 4 }}>Valor a cobrar</Text>
        <Text style={{ fontSize: 32, fontWeight: '800', color: C.accent }}>
          R$ {PRICE.toFixed(2).replace('.', ',')}
        </Text>
        <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 4 }}>Plano Premium — 30 dias</Text>
      </View>

      {/* Formulário */}
      <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border, gap: 16 }}>

        {/* Número do cartão */}
        <View>
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Número do cartão
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.input, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14 }}>
            <TextInput
              style={{ flex: 1, height: 48, fontSize: 16, color: C.textPrimary, letterSpacing: 1 }}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor={C.textSecondary}
              value={cardNumber}
              onChangeText={t => setCardNumber(formatCardNumber(t))}
              keyboardType="numeric"
              maxLength={19}
            />
            {brand && (
              <Text style={{ fontSize: 11, fontWeight: '800', color: C.accent }}>
                {brand.toUpperCase()}
              </Text>
            )}
          </View>
        </View>

        {/* Nome */}
        <View>
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Nome no cartão
          </Text>
          <TextInput
            style={{ backgroundColor: C.input, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, height: 48, fontSize: 15, color: C.textPrimary }}
            placeholder="Como está no cartão"
            placeholderTextColor={C.textSecondary}
            value={cardName}
            onChangeText={setCardName}
            autoCapitalize="characters"
          />
        </View>

        {/* Validade + CVV */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Validade
            </Text>
            <TextInput
              style={{ backgroundColor: C.input, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, height: 48, fontSize: 15, color: C.textPrimary }}
              placeholder="MM/AA"
              placeholderTextColor={C.textSecondary}
              value={expiry}
              onChangeText={t => setExpiry(formatExpiry(t))}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              CVV
            </Text>
            <TextInput
              style={{ backgroundColor: C.input, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, height: 48, fontSize: 15, color: C.textPrimary }}
              placeholder="123"
              placeholderTextColor={C.textSecondary}
              value={cvv}
              onChangeText={t => setCvv(t.replace(/\D/g, '').slice(0, 4))}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />
          </View>
        </View>
      </View>

      {/* Segurança */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, marginBottom: 24 }}>
        <MaterialIcons name="lock" size={14} color={C.textSecondary} />
        <Text style={{ fontSize: 12, color: C.textSecondary }}>
          Pagamento seguro — seus dados não são armazenados
        </Text>
      </View>

      {/* Botão pagar */}
      <TouchableOpacity
        onPress={handlePay}
        disabled={loading}
        style={{
          backgroundColor: loading ? C.accent + '80' : C.accent,
          borderRadius: 16, padding: 18,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}
      >
        {loading ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Processando...</Text>
          </>
        ) : (
          <>
            <MaterialIcons name="lock" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
              Pagar R$ {PRICE.toFixed(2).replace('.', ',')}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CardPaymentScreen;