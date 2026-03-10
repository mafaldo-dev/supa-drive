import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  ScrollView, Alert, Clipboard, Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { BACKEND_URL } from '../utils/constants';
import { STORAGE_KEYS } from '../utils/storage';
import { saveUserPlan } from '../services/authService';
import CardPaymentScreen from './CardPaymentScreen';

const PRICE = 14.90;
const EXPIRY_SECONDS = 1800;
const POLL_INTERVAL = 5000;

const PixPaymentScreen = ({ onBack, onSuccess, setUserPlan }) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [pixData, setPixData] = useState(null);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(EXPIRY_SECONDS);
  const [checking, setChecking] = useState(false);
  const [paid, setPaid] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const pollRef = useRef(null);
  const timerRef = useRef(null);

  const C = {
    bg: isDark ? '#0d0d14' : '#f0f0f7',
    card: isDark ? '#1a1a2e' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a2e',
    textSecondary: isDark ? '#8888aa' : '#888899',
    accent: '#FF6B6B',
    green: '#4ade80',
    accentSoft: isDark ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.08)',
  };

  useEffect(() => {
    generatePix();
    return () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  // Se abriu tela de cartão, pausa o polling do PIX
  useEffect(() => {
    if (showCard) {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
    }
  }, [showCard]);

  const generatePix = async () => {
    try {
      setLoading(true);
      setError(null);
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      const email = await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL) || 'pagador@supadriver.com.br';

      const res = await fetch(`${BACKEND_URL}/api/payments/pix/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: parseInt(driverId), payer_email: email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao gerar PIX');

      setPixData(data);
      setTimeLeft(EXPIRY_SECONDS);
      startPolling(data.payment_id, driverId);
      startTimer();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          clearInterval(pollRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startPolling = (paymentId, driverId) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        setChecking(true);
        const res = await fetch(`${BACKEND_URL}/api/payments/pix/status/${paymentId}/${driverId}`);
        const data = await res.json();
        if (data.status === 'approved' && data.premium_activated) {
          clearInterval(pollRef.current);
          clearInterval(timerRef.current);
          setPaid(true);
          await saveUserPlan('premium', setUserPlan);
          setTimeout(() => onSuccess(), 2000);
        }
      } catch (e) {
        console.log('Polling error:', e);
      } finally {
        setChecking(false);
      }
    }, POLL_INTERVAL);
  };

  const copyCode = () => {
    if (pixData?.qr_code) {
      Clipboard.setString(pixData.qr_code);
      Alert.alert('✅ Copiado!', 'Código PIX copiado. Cole no seu app de pagamento.');
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Tela de cartão
  if (showCard) {
    return (
      <CardPaymentScreen
        onBack={() => setShowCard(false)}
        onSuccess={onSuccess}
        setUserPlan={setUserPlan}
      />
    );
  }

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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 }}>
        <MaterialIcons name="arrow-back" size={22} color={C.textPrimary} />
        <Text style={{ fontSize: 14, color: C.textPrimary, fontWeight: '600' }}>Voltar</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 22, fontWeight: '800', color: C.textPrimary, marginBottom: 4 }}>
        Assinar Premium ⭐
      </Text>
      <Text style={{ fontSize: 13, color: C.textSecondary, marginBottom: 24 }}>
        Pague via PIX e ative na hora
      </Text>

      {loading ? (
        <View style={{ alignItems: 'center', paddingTop: 60 }}>
          <ActivityIndicator size="large" color={C.accent} />
          <Text style={{ color: C.textSecondary, marginTop: 16 }}>Gerando QR code PIX...</Text>
        </View>
      ) : error ? (
        <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: C.border }}>
          <MaterialIcons name="error-outline" size={40} color={C.accent} />
          <Text style={{ color: C.textPrimary, fontWeight: '700', marginTop: 12, marginBottom: 8 }}>Erro ao gerar PIX</Text>
          <Text style={{ color: C.textSecondary, textAlign: 'center', marginBottom: 20 }}>{error}</Text>
          <TouchableOpacity onPress={generatePix} style={{ backgroundColor: C.accent, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : timeLeft === 0 ? (
        <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: C.border }}>
          <MaterialIcons name="timer-off" size={40} color={C.accent} />
          <Text style={{ color: C.textPrimary, fontWeight: '700', marginTop: 12, marginBottom: 8 }}>PIX expirado</Text>
          <Text style={{ color: C.textSecondary, textAlign: 'center', marginBottom: 20 }}>O tempo de pagamento expirou. Gere um novo QR code.</Text>
          <TouchableOpacity onPress={generatePix} style={{ backgroundColor: C.accent, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Gerar novo PIX</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Valor */}
          <View style={{ backgroundColor: C.accentSoft, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: C.accent + '30' }}>
            <Text style={{ fontSize: 13, color: C.textSecondary, marginBottom: 4 }}>Valor a pagar</Text>
            <Text style={{ fontSize: 32, fontWeight: '800', color: C.accent }}>
              R$ {PRICE.toFixed(2).replace('.', ',')}
            </Text>
            <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 4 }}>Plano Premium — 30 dias</Text>
          </View>

          {/* Timer */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            <MaterialIcons name="timer" size={16} color={timeLeft < 300 ? C.accent : C.textSecondary} />
            <Text style={{ fontSize: 13, color: timeLeft < 300 ? C.accent : C.textSecondary, fontWeight: '600' }}>
              Expira em {formatTime(timeLeft)}
            </Text>
            {checking && <ActivityIndicator size="small" color={C.green} />}
            {checking && <Text style={{ fontSize: 11, color: C.green }}>Verificando pagamento...</Text>}
          </View>

          {/* QR Code */}
          <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: C.border, marginBottom: 16 }}>
            {pixData?.qr_code_base64 ? (
              <Image
                source={{ uri: `data:image/png;base64,${pixData.qr_code_base64}` }}
                style={{ width: 220, height: 220, borderRadius: 8 }}
                resizeMode="contain"
              />
            ) : (
              <View style={{ width: 220, height: 220, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg, borderRadius: 8 }}>
                <MaterialIcons name="qr-code-2" size={80} color={C.textSecondary} />
                <Text style={{ color: C.textSecondary, fontSize: 12, marginTop: 8 }}>QR não disponível</Text>
              </View>
            )}
            <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 16, textAlign: 'center' }}>
              Abra seu banco e escaneie o QR code
            </Text>
          </View>

          {/* Copiar código */}
          <TouchableOpacity
            onPress={copyCode}
            style={{
              backgroundColor: C.card, borderRadius: 16, padding: 16,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              gap: 10, borderWidth: 1, borderColor: C.border, marginBottom: 12,
            }}
          >
            <MaterialIcons name="content-copy" size={18} color={C.accent} />
            <Text style={{ color: C.accent, fontWeight: '700', fontSize: 14 }}>
              Copiar código PIX
            </Text>
          </TouchableOpacity>

          {/* Botão cartão */}
          <TouchableOpacity
            onPress={() => setShowCard(true)}
            style={{
              backgroundColor: C.card, borderRadius: 16, padding: 16,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              gap: 10, borderWidth: 1, borderColor: C.border, marginBottom: 20,
            }}
          >
            <MaterialIcons name="credit-card" size={18} color={C.textSecondary} />
            <Text style={{ color: C.textSecondary, fontWeight: '600', fontSize: 14 }}>
              Pagar com Cartão de Crédito
            </Text>
          </TouchableOpacity>

          {/* Instruções */}
          <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.textPrimary, marginBottom: 12 }}>
              Como pagar:
            </Text>
            {[
              'Abra o app do seu banco',
              'Escolha pagar com PIX',
              'Escaneie o QR code ou cole o código',
              'Confirme o pagamento de R$ 14,90',
              'Verifique os dados do RECEBEDOR Guilherme Ma***do de Ol****ra',
              'O Premium será ativado automaticamente!',
            ].map((step, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: C.accent }}>{i + 1}</Text>
                </View>
                <Text style={{ fontSize: 13, color: C.textSecondary, flex: 1 }}>{step}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default PixPaymentScreen;