import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  Switch, Alert, Animated, Easing
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { BACKEND_URL } from '../utils/constants';
import { STORAGE_KEYS } from '../utils/storage';
import { nativeService } from '../services/nativeService';

const SemaforoScreen = () => {
  const { isDark } = useTheme();

  const [semaforoAtivo, setSemaforoAtivo] = useState(false);
  const [notifAtiva, setNotifAtiva] = useState(false);
  const [backgroundAtivo, setBackgroundAtivo] = useState(false);

  const [sinalAtual, setSinalAtual] = useState(null); 
  const [ultimaCorrida, setUltimaCorrida] = useState(null);
  const [preferencias, setPreferencias] = useState(null);
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rideSubscription = useRef(null);

  const C = {
    bg: isDark ? '#0d0d14' : '#f0f0f7',
    card: isDark ? '#1a1a2e' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a2e',
    textSecondary: isDark ? '#8888aa' : '#888899',
    accent: '#FF6B6B',
    green: '#4ade80',
    yellow: '#facc15',
    red: '#f87171',
    accentSoft: isDark ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.08)',
    greenSoft: isDark ? 'rgba(74,222,128,0.12)' : 'rgba(74,222,128,0.1)',
    yellowSoft: isDark ? 'rgba(250,204,21,0.12)' : 'rgba(250,204,21,0.1)',
    redSoft: isDark ? 'rgba(248,113,113,0.12)' : 'rgba(248,113,113,0.1)',
  };

  useEffect(() => {
    loadPreferencias();
    checkAccessibility();
    return () => {
      rideSubscription.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (sinalAtual) startPulse();
  }, [sinalAtual]);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, easing: Easing.ease, useNativeDriver: true }),
      ])
    ).start();
  };

  const loadPreferencias = async () => {
    try {
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      const res = await fetch(`${BACKEND_URL}/api/driver/settings/${driverId}`);
      if (res.ok) {
        const data = await res.json();
        setPreferencias(data);
      }
    } catch (e) {
      console.log('Erro ao carregar preferências:', e);
    }
  };

  const checkAccessibility = async () => {
    const enabled = await nativeService.isAccessibilityEnabled();
    setAccessibilityEnabled(enabled);
  };

  const avaliarCorrida = (ride) => {
    if (!preferencias) return 'yellow';

    const minPrecoKm = preferencias.target_hour_profit
      ? preferencias.target_hour_profit / 60 * (ride.time_min || 1) / (ride.distance_km || 1)
      : 1.5;

    const minRating = parseFloat(preferencias.passenger_min_rating) || 4.8;

    const precoOk = ride.price_per_km >= minPrecoKm;
    const ratingOk = ride.rating >= minRating;
    const precoMinOk = ride.price >= 6.0;

    if (precoOk && ratingOk && precoMinOk) return 'green';
    if (precoMinOk && (precoOk || ratingOk)) return 'yellow';
    return 'red';
  };

  const handleRideDetected = async (ride) => {
    const sinal = avaliarCorrida(ride);
    setSinalAtual(sinal);
    setUltimaCorrida({ ...ride, sinal, timestamp: new Date() });

    // Voz
    if (notifAtiva) {
      const isGood = sinal === 'green';
      await nativeService.speak(
        sinal === 'green'
          ? `Corrida boa! R$ ${ride.price.toFixed(2).replace('.', ',')}. Aceite!`
          : sinal === 'yellow'
          ? `Corrida razoável. R$ ${ride.price.toFixed(2).replace('.', ',')}. Avalie.`
          : `Corrida ruim. R$ ${ride.price.toFixed(2).replace('.', ',')}. Recuse.`
      );
    }

    // Push nativo
    if (notifAtiva) {
      await nativeService.sendRideAnalysis?.(
        ride.price, ride.distance_km, ride.price_per_km,
        ride.time_min, ride.rating, sinal
      );
    }
  };

  const handleToggleSemaforo = async (value) => {
    if (value && !accessibilityEnabled) {
      Alert.alert(
        '⚙️ Permissão necessária',
        'O Semáforo Inteligente precisa de acesso à Acessibilidade para ler as corridas do Uber/99.\n\nVocê será redirecionado para as configurações.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Ativar agora',
            onPress: async () => {
              await nativeService.openAccessibilitySettings();
              setTimeout(checkAccessibility, 3000);
            }
          }
        ]
      );
      return;
    }

    setSemaforoAtivo(value);

    if (value) {
      rideSubscription.current = nativeService.onRideDetected(handleRideDetected);
      await nativeService.speak('Semáforo Inteligente ativado. Monitorando corridas.');
    } else {
      rideSubscription.current?.remove();
      setSinalAtual(null);
      await nativeService.stopSpeech();
    }
  };

  const handleToggleBackground = async (value) => {
    setBackgroundAtivo(value);
    if (value) {
      await nativeService.startBackground();
      Alert.alert(
        '✅ Rodando em segundo plano',
        'O Supa Driver continua monitorando mesmo com a tela bloqueada. Veja o ícone na barra de status.'
      );
    } else {
      await nativeService.stopBackground();
    }
  };

  const getSinalConfig = () => {
    switch (sinalAtual) {
      case 'green': return { cor: C.green, soft: C.greenSoft, emoji: '🟢', texto: 'ACEITE!', sub: 'Corrida dentro da sua meta' };
      case 'yellow': return { cor: C.yellow, soft: C.yellowSoft, emoji: '🟡', texto: 'AVALIE', sub: 'Corrida razoável — você decide' };
      case 'red': return { cor: C.red, soft: C.redSoft, emoji: '🔴', texto: 'RECUSE', sub: 'Corrida abaixo da sua meta' };
      default: return null;
    }
  };

  const sinalConfig = getSinalConfig();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text style={{ fontSize: 22, fontWeight: '800', color: C.textPrimary, marginBottom: 4 }}>
        Semáforo Inteligente 🚦
      </Text>
      <Text style={{ fontSize: 13, color: C.textSecondary, marginBottom: 24 }}>
        Aceite só corridas que valem a pena
      </Text>

      {/* Aviso acessibilidade */}
      {!accessibilityEnabled && (
        <TouchableOpacity
          onPress={() => nativeService.openAccessibilitySettings()}
          style={{
            backgroundColor: C.yellowSoft, borderRadius: 12, padding: 14,
            flexDirection: 'row', alignItems: 'center', gap: 10,
            borderWidth: 1, borderColor: C.yellow + '40', marginBottom: 16,
          }}
        >
          <MaterialIcons name="warning" size={20} color={C.yellow} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.textPrimary }}>
              Acessibilidade desativada
            </Text>
            <Text style={{ fontSize: 12, color: C.textSecondary }}>
              Toque para ativar e permitir leitura de corridas
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={C.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Semáforo visual */}
      {sinalAtual ? (
        <Animated.View style={{
          transform: [{ scale: pulseAnim }],
          backgroundColor: sinalConfig.soft,
          borderRadius: 20, padding: 32,
          alignItems: 'center', marginBottom: 20,
          borderWidth: 2, borderColor: sinalConfig.cor + '50',
        }}>
          <Text style={{ fontSize: 64, marginBottom: 8 }}>{sinalConfig.emoji}</Text>
          <Text style={{ fontSize: 28, fontWeight: '900', color: sinalConfig.cor, letterSpacing: 2 }}>
            {sinalConfig.texto}
          </Text>
          <Text style={{ fontSize: 13, color: C.textSecondary, marginTop: 4 }}>
            {sinalConfig.sub}
          </Text>
        </Animated.View>
      ) : (
        <View style={{
          backgroundColor: C.card, borderRadius: 20, padding: 32,
          alignItems: 'center', marginBottom: 20,
          borderWidth: 1, borderColor: C.border,
        }}>
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
            {['#333', '#333', '#333'].map((cor, i) => (
              <View key={i} style={{
                width: 44, height: 44, borderRadius: 22,
                backgroundColor: semaforoAtivo ? C.accentSoft : '#2a2a3e',
                borderWidth: 2, borderColor: C.border,
              }} />
            ))}
          </View>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.textSecondary }}>
            {semaforoAtivo ? 'Aguardando corrida...' : 'Semáforo desativado'}
          </Text>
          <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 4 }}>
            {semaforoAtivo ? 'Abra o Uber ou 99 e espere uma corrida aparecer' : 'Ative o semáforo abaixo'}
          </Text>
        </View>
      )}

      {/* Última corrida detectada */}
      {ultimaCorrida && (
        <View style={{
          backgroundColor: C.card, borderRadius: 16, padding: 16,
          borderWidth: 1, borderColor: C.border, marginBottom: 16,
        }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.textPrimary, marginBottom: 12 }}>
            Última corrida detectada
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: 'Valor', value: `R$ ${ultimaCorrida.price?.toFixed(2).replace('.', ',')}`, icon: 'attach-money' },
              { label: 'Distância', value: `${ultimaCorrida.distance_km?.toFixed(1)} km`, icon: 'directions-car' },
              { label: 'Tempo', value: `${ultimaCorrida.time_min} min`, icon: 'timer' },
              { label: 'R$/km', value: `R$ ${ultimaCorrida.price_per_km?.toFixed(2).replace('.', ',')}`, icon: 'trending-up' },
              { label: 'Avaliação', value: `⭐ ${ultimaCorrida.rating}`, icon: 'star' },
            ].map((item, i) => (
              <View key={i} style={{
                backgroundColor: C.bg, borderRadius: 10, padding: 10,
                alignItems: 'center', minWidth: '28%', flex: 1,
              }}>
                <MaterialIcons name={item.icon} size={16} color={C.accent} />
                <Text style={{ fontSize: 14, fontWeight: '800', color: C.textPrimary, marginTop: 4 }}>
                  {item.value}
                </Text>
                <Text style={{ fontSize: 11, color: C.textSecondary }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Switches */}
      <View style={{ backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, marginBottom: 16, overflow: 'hidden' }}>

        {/* Semáforo */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
          <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: semaforoAtivo ? C.accentSoft : C.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <MaterialIcons name="traffic" size={20} color={semaforoAtivo ? C.accent : C.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary }}>Semáforo Inteligente</Text>
            <Text style={{ fontSize: 12, color: C.textSecondary }}>Lê corridas do Uber e 99 automaticamente</Text>
          </View>
          <Switch
            value={semaforoAtivo}
            onValueChange={handleToggleSemaforo}
            trackColor={{ false: C.border, true: C.accent + '60' }}
            thumbColor={semaforoAtivo ? C.accent : '#888'}
          />
        </View>

        {/* Notificações e voz */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
          <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: notifAtiva ? C.accentSoft : C.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <MaterialIcons name="notifications-active" size={20} color={notifAtiva ? C.accent : C.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary }}>Alertas e Voz</Text>
            <Text style={{ fontSize: 12, color: C.textSecondary }}>Notificação + aviso em voz a cada corrida</Text>
          </View>
          <Switch
            value={notifAtiva}
            onValueChange={setNotifAtiva}
            trackColor={{ false: C.border, true: C.accent + '60' }}
            thumbColor={notifAtiva ? C.accent : '#888'}
          />
        </View>

        {/* Background */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
          <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: backgroundAtivo ? C.accentSoft : C.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <MaterialIcons name="picture-in-picture" size={20} color={backgroundAtivo ? C.accent : C.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary }}>Rodar em segundo plano</Text>
            <Text style={{ fontSize: 12, color: C.textSecondary }}>Minimiza o app e mantém monitorando</Text>
          </View>
          <Switch
            value={backgroundAtivo}
            onValueChange={handleToggleBackground}
            trackColor={{ false: C.border, true: C.accent + '60' }}
            thumbColor={backgroundAtivo ? C.accent : '#888'}
          />
        </View>
      </View>

      {/* Como funciona */}
      <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: C.textPrimary, marginBottom: 12 }}>
          Como funciona:
        </Text>
        {[
          { icon: 'toggle-on', text: 'Ative o Semáforo e os Alertas acima' },
          { icon: 'smartphone', text: 'Abra o Uber Driver ou 99 normalmente' },
          { icon: 'search', text: 'Quando aparecer uma corrida, o app lê automaticamente' },
          { icon: 'traffic', text: 'Semáforo Verde = aceite, Amarelo = avalie, Vermelho = recuse' },
          { icon: 'record-voice-over', text: 'Aviso em voz te informa mesmo sem olhar a tela' },
        ].map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialIcons name={item.icon} size={15} color={C.accent} />
            </View>
            <Text style={{ fontSize: 13, color: C.textSecondary, flex: 1 }}>{item.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default SemaforoScreen;
