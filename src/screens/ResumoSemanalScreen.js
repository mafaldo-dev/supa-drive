import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { sessionService } from '../services/sessionService';
import { formatHours } from '../utils/validators';
import { MetaBar } from '../components/MetaBar';
import { useResumoStyles } from '../styles/ResumoStyles';


const ResumoSemanalScreen = ({ preferences }) => {
  const { colors } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const styles = useResumoStyles();

  const C = {
    bg: colors ? '#0d0d14' : '#f0f0f7',
    card: colors ? '#1a1a2e' : '#ffffff',
    card2: colors ? '#16213e' : '#f8f8ff',
    border: colors ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    textPrimary: colors ? '#f0f0f0' : '#1a1a2e',
    textSecondary: colors ? '#8888aa' : '#888899',
    accent: '#FF6B6B',
    accentSoft: colors ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.08)',
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

          <MetaBar label="💰 Ganhos semanais" value={summary.totalEarnings} meta={metaSemanal} unit="R$" isDark={colors} C={C} />
          {metaHora > 0 && (
            <MetaBar label="⏱️ Ganho médio por hora" value={summary.avgEarningsPerHour} meta={metaHora} unit="R$" isDark={colors} C={C} />
          )}
          {horasAlvo > 0 && (
            <MetaBar label="🕐 Horas trabalhadas" value={summary.totalHours} meta={horasAlvo} unit="h" isDark={colors} C={C} />
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