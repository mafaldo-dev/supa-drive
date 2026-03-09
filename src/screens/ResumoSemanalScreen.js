import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { sessionService } from '../services/sessionService';

const formatHours = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const fmt = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const MetaBar = ({ label, value, meta, unit = 'R$', isDark, C }) => {
  const progress = meta > 0 ? Math.min(value / meta, 1) : 0;
  const pct = Math.round(progress * 100);
  const ok = value >= meta;
  const color = ok ? '#4ade80' : pct >= 70 ? '#facc15' : '#f87171';

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontSize: 13, color: C.textSecondary }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color }}>
          {unit === 'R$' ? fmt(value) : `${Number(value).toFixed(1)}h`}
          {meta > 0 && <Text style={{ fontWeight: '400', color: C.textSecondary }}>
            {' '}/ {unit === 'R$' ? fmt(meta) : `${Number(meta).toFixed(1)}h`}
          </Text>}
        </Text>
      </View>
      <View style={{ height: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', borderRadius: 3 }}>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: color, width: `${pct}%` }} />
      </View>
      <Text style={{ fontSize: 10, color, marginTop: 3, fontWeight: '600' }}>
        {ok ? `✅ ${pct}% — Meta atingida!` : `${pct}% da meta`}
      </Text>
    </View>
  );
};

const ResumoSemanalScreen = ({ preferences }) => {
  const { isDark } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const C = {
    bg: isDark ? '#0d0d14' : '#f0f0f7',
    card: isDark ? '#1a1a2e' : '#ffffff',
    card2: isDark ? '#16213e' : '#f8f8ff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a2e',
    textSecondary: isDark ? '#8888aa' : '#888899',
    accent: '#FF6B6B',
    accentSoft: isDark ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.08)',
    green: '#4ade80',
    yellow: '#facc15',
  };

  const load = async () => {
    const data = await sessionService.getSessions(30);
    setSessions(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const summary = sessionService.getWeeklySummary(sessions);

  // Metas das preferências
  const metaSemanal = parseFloat(preferences?.target_week) || 0;
  const metaHora = parseFloat(preferences?.target_hour_profit) || 0;
  // Horas alvo: meta semanal / ganho por hora alvo
  const horasAlvo = metaHora > 0 && metaSemanal > 0 ? metaSemanal / metaHora : 0;

  // Score geral da semana
  const scoreGanhos = metaSemanal > 0 ? Math.min(summary.totalEarnings / metaSemanal, 1) : null;
  const scoreHora = metaHora > 0 ? Math.min(summary.avgEarningsPerHour / metaHora, 1) : null;
  const scoreGeral = scoreGanhos !== null && scoreHora !== null
    ? Math.round(((scoreGanhos + scoreHora) / 2) * 100)
    : null;

  const getScoreEmoji = (s) => s >= 90 ? '🏆' : s >= 70 ? '💪' : s >= 50 ? '📈' : '⚠️';
  const getScoreColor = (s) => s >= 90 ? '#4ade80' : s >= 70 ? '#facc15' : s >= 50 ? '#fb923c' : '#f87171';

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    content: { padding: 16, paddingBottom: 40 },
    card: {
      backgroundColor: C.card, borderRadius: 20, padding: 20, marginBottom: 16,
      borderWidth: 1, borderColor: C.border,
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 12, elevation: 5,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    cardIconBox: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center',
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
    scoreBox: {
      alignItems: 'center', backgroundColor: C.card2,
      borderRadius: 16, padding: 20, marginBottom: 16,
      borderWidth: 1, borderColor: C.border,
    },
    scoreEmoji: { fontSize: 40, marginBottom: 6 },
    scoreNum: { fontSize: 48, fontWeight: '800', marginBottom: 4 },
    scoreSub: { fontSize: 13, color: C.textSecondary },
    gridRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    gridCell: {
      flex: 1, backgroundColor: C.card2, borderRadius: 14, padding: 14,
      alignItems: 'center', borderWidth: 1, borderColor: C.border,
    },
    gridVal: { fontSize: 18, fontWeight: '800', color: C.accent, marginBottom: 2 },
    gridLabel: { fontSize: 11, color: C.textSecondary, textAlign: 'center' },
    dayRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border,
    },
    dayDate: { fontSize: 13, color: C.textSecondary, width: 80 },
    dayHours: { fontSize: 12, color: C.textSecondary, width: 50, textAlign: 'center' },
    dayRides: { fontSize: 12, color: C.textSecondary, width: 50, textAlign: 'center' },
    dayEarnings: { fontSize: 14, fontWeight: '700', color: C.green, width: 80, textAlign: 'right' },
    emptyText: { color: C.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 30, fontStyle: 'italic' },
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.accent} colors={[C.accent]} />}
    >
      {/* Score geral */}
      {scoreGeral !== null && (
        <View style={styles.card}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreEmoji}>{getScoreEmoji(scoreGeral)}</Text>
            <Text style={[styles.scoreNum, { color: getScoreColor(scoreGeral) }]}>{scoreGeral}%</Text>
            <Text style={styles.scoreSub}>Performance semanal geral</Text>
          </View>

          <MetaBar label="💰 Ganhos semanais" value={summary.totalEarnings} meta={metaSemanal} unit="R$" isDark={isDark} C={C} />
          {metaHora > 0 && (
            <MetaBar label="⏱️ Ganho médio por hora" value={summary.avgEarningsPerHour} meta={metaHora} unit="R$" isDark={isDark} C={C} />
          )}
          {horasAlvo > 0 && (
            <MetaBar label="🕐 Horas trabalhadas" value={summary.totalHours} meta={horasAlvo} unit="h" isDark={isDark} C={C} />
          )}
        </View>
      )}

      {/* Totais da semana */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconBox}>
            <MaterialIcons name="bar-chart" size={18} color={C.accent} />
          </View>
          <Text style={styles.cardTitle}>Totais da semana</Text>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.gridCell}>
            <Text style={styles.gridVal}>{fmt(summary.totalEarnings)}</Text>
            <Text style={styles.gridLabel}>Total ganho</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.gridVal}>{formatHours(summary.totalSeconds)}</Text>
            <Text style={styles.gridLabel}>Ao volante</Text>
          </View>
        </View>
        <View style={styles.gridRow}>
          <View style={styles.gridCell}>
            <Text style={styles.gridVal}>{summary.totalRides}</Text>
            <Text style={styles.gridLabel}>Corridas</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.gridVal}>{summary.daysWorked}</Text>
            <Text style={styles.gridLabel}>Dias trabalhados</Text>
          </View>
        </View>
        <View style={styles.gridRow}>
          <View style={styles.gridCell}>
            <Text style={styles.gridVal}>{fmt(summary.avgEarningsPerDay)}</Text>
            <Text style={styles.gridLabel}>Média/dia</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.gridVal}>{fmt(summary.avgEarningsPerHour)}</Text>
            <Text style={styles.gridLabel}>Média/hora</Text>
          </View>
        </View>
      </View>

      {/* Dias da semana */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconBox}>
            <MaterialIcons name="calendar-today" size={18} color={C.accent} />
          </View>
          <Text style={styles.cardTitle}>Dias esta semana</Text>
        </View>

        {summary.sessions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma jornada esta semana.</Text>
        ) : (
          <>
            <View style={[styles.dayRow, { borderBottomWidth: 2 }]}>
              <Text style={[styles.dayDate, { fontWeight: '700', color: C.textPrimary }]}>Data</Text>
              <Text style={[styles.dayHours, { fontWeight: '700', color: C.textPrimary }]}>Horas</Text>
              <Text style={[styles.dayRides, { fontWeight: '700', color: C.textPrimary }]}>Corridas</Text>
              <Text style={[styles.dayEarnings, { fontWeight: '700', color: C.textPrimary }]}>Ganhos</Text>
            </View>
            {summary.sessions.map((s) => (
              <View key={s.id} style={styles.dayRow}>
                <Text style={styles.dayDate}>
                  {new Date(s.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                </Text>
                <Text style={styles.dayHours}>{formatHours(s.duration_seconds)}</Text>
                <Text style={styles.dayRides}>{s.rides_count}</Text>
                <Text style={styles.dayEarnings}>{fmt(s.earnings)}</Text>
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default ResumoSemanalScreen;