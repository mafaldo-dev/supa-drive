import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert, RefreshControl, Clipboard
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { BACKEND_URL } from '../utils/constants';
import { STORAGE_KEYS } from '../utils/storage';
import { formatDiscount, getDaysLeft } from '../utils/validators';


const PromocoesScreen = () => {
  const { isDark } = useTheme();
  const [promos, setPromos] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const C = {
    bg: isDark ? '#0d0d14' : '#f0f0f7',
    card: isDark ? '#1a1a2e' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a2e',
    textSecondary: isDark ? '#8888aa' : '#888899',
    accent: '#FF6B6B',
    green: '#4ade80',
    yellow: '#facc15',
    input: isDark ? '#16213e' : '#f8f8ff',
    accentSoft: isDark ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.08)',
    greenSoft: isDark ? 'rgba(74,222,128,0.12)' : 'rgba(74,222,128,0.1)',
    yellowSoft: isDark ? 'rgba(250,204,21,0.12)' : 'rgba(250,204,21,0.08)',
  };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);

      const [promosRes, couponsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/promotions/active`),
        fetch(`${BACKEND_URL}/api/promotions/coupons/driver/${driverId}`),
      ]);

      if (promosRes.ok) setPromos(await promosRes.json());
      if (couponsRes.ok) setCoupons(await couponsRes.json());
    } catch (e) {
      console.warn('Erro ao carregar promoções:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Atenção', 'Digite um código de cupom.');
      return;
    }
    setApplying(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/promotions/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.toUpperCase(), plan_id: 1 }),
      });
      const data = await res.json();
      if (data.valid) {
        const discount = data.discount_amount > 0
          ? `Desconto de R$ ${data.discount_amount.toFixed(2).replace('.', ',')}!`
          : 'Desconto aplicado!';
        Alert.alert('✅ Cupom válido!', `${discount}\nPreço final: R$ ${data.final_price?.toFixed(2).replace('.', ',')}`);
        setCouponCode('');
        loadData();
      } else {
        Alert.alert('❌ Cupom inválido', data.message || 'Este cupom não é válido ou já expirou.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível aplicar o cupom. Tente novamente.');
    } finally {
      setApplying(false);
    }
  };

  const copyCode = (code) => {
    Clipboard.setString(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
    >
      {/* Header */}
      <Text style={{ fontSize: 22, fontWeight: '800', color: C.textPrimary, marginBottom: 4 }}>
        Promoções 🎁
      </Text>
      <Text style={{ fontSize: 13, color: C.textSecondary, marginBottom: 24 }}>
        Ofertas exclusivas e cupons de desconto
      </Text>

      {/* Campo de cupom */}
      <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.border }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 4 }}>
          🎟️ Tem um cupom?
        </Text>
        <Text style={{ fontSize: 12, color: C.textSecondary, marginBottom: 14 }}>
          Digite o código e aplique o desconto na sua assinatura
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            style={{
              flex: 1, backgroundColor: C.input, borderRadius: 12,
              borderWidth: 1, borderColor: C.border,
              paddingHorizontal: 14, height: 48, fontSize: 15,
              color: C.textPrimary, letterSpacing: 2, fontWeight: '700',
            }}
            placeholder="EX: PROMO20"
            placeholderTextColor={C.textSecondary}
            value={couponCode}
            onChangeText={t => setCouponCode(t.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={handleApplyCoupon}
            disabled={applying}
            style={{
              backgroundColor: C.accent, borderRadius: 12,
              paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center',
            }}
          >
            {applying
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Aplicar</Text>
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* Promoções ativas */}
      {promos.length > 0 && (
        <>
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary, marginBottom: 12 }}>
            🔥 Promoções ativas
          </Text>
          {promos.map((promo) => {
            const days = getDaysLeft(promo.valid_until);
            const isUrgent = days !== null && days <= 3;
            return (
              <View key={promo.id} style={{
                backgroundColor: C.accentSoft, borderRadius: 16, padding: 16,
                marginBottom: 12, borderWidth: 1, borderColor: C.accent + '30',
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: C.textPrimary }}>
                      {promo.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>
                      {promo.description}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: C.accent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, marginLeft: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#fff' }}>
                      {formatDiscount(promo.discount_type, promo.discount_value)}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <MaterialIcons
                    name="timer"
                    size={13}
                    color={isUrgent ? C.accent : C.textSecondary}
                  />
                  <Text style={{ fontSize: 12, color: isUrgent ? C.accent : C.textSecondary, fontWeight: isUrgent ? '700' : '400' }}>
                    {days === 0
                      ? 'Expira hoje!'
                      : days === 1
                      ? 'Expira amanhã!'
                      : `Válido até ${formatDate(promo.valid_until)}`
                    }
                  </Text>
                  {promo.max_uses && (
                    <Text style={{ fontSize: 12, color: C.textSecondary, marginLeft: 8 }}>
                      • {promo.max_uses - promo.used_count} restantes
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </>
      )}

      {/* Cupons disponíveis */}
      {coupons.length > 0 && (
        <>
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary, marginTop: promos.length > 0 ? 8 : 0, marginBottom: 12 }}>
            🏷️ Seus cupons
          </Text>
          {coupons.map((coupon, i) => {
            const days = getDaysLeft(coupon.end_date);
            const copied = copiedCode === coupon.code;
            return (
              <View key={i} style={{
                backgroundColor: C.greenSoft, borderRadius: 16, padding: 16,
                marginBottom: 12, borderWidth: 1, borderColor: C.green + '30',
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: C.textSecondary, marginBottom: 4 }}>
                      {coupon.description || 'Desconto especial'}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: C.green, letterSpacing: 2 }}>
                      {coupon.code}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: C.green + '20', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: C.green }}>
                      {coupon.discount_type && coupon.discount_value
                        ? formatDiscount(coupon.discount_type, coupon.discount_value)
                        : 'DESCONTO'
                      }
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  {coupon.end_date ? (
                    <Text style={{ fontSize: 12, color: C.textSecondary }}>
                      Válido até {formatDate(coupon.end_date)}
                      {days !== null && days <= 3 && (
                        <Text style={{ color: C.accent }}> • {days === 0 ? 'Expira hoje!' : `${days}d restantes`}</Text>
                      )}
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 12, color: C.textSecondary }}>Sem prazo de expiração</Text>
                  )}

                  <TouchableOpacity
                    onPress={() => copyCode(coupon.code)}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 4,
                      backgroundColor: copied ? C.green + '20' : C.card,
                      borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
                      borderWidth: 1, borderColor: copied ? C.green + '40' : C.border,
                    }}
                  >
                    <MaterialIcons
                      name={copied ? 'check' : 'content-copy'}
                      size={14}
                      color={copied ? C.green : C.textSecondary}
                    />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: copied ? C.green : C.textSecondary }}>
                      {copied ? 'Copiado!' : 'Copiar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </>
      )}

      {/* Estado vazio */}
      {promos.length === 0 && coupons.length === 0 && (
        <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: C.border }}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>🎁</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.textPrimary, marginBottom: 8 }}>
            Nenhuma promoção no momento
          </Text>
          <Text style={{ fontSize: 13, color: C.textSecondary, textAlign: 'center' }}>
            Fique ligado! Em breve teremos ofertas exclusivas para você. Puxe para baixo para atualizar.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default PromocoesScreen;