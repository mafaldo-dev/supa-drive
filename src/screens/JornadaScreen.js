import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Modal, ActivityIndicator, AppState,
  Switch, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { timerService, sessionService } from '../services/sessionService';
import { notificationService } from '../services/notificationService';

const NOTIF_PREFS_KEY = 'jornada_notif_prefs';
const FLOATING_KEY = 'jornada_floating';

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

const CircularTimer = ({ elapsed, isRunning, isPaused, C, isDark }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRunning && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [isRunning, isPaused]);

  const ringColor = isPaused ? '#FF6B6B' : isRunning ? '#4ade80' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)');
  const timeColor = isPaused ? '#FF6B6B' : isRunning ? '#4ade80' : (isDark ? '#f0f0f0' : '#1a1a2e');
  const statusColor = isPaused ? '#FF6B6B' : isRunning ? '#4ade80' : (isDark ? '#8888aa' : '#888899');
  const statusText = isPaused ? '⏸ PAUSADO' : isRunning ? '● AO VIVO' : '○ PARADO';

  return (
    <Animated.View style={{
      width: 220, height: 220, borderRadius: 110,
      borderWidth: isRunning ? 3 : 2,
      borderColor: ringColor,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
      transform: [{ scale: pulseAnim }],
      shadowColor: isRunning && !isPaused ? '#4ade80' : isPaused ? '#FF6B6B' : 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 18,
      elevation: isRunning ? 10 : 2,
    }}>
      <View style={{
        width: 194, height: 194, borderRadius: 97,
        borderWidth: 1,
        borderColor: ringColor + '33',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{
          fontSize: 46, fontWeight: '800', letterSpacing: 1,
          color: timeColor,
          fontVariant: ['tabular-nums'],
        }}>
          {formatDuration(elapsed)}
        </Text>
        <Text style={{
          fontSize: 11, fontWeight: '700', marginTop: 8,
          color: statusColor, letterSpacing: 1,
        }}>
          {statusText}
        </Text>
      </View>
    </Animated.View>
  );
};

const JornadaScreen = ({ preferences, userPlan }) => {
  const { isDark } = useTheme();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [frozenElapsed, setFrozenElapsed] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);
  const [earnings, setEarnings] = useState('');
  const [ridesCount, setRidesCount] = useState('');
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [floatingEnabled, setFloatingEnabled] = useState(false);

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
    overlay: 'rgba(0,0,0,0.75)',
    switchOn: '#FF6B6B',
    switchOff: isDark ? '#333' : '#ddd',
  };

  useEffect(() => {
    // Pede permissão de notificações ao entrar na tela
    notificationService?.requestPermissions();
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const saved = await AsyncStorage.getItem(NOTIF_PREFS_KEY);
        if (saved) {
          const prefs = JSON.parse(saved);
          setPushEnabled(prefs.push || false);
          setVoiceEnabled(prefs.voice || false);
        }
        const floating = await AsyncStorage.getItem(FLOATING_KEY);
        setFloatingEnabled(floating === 'true');
      } catch {}

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

  useEffect(() => {
    if (!isRunning || isPaused) return;
    const interval = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state === 'active' && isRunning && !isPaused) {
        const secs = await timerService.getElapsedSeconds();
        setElapsed(secs);
      }
    });
    return () => sub.remove();
  }, [isRunning, isPaused]);

  const saveNotifPrefs = async (push, voice) => {
    await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify({ push, voice }));
  };

  const handlePushToggle = (val) => {
    if (val) setVoiceEnabled(false);
    setPushEnabled(val);
    saveNotifPrefs(val, false);
  };

  const handleVoiceToggle = (val) => {
    if (val && userPlan !== 'premium') {
      Alert.alert('⭐ Recurso Premium', 'Mensagens de voz estão disponíveis no plano Premium.');
      return;
    }
    if (val) setPushEnabled(false);
    setVoiceEnabled(val);
    saveNotifPrefs(false, val);
  };

  const handleFloatingToggle = async (val) => {
    setFloatingEnabled(val);
    await AsyncStorage.setItem(FLOATING_KEY, String(val));
  };

  const handleStart = async () => {
    await timerService.startTimer();
    setElapsed(0);
    setIsRunning(true);
    setIsPaused(false);
    // Agenda alerta automático de pausa após 4h
    await notificationService?.scheduleFourHourAlert();
  };

  const handleStop = () => {
    setFrozenElapsed(elapsed);
    setIsPaused(true);
    setShowEndModal(true);
  };

  const handleCancelModal = () => {
    setIsPaused(false);
    setShowEndModal(false);
  };

  const handleSaveSession = async () => {
    if (!earnings) {
      Alert.alert('Atenção', 'Informe os ganhos do dia.');
      return;
    }
    setSaving(true);

    // Salva os valores ANTES de resetar os estados
    const finalEarnings = parseFloat(String(earnings).replace(',', '.')) || 0;
    const finalRides = parseInt(ridesCount) || 0;
    const finalDuration = frozenElapsed;

    await timerService.stopTimer();
    const result = await sessionService.saveSession({
      durationSeconds: finalDuration,
      earnings: finalEarnings,
      ridesCount: finalRides,
    });

    // Cancela o alerta de 4h
    await notificationService?.cancelFourHourAlert?.();

    // Dispara notificação ANTES de resetar os estados
    const sessionData = { durationSeconds: finalDuration, earnings: finalEarnings, ridesCount: finalRides };
    if (pushEnabled) {
      await notificationService?.sendEndOfDayPush?.(sessionData);
    } else if (voiceEnabled) {
      notificationService?.speakEndOfDay?.(sessionData);
    }

    // Reseta estados depois de tudo
    setIsRunning(false);
    setIsPaused(false);
    setElapsed(0);
    setFrozenElapsed(0);
    setShowEndModal(false);
    setEarnings('');
    setRidesCount('');
    setSaving(false);

    const data = await sessionService.getSessions(30);
    setSessions(data);

    Alert.alert(
      'Jornada encerrada! 🎉',
      result.success ? 'Dados salvos com sucesso!' : 'Salvos localmente (sem conexão).'
    );
  };

  const handleDiscardSession = () => {
    Alert.alert(
      'Descartar jornada?',
      'O tempo registrado será perdido.',
      [
        { text: 'Cancelar', style: 'cancel', onPress: handleCancelModal },
        {
          text: 'Descartar', style: 'destructive', onPress: async () => {
            await timerService.stopTimer();
            setIsRunning(false);
            setIsPaused(false);
            setElapsed(0);
            setFrozenElapsed(0);
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

    timerCard: {
      backgroundColor: C.card, borderRadius: 24, paddingVertical: 32, paddingHorizontal: 20,
      alignItems: 'center', marginBottom: 16,
      borderWidth: 1, borderColor: C.border,
      shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.4 : 0.08, shadowRadius: 16, elevation: 8,
    },
    timerLabel: {
      fontSize: 11, fontWeight: '700', color: C.textSecondary,
      letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 24,
    },
    timerBtnRow: { flexDirection: 'row', gap: 12, marginTop: 28 },
    btnStart: {
      backgroundColor: C.green, borderRadius: 50,
      paddingVertical: 14, paddingHorizontal: 36,
      flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    btnStop: {
      backgroundColor: C.accent, borderRadius: 50,
      paddingVertical: 14, paddingHorizontal: 28,
      flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

    switchCard: {
      backgroundColor: C.card, borderRadius: 20, padding: 20,
      marginBottom: 16, borderWidth: 1, borderColor: C.border,
    },
    switchCardTitle: {
      fontSize: 11, fontWeight: '700', color: C.textSecondary,
      letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14,
    },
    switchRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border,
    },
    switchRowLast: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingVertical: 12,
    },
    switchLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    switchIconBox: {
      width: 34, height: 34, borderRadius: 10,
      backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center',
    },
    switchTextWrap: { flex: 1 },
    switchLabel: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
    switchDesc: { fontSize: 11, color: C.textSecondary, marginTop: 1 },
    premiumTag: {
      backgroundColor: 'rgba(255,215,0,0.15)', borderRadius: 6,
      paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6,
    },
    premiumTagText: { fontSize: 9, fontWeight: '800', color: '#FFD700' },

    sectionTitle: {
      fontSize: 11, fontWeight: '700', color: C.textSecondary,
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
    progressBar: { height: 4, backgroundColor: C.border, borderRadius: 2, marginTop: 12 },
    progressFill: { height: 4, borderRadius: 2 },
    progressLabel: { fontSize: 10, color: C.textSecondary, marginTop: 4 },
    emptyText: { color: C.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 30, fontStyle: 'italic' },

    modalOverlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
    modalCard: {
      backgroundColor: C.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
      padding: 28, paddingBottom: 40,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: C.textPrimary, marginBottom: 4, textAlign: 'center' },
    modalSub: { fontSize: 13, color: C.textSecondary, textAlign: 'center', marginBottom: 20 },
    modalDuration: {
      backgroundColor: C.greenSoft, borderRadius: 14, padding: 14,
      alignItems: 'center', marginBottom: 20,
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
    modalBtnDiscard: {
      flex: 1, backgroundColor: C.accentSoft, borderRadius: 14, paddingVertical: 16,
      alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,107,107,0.2)',
    },
    modalBtnSaveText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    modalBtnDiscardText: { color: C.accent, fontWeight: '700', fontSize: 14 },
    modalBackBtn: { alignItems: 'center', marginTop: 16 },
    modalBackText: { color: C.textSecondary, fontSize: 13 },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Cronômetro redondo */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Jornada de hoje</Text>
          <CircularTimer
            elapsed={elapsed}
            isRunning={isRunning}
            isPaused={isPaused}
            C={C}
            isDark={isDark}
          />
          <View style={styles.timerBtnRow}>
            {!isRunning ? (
              <TouchableOpacity style={styles.btnStart} onPress={handleStart}>
                <MaterialIcons name="play-arrow" size={22} color="#fff" />
                <Text style={styles.btnText}>Iniciar Jornada</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.btnStop} onPress={handleStop}>
                <MaterialIcons name="stop" size={22} color="#fff" />
                <Text style={styles.btnText}>Encerrar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Switches */}
        <View style={styles.switchCard}>
          <Text style={styles.switchCardTitle}>⚙️ Configurações da jornada</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <View style={styles.switchIconBox}>
                <MaterialIcons name="notifications" size={16} color={C.accent} />
              </View>
              <View style={styles.switchTextWrap}>
                <Text style={styles.switchLabel}>Notificação push</Text>
                <Text style={styles.switchDesc}>Mensagem ao fim da jornada</Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={handlePushToggle}
              trackColor={{ false: C.switchOff, true: C.switchOn }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <View style={styles.switchIconBox}>
                <MaterialIcons name="record-voice-over" size={16} color={C.accent} />
              </View>
              <View style={styles.switchTextWrap}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.switchLabel}>Mensagem de voz</Text>
                  <View style={styles.premiumTag}>
                    <Text style={styles.premiumTagText}>PREMIUM</Text>
                  </View>
                </View>
                <Text style={styles.switchDesc}>Notificação em áudio</Text>
              </View>
            </View>
            <Switch
              value={voiceEnabled}
              onValueChange={handleVoiceToggle}
              trackColor={{ false: C.switchOff, true: C.switchOn }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.switchRowLast}>
            <View style={styles.switchLeft}>
              <View style={styles.switchIconBox}>
                <MaterialIcons name="picture-in-picture" size={16} color={C.accent} />
              </View>
              <View style={styles.switchTextWrap}>
                <Text style={styles.switchLabel}>Ponto flutuante</Text>
                <Text style={styles.switchDesc}>Cronômetro visível em 2º plano</Text>
              </View>
            </View>
            <Switch
              value={floatingEnabled}
              onValueChange={handleFloatingToggle}
              trackColor={{ false: C.switchOff, true: C.switchOn }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Histórico */}
        <Text style={styles.sectionTitle}>📋 Histórico recente</Text>

        {loadingSessions ? (
          <ActivityIndicator color={C.accent} style={{ marginTop: 20 }} />
        ) : sessions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma jornada registrada ainda.</Text>
        ) : (
          sessions.slice(0, 1).map((session) => {
            const hrs = (session.duration_seconds / 3600).toFixed(1);
            const avgPerRide = session.rides_count > 0
              ? (session.earnings / session.rides_count).toFixed(2)
              : '—';
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

      {/* Modal encerrar */}
      <Modal visible={showEndModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Encerrar Jornada</Text>
            <Text style={styles.modalSub}>Como foi o dia? Registre seus resultados.</Text>

            <View style={styles.modalDuration}>
              <Text style={styles.modalDurationVal}>{formatDuration(frozenElapsed)}</Text>
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

            <TouchableOpacity style={styles.modalBackBtn} onPress={handleCancelModal}>
              <Text style={styles.modalBackText}>← Voltar e retomar cronômetro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default JornadaScreen;