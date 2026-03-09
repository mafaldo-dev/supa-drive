import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Modal, ActivityIndicator, AppState,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { timerService, sessionService } from '../services/sessionService';

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
};

const JornadaScreen = ({ preferences }) => {
  const { isDark } = useTheme();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);
  const [earnings, setEarnings] = useState('');
  const [ridesCount, setRidesCount] = useState('');
  const [saving, setSaving] = useState(false);

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
    greenSoft: 'rgba(74,222,128,0.1)',
    input: isDark ? '#16213e' : '#f8f8ff',
    overlay: 'rgba(0,0,0,0.7)',
  };

  // Carrega sessões e verifica se timer estava rodando
  useEffect(() => {
    const init = async () => {
      const startTime = await timerService.getStartTime();
      if (startTime) {
        setIsRunning(true);
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }
      const data = await sessionService.getSessions(30);
      setSessions(data);
      setLoadingSessions(false);
    };
    init();
  }, []);

  // Tick do cronômetro
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Recalcula elapsed quando app volta do background
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state === 'active' && isRunning) {
        const secs = await timerService.getElapsedSeconds();
        setElapsed(secs);
      }
    });
    return () => sub.remove();
  }, [isRunning]);

  const handleStart = async () => {
    await timerService.startTimer();
    setElapsed(0);
    setIsRunning(true);
  };

  const handleStop = () => {
    setShowEndModal(true);
  };

  const handleSaveSession = async () => {
    if (!earnings) {
      Alert.alert('Atenção', 'Informe os ganhos do dia.');
      return;
    }
    setSaving(true);
    await timerService.stopTimer();
    const result = await sessionService.saveSession({
      durationSeconds: elapsed,
      earnings: parseFloat(earnings) || 0,
      ridesCount: parseInt(ridesCount) || 0,
    });
    setIsRunning(false);
    setElapsed(0);
    setShowEndModal(false);
    setEarnings('');
    setRidesCount('');
    setSaving(false);

    // Recarrega sessões
    const data = await sessionService.getSessions(30);
    setSessions(data);

    Alert.alert(
      'Jornada encerrada! 🎉',
      result.success ? 'Dados salvos com sucesso!' : 'Salvos localmente (sem conexão).'
    );
  };

  const handleDiscardSession = async () => {
    Alert.alert(
      'Descartar jornada?',
      'O tempo registrado será perdido.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descartar', style: 'destructive', onPress: async () => {
            await timerService.stopTimer();
            setIsRunning(false);
            setElapsed(0);
            setShowEndModal(false);
          }
        }
      ]
    );
  };

  const metaDiaria = parseFloat(preferences?.target_day) || 0;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    content: { padding: 16, paddingBottom: 40 },

    // Cronômetro
    timerCard: {
      backgroundColor: C.card, borderRadius: 24, padding: 28,
      alignItems: 'center', marginBottom: 20,
      borderWidth: 1, borderColor: C.border,
      shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.4 : 0.1, shadowRadius: 16, elevation: 8,
    },
    timerLabel: { fontSize: 12, fontWeight: '700', color: C.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
    timerDisplay: {
      fontSize: 56, fontWeight: '800', letterSpacing: 2,
      color: isRunning ? C.green : C.textPrimary, marginBottom: 8,
      fontVariant: ['tabular-nums'],
    },
    timerStatus: {
      fontSize: 13, color: isRunning ? C.green : C.textSecondary,
      marginBottom: 24, fontWeight: '600',
    },
    timerBtnRow: { flexDirection: 'row', gap: 12 },
    btnStart: {
      backgroundColor: C.green, borderRadius: 16,
      paddingVertical: 16, paddingHorizontal: 40,
      flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    btnStop: {
      backgroundColor: C.accent, borderRadius: 16,
      paddingVertical: 16, paddingHorizontal: 32,
      flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

    // Histórico
    sectionTitle: {
      fontSize: 12, fontWeight: '700', color: C.textSecondary,
      letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12,
    },
    sessionCard: {
      backgroundColor: C.card, borderRadius: 16, padding: 16,
      marginBottom: 10, borderWidth: 1, borderColor: C.border,
    },
    sessionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sessionDate: { fontSize: 14, fontWeight: '700', color: C.textPrimary },
    sessionEarningsBig: { fontSize: 20, fontWeight: '800', color: C.green },
    sessionStats: { flexDirection: 'row', gap: 8 },
    sessionStat: {
      flex: 1, backgroundColor: C.card2, borderRadius: 10, padding: 10,
      alignItems: 'center', borderWidth: 1, borderColor: C.border,
    },
    sessionStatVal: { fontSize: 14, fontWeight: '800', color: C.accent, marginBottom: 2 },
    sessionStatLabel: { fontSize: 10, color: C.textSecondary },
    progressBar: {
      height: 4, backgroundColor: C.border, borderRadius: 2, marginTop: 12,
    },
    progressFill: { height: 4, borderRadius: 2, backgroundColor: C.green },
    progressLabel: { fontSize: 10, color: C.textSecondary, marginTop: 4 },

    emptyText: { color: C.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 30, fontStyle: 'italic' },

    // Modal
    modalOverlay: {
      flex: 1, backgroundColor: C.overlay,
      justifyContent: 'flex-end',
    },
    modalCard: {
      backgroundColor: C.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
      padding: 28, paddingBottom: 40,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: C.textPrimary, marginBottom: 6, textAlign: 'center' },
    modalSub: { fontSize: 13, color: C.textSecondary, textAlign: 'center', marginBottom: 24 },
    modalDuration: {
      backgroundColor: C.greenSoft, borderRadius: 14, padding: 14,
      alignItems: 'center', marginBottom: 24,
      borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)',
    },
    modalDurationVal: { fontSize: 32, fontWeight: '800', color: C.green },
    modalDurationLabel: { fontSize: 11, color: C.textSecondary, marginTop: 2 },
    modalLabel: { fontSize: 13, fontWeight: '600', color: C.textSecondary, marginBottom: 6 },
    modalInput: {
      backgroundColor: C.input, borderWidth: 1, borderColor: C.border,
      borderRadius: 12, padding: 14, fontSize: 18, fontWeight: '700',
      color: C.textPrimary, marginBottom: 14, textAlign: 'center',
    },
    modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
    modalBtnSave: { flex: 2, backgroundColor: C.green, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    modalBtnDiscard: { flex: 1, backgroundColor: C.accentSoft, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,107,107,0.2)' },
    modalBtnSaveText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    modalBtnDiscardText: { color: C.accent, fontWeight: '700', fontSize: 14 },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Cronômetro */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Jornada de hoje</Text>
          <Text style={styles.timerDisplay}>{formatDuration(elapsed)}</Text>
          <Text style={styles.timerStatus}>
            {isRunning ? '🟢 Jornada em andamento' : '⚪ Parado'}
          </Text>
          <View style={styles.timerBtnRow}>
            {!isRunning ? (
              <TouchableOpacity style={styles.btnStart} onPress={handleStart}>
                <MaterialIcons name="play-arrow" size={22} color="#fff" />
                <Text style={styles.btnText}>Iniciar Jornada</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.btnStop} onPress={handleStop}>
                <MaterialIcons name="stop" size={22} color="#fff" />
                <Text style={styles.btnText}>Encerrar Jornada</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Histórico */}
        <Text style={styles.sectionTitle}>📋 Histórico recente</Text>

        {loadingSessions ? (
          <ActivityIndicator color={C.accent} style={{ marginTop: 20 }} />
        ) : sessions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma jornada registrada ainda.</Text>
        ) : (
          sessions.slice(0, 14).map((session) => {
            const hrs = (session.duration_seconds / 3600).toFixed(1);
            const avgPerRide = session.rides_count > 0
              ? (session.earnings / session.rides_count).toFixed(2)
              : 0;
            const progress = metaDiaria > 0 ? Math.min(session.earnings / metaDiaria, 1) : 0;
            const bateuMeta = metaDiaria > 0 && session.earnings >= metaDiaria;

            return (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionTop}>
                  <View>
                    <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                    {bateuMeta && <Text style={{ fontSize: 11, color: C.green, fontWeight: '700' }}>✅ Meta atingida!</Text>}
                  </View>
                  <Text style={styles.sessionEarningsBig}>R$ {Number(session.earnings).toFixed(2)}</Text>
                </View>

                <View style={styles.sessionStats}>
                  <View style={styles.sessionStat}>
                    <Text style={styles.sessionStatVal}>{hrs}h</Text>
                    <Text style={styles.sessionStatLabel}>Ao volante</Text>
                  </View>
                  <View style={styles.sessionStat}>
                    <Text style={styles.sessionStatVal}>{session.rides_count}</Text>
                    <Text style={styles.sessionStatLabel}>Corridas</Text>
                  </View>
                  <View style={styles.sessionStat}>
                    <Text style={styles.sessionStatVal}>R${avgPerRide}</Text>
                    <Text style={styles.sessionStatLabel}>Média/corrida</Text>
                  </View>
                </View>

                {metaDiaria > 0 && (
                  <>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, {
                        width: `${progress * 100}%`,
                        backgroundColor: bateuMeta ? C.green : C.accent,
                      }]} />
                    </View>
                    <Text style={styles.progressLabel}>
                      {Math.round(progress * 100)}% da meta diária (R$ {metaDiaria.toFixed(0)})
                    </Text>
                  </>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal encerrar jornada */}
      <Modal visible={showEndModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Encerrar Jornada</Text>
            <Text style={styles.modalSub}>Como foi o dia? Registre seus resultados.</Text>

            <View style={styles.modalDuration}>
              <Text style={styles.modalDurationVal}>{formatDuration(elapsed)}</Text>
              <Text style={styles.modalDurationLabel}>tempo ao volante</Text>
            </View>

            <Text style={styles.modalLabel}>💰 Total ganho hoje (R$)</Text>
            <TextInput
              style={styles.modalInput}
              value={earnings}
              onChangeText={setEarnings}
              keyboardType="decimal-pad"
              placeholder="Ex: 250.00"
              placeholderTextColor={C.textSecondary}
            />

            <Text style={styles.modalLabel}>🚗 Número de corridas</Text>
            <TextInput
              style={styles.modalInput}
              value={ridesCount}
              onChangeText={setRidesCount}
              keyboardType="number-pad"
              placeholder="Ex: 18"
              placeholderTextColor={C.textSecondary}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtnDiscard} onPress={handleDiscardSession}>
                <Text style={styles.modalBtnDiscardText}>Descartar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={handleSaveSession} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.modalBtnSaveText}>Salvar Jornada</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default JornadaScreen;