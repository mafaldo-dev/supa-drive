import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { BACKEND_URL } from '../utils/constants';
import { STORAGE_KEYS } from '../utils/storage';

const FILTROS = [
  { key: 'hoje', label: 'Hoje' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mês' },
  { key: 'tudo', label: 'Tudo' },
];

const CorridasScreen = () => {
  const { isDark } = useTheme();
  const [filtro, setFiltro] = useState('semana');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const C = {
    bg: isDark ? '#0d0d14' : '#f0f0f7',
    card: isDark ? '#1a1a2e' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a2e',
    textSecondary: isDark ? '#8888aa' : '#888899',
    accent: '#FF6B6B',
    green: '#4ade80',
    accentSoft: isDark ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.08)',
    filterBg: isDark ? '#16213e' : '#e8e8f0',
  };

  useEffect(() => {
    loadSessions();
  }, [filtro]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      const days = filtro === 'hoje' ? 1 : filtro === 'semana' ? 7 : filtro === 'mes' ? 30 : 365;
      const res = await fetch(`${BACKEND_URL}/api/sessions/${driverId}?days=${days}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.log('Erro ao carregar sessões:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSessions();
  }, [filtro]);

  const formatDuration = (seconds) => {
    if (!seconds) return '0min';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    if (date.toDateString() === hoje.toDateString()) return 'Hoje';
    if (date.toDateString() === ontem.toDateString()) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const formatCurrency = (val) => {
    if (!val) return 'R$ 0,00';
    return `R$ ${parseFloat(val).toFixed(2).replace('.', ',')}`;
  };

  // Totais do período
  const totais = sessions.reduce((acc, s) => ({
    ganhos: acc.ganhos + (parseFloat(s.earnings) || 0),
    corridas: acc.corridas + (parseInt(s.rides_count) || 0),
    tempo: acc.tempo + (parseInt(s.duration_seconds) || 0),
    jornadas: acc.jornadas + 1,
  }), { ganhos: 0, corridas: 0, tempo: 0, jornadas: 0 });

  const mediaPorJornada = totais.jornadas > 0
    ? totais.ganhos / totais.jornadas
    : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
    >
      {/* Header */}
      <Text style={{ fontSize: 22, fontWeight: '800', color: C.textPrimary, marginBottom: 4 }}>
        Histórico 📋
      </Text>
      <Text style={{ fontSize: 13, color: C.textSecondary, marginBottom: 20 }}>
        Suas jornadas registradas
      </Text>

      {/* Filtros */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
        {FILTROS.map(f => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFiltro(f.key)}
            style={{
              flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
              backgroundColor: filtro === f.key ? C.accent : C.filterBg,
            }}
          >
            <Text style={{
              fontSize: 13, fontWeight: '700',
              color: filtro === f.key ? '#fff' : C.textSecondary,
            }}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Totais do período */}
      {sessions.length > 0 && (
        <View style={{
          backgroundColor: C.accentSoft, borderRadius: 16, padding: 16,
          marginBottom: 20, borderWidth: 1, borderColor: C.accent + '30',
        }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.accent, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Resumo do período
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {[
              { label: 'Total ganho', value: formatCurrency(totais.ganhos), icon: 'attach-money' },
              { label: 'Corridas', value: String(totais.corridas), icon: 'directions-car' },
              { label: 'Tempo total', value: formatDuration(totais.tempo), icon: 'timer' },
              { label: 'Média/jornada', value: formatCurrency(mediaPorJornada), icon: 'trending-up' },
            ].map((item, i) => (
              <View key={i} style={{ flex: 1, minWidth: '40%', alignItems: 'center' }}>
                <MaterialIcons name={item.icon} size={18} color={C.accent} />
                <Text style={{ fontSize: 16, fontWeight: '800', color: C.textPrimary, marginTop: 4 }}>
                  {item.value}
                </Text>
                <Text style={{ fontSize: 11, color: C.textSecondary }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Lista de jornadas */}
      {loading ? (
        <View style={{ alignItems: 'center', paddingTop: 60 }}>
          <ActivityIndicator size="large" color={C.accent} />
          <Text style={{ color: C.textSecondary, marginTop: 12 }}>Carregando histórico...</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={{
          backgroundColor: C.card, borderRadius: 16, padding: 40,
          alignItems: 'center', borderWidth: 1, borderColor: C.border,
        }}>
          <MaterialIcons name="history" size={48} color={C.textSecondary} style={{ opacity: 0.4 }} />
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.textPrimary, marginTop: 16 }}>
            Nenhuma jornada encontrada
          </Text>
          <Text style={{ fontSize: 13, color: C.textSecondary, textAlign: 'center', marginTop: 8 }}>
            {filtro === 'hoje'
              ? 'Você ainda não registrou uma jornada hoje.'
              : 'Nenhuma jornada registrada neste período.'}
          </Text>
        </View>
      ) : (
        sessions.map((session, index) => {
          const ganhoHora = session.duration_seconds > 0
            ? (parseFloat(session.earnings) / (session.duration_seconds / 3600))
            : 0;

          return (
            <View
              key={session.id || index}
              style={{
                backgroundColor: C.card, borderRadius: 16, padding: 16,
                marginBottom: 12, borderWidth: 1, borderColor: C.border,
              }}
            >
              {/* Data e ganho */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialIcons name="directions-car" size={18} color={C.accent} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.textPrimary }}>
                      {formatDate(session.created_at || session.start_time)}
                    </Text>
                    <Text style={{ fontSize: 12, color: C.textSecondary }}>
                      {session.rides_count || 0} corridas • {formatDuration(session.duration_seconds)}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: C.accent }}>
                  {formatCurrency(session.earnings)}
                </Text>
              </View>

              {/* Métricas */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  {
                    label: 'R$/hora',
                    value: ganhoHora > 0 ? `R$ ${ganhoHora.toFixed(0)}` : '—',
                    icon: 'speed',
                    good: ganhoHora >= 25,
                  },
                  {
                    label: 'Duração',
                    value: formatDuration(session.duration_seconds),
                    icon: 'timer',
                    good: null,
                  },
                  {
                    label: 'Corridas',
                    value: String(session.rides_count || 0),
                    icon: 'local-taxi',
                    good: null,
                  },
                ].map((m, i) => (
                  <View key={i} style={{
                    flex: 1, backgroundColor: C.bg, borderRadius: 10, padding: 10, alignItems: 'center',
                  }}>
                    <MaterialIcons
                      name={m.icon}
                      size={15}
                      color={m.good === true ? C.green : m.good === false ? C.accent : C.textSecondary}
                    />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: C.textPrimary, marginTop: 4 }}>
                      {m.value}
                    </Text>
                    <Text style={{ fontSize: 11, color: C.textSecondary }}>{m.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

export default CorridasScreen;