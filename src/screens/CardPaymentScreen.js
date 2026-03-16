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

import { formatCardNumber, validateFields, formatExpiry, getCardBrand } from '../utils/validators'
import { PLANS } from '../utils/constants';

const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

const CardPaymentScreen = ({ planType = 'monthly', onBack, onSuccess, setUserPlan }) => {
  const { isDark } = useTheme();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const plan = PLANS[planType] || PLANS.monthly;

  const C = {
    bg: isDark ? '#0d0d14' : '#f0f0f7',
    card: isDark ? '#1a1a2e' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a2e',
    textSecondary: isDark ? '#8888aa' : '#888899',
    accent: '#FF6B6B',
    green: '#4ade80',
    input: isDark ? '#16213e' : '#ffffff',
    accentSoft: isDark ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.08)',
    greenSoft: isDark ? 'rgba(74,222,128,0.12)' : 'rgba(74,222,128,0.1)',
  };


  const handlePay = async () => {
    if (!validateFields()) return;
    setLoading(true);
    try {
      const [expMonth, expYear] = expiry.split('/');
      const stripeRes = await fetch('https://api.stripe.com/v1/tokens', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY}`,
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

      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      const res = await fetch(`${BACKEND_URL}/api/payments/card/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id: parseInt(driverId),
          stripe_token: stripeData.id,
          plan_type: planType,
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
          Seu plano Premium {plan.description} está ativo por {plan.label}. 🎉
        </Text>
      </View>
    );
  }

  const brand = getCardBrand();
  const isYearly = planType === 'yearly';
  const priceColor = isYearly ? C.green : C.accent;
  const priceSoft = isYearly ? C.greenSoft : C.accentSoft;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
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
      <View style={{
        backgroundColor: priceSoft, borderRadius: 16, padding: 16,
        alignItems: 'center', marginBottom: 24,
        borderWidth: 1, borderColor: priceColor + '30',
      }}>
        <Text style={{ fontSize: 13, color: C.textSecondary, marginBottom: 4 }}>
          Plano {plan.description} — {plan.label}
        </Text>
        <Text style={{ fontSize: 32, fontWeight: '800', color: priceColor }}>
          R$ {plan.price.toFixed(2).replace('.', ',')}
        </Text>
        {isYearly && (
          <View style={{ backgroundColor: C.green, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, marginTop: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#0d0d14' }}>ECONOMIZE 46%</Text>
          </View>
        )}
      </View>

      {/* Formulário */}
      <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border, gap: 16 }}>

        {/* Número */}
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
            {brand && <Text style={{ fontSize: 11, fontWeight: '800', color: priceColor }}>{brand}</Text>}
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

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, marginBottom: 24 }}>
        <MaterialIcons name="lock" size={14} color={C.textSecondary} />
        <Text style={{ fontSize: 12, color: C.textSecondary }}>
          Pagamento seguro — seus dados não são armazenados
        </Text>
      </View>

      <TouchableOpacity
        onPress={handlePay}
        disabled={loading}
        style={{
          backgroundColor: loading ? priceColor + '80' : priceColor,
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
              Pagar R$ {plan.price.toFixed(2).replace('.', ',')}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CardPaymentScreen;