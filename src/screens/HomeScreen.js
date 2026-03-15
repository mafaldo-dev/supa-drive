import React, { useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Switch, StyleSheet, Dimensions, FlatList, Alert, RefreshControl,
} from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../hooks/useSubscription';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

const HomeScreen = ({
  user, userPlan, isFloatingActive, setIsFloatingActive,
  setShowFloatingButton, setShowPlanModal, preferences, onNavigateToPreferences, onRefresh
}) => {
  const { isDark } = useTheme();
  const { isPremium } = useSubscription();
  const flatListRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh?.();
    setRefreshing(false);
  };

  const C = {
    bg: isDark ? '#0d0d14' : '#f0f0f7',
    card: isDark ? '#1a1a2e' : '#ffffff',
    card2: isDark ? '#16213e' : '#f8f8ff',
    accent: '#FF6B6B',
    accentSoft: isDark ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.08)',
    gold: '#FFD700',
    green: '#4ade80',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a2e',
    textSecondary: isDark ? '#8888aa' : '#888899',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    switchOn: '#FF6B6B',
    switchOff: isDark ? '#333' : '#ddd',
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    content: { padding: 16, paddingBottom: 32 },

    // Boas vindas
    welcomeRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 24,
    },
    welcomeLeft: { flex: 1 },
    greetingText: { fontSize: 15, color: C.textSecondary, fontWeight: '500', marginBottom: 4 },
    nameText: { fontSize: 28, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.5 },
    planBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: isPremium ? 'rgba(255,215,0,0.15)' : C.accentSoft,
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
      borderWidth: 1, borderColor: isPremium ? 'rgba(255,215,0,0.3)' : 'rgba(255,107,107,0.2)',
    },
    planBadgeText: {
      fontSize: 13, fontWeight: '700',
      color: isPremium ? C.gold : C.accent,
    },

    // Status assinatura
    subCard: {
      backgroundColor: isPremium ? 'rgba(74,222,128,0.08)' : C.accentSoft,
      borderRadius: 16, padding: 18, marginBottom: 24,
      borderWidth: 1, borderColor: isPremium ? 'rgba(74,222,128,0.2)' : 'rgba(255,107,107,0.15)',
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    subCardLeft: { flex: 1 },
    subCardTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 4 },
    subCardSub: { fontSize: 13, color: C.textSecondary },
    subCardBtn: {
      backgroundColor: C.accent, borderRadius: 10,
      paddingHorizontal: 16, paddingVertical: 10,
    },
    subCardBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

    // Carrossel
    carouselLabel: {
      fontSize: 13, fontWeight: '600', color: C.textSecondary,
      letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12,
    },
    slide: {
      width: CARD_WIDTH, backgroundColor: C.card,
      borderRadius: 20, padding: 24,
      borderWidth: 1, borderColor: C.border,
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 12, elevation: 5,
    },
    slideHeader: {
      flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20,
    },
    slideIconBox: {
      width: 42, height: 42, borderRadius: 12,
      backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center',
    },
    slideTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary },

    // Preferências grid
    prefGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
    prefCell: {
      width: '31%', backgroundColor: C.card2,
      borderRadius: 12, padding: 12,
      borderWidth: 1, borderColor: C.border,
      alignItems: 'flex-start',
    },
    prefCellLabel: { fontSize: 11, color: C.textSecondary, marginBottom: 6 },
    prefCellValue: { fontSize: 15, fontWeight: '800', color: C.accent },
    prefSectionTitle: { fontSize: 12, fontWeight: '700', color: C.textSecondary, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 14, marginBottom: 8 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
    tag: {
      backgroundColor: C.accentSoft, borderRadius: 8,
      paddingHorizontal: 12, paddingVertical: 6,
    },
    tagText: { color: C.accent, fontSize: 12, fontWeight: '600' },
    editPrefBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 6, marginTop: 16, backgroundColor: C.accentSoft,
      borderRadius: 12, paddingVertical: 12,
    },
    editPrefBtnText: { color: C.accent, fontWeight: '700', fontSize: 14 },

    // Funcionalidades
    featureRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', paddingVertical: 16,
      borderBottomWidth: 1, borderBottomColor: C.border,
    },
    featureLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
    featureIconBox: {
      width: 42, height: 42, borderRadius: 12,
      backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center',
    },
    featureTextWrap: { flex: 1 },
    featureName: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
    featureDesc: { fontSize: 12, color: C.textSecondary, marginTop: 2 },

    // Upgrade
    upgradeGradient: { alignItems: 'center' },
    upgradeEmoji: { fontSize: 44, marginBottom: 12 },
    upgradeTitle: { fontSize: 20, fontWeight: '800', color: C.textPrimary, textAlign: 'center', marginBottom: 8 },
    upgradeSub: { fontSize: 14, color: C.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    upgradeFeatures: { width: '100%', gap: 10, marginBottom: 24 },
    upgradeFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    upgradeFeatureText: { fontSize: 14, color: C.textPrimary },
    upgradeBtn: {
      backgroundColor: C.accent, borderRadius: 14,
      paddingVertical: 16, paddingHorizontal: 32, width: '100%', alignItems: 'center',
    },
    upgradeBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    upgradePrice: { fontSize: 12, color: C.textSecondary, marginTop: 10 },

    // Dots
    dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 16 },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.border },
    dotActive: { width: 22, height: 7, borderRadius: 4, backgroundColor: C.accent },

    // Resumo financeiro
    summaryCard: {
      backgroundColor: C.card, borderRadius: 20, padding: 22, marginTop: 24,
      borderWidth: 1, borderColor: C.border,
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 12, elevation: 5,
    },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
    summaryIconBox: {
      width: 42, height: 42, borderRadius: 12,
      backgroundColor: 'rgba(74,222,128,0.12)', alignItems: 'center', justifyContent: 'center',
    },
    summaryTitle: { fontSize: 17, fontWeight: '700', color: C.textPrimary },
    summaryRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border,
    },
    summaryRowLabel: { fontSize: 14, color: C.textSecondary },
    summaryRowValue: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
    summaryRowNeg: { fontSize: 14, fontWeight: '600', color: '#f87171' },
    summaryTotal: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: 'rgba(74,222,128,0.08)', borderRadius: 14, padding: 16,
      borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)', marginTop: 8,
    },
    summaryTotalLabel: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
    summaryTotalValue: { fontSize: 22, fontWeight: '800', color: '#4ade80' },
    summaryNote: { fontSize: 12, color: C.textSecondary, textAlign: 'center', marginTop: 14, fontStyle: 'italic' },
  });

  const getApps = () => {
    if (!preferences?.apps) return [];
    if (Array.isArray(preferences.apps)) return preferences.apps;
    try { return JSON.parse(preferences.apps); } catch { return []; }
  };

  const getCategories = () => {
    if (!preferences?.categories) return [];
    if (Array.isArray(preferences.categories)) return preferences.categories;
    try { return JSON.parse(preferences.categories); } catch { return []; }
  };

  const calcSummary = () => {
    if (!preferences) return null;
    const metaDiaria = parseFloat(preferences.target_day) || 0;
    const combustivelDia = parseFloat(preferences.fuel_day_cost) || 0;
    const ownership = preferences.car_ownership || 'proprio';
    const paymentValue = parseFloat(preferences.car_payment_value) || 0;
    const paymentType = preferences.car_payment_type || 'semanal';
    let custoCarro = 0;
    if (ownership === 'alugado') {
      custoCarro = paymentType === 'semanal' ? paymentValue / 7 : paymentValue / 30;
    } else if (ownership === 'financiado') {
      custoCarro = paymentValue / 30;
    }
    const totalCustos = combustivelDia + custoCarro;
    const lucroLiquido = metaDiaria - totalCustos;
    return { metaDiaria, combustivelDia, custoCarro, totalCustos, lucroLiquido, ownership, paymentValue };
  };

  const summary = calcSummary();
  const fmt2 = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const slides = [
    {
      key: 'preferences',
      render: () => (
        <View style={styles.slide}>
          <View style={styles.slideHeader}>
            <View style={styles.slideIconBox}>
              <MaterialIcons name="tune" size={20} color={C.accent} />
            </View>
            <Text style={styles.slideTitle}>Preferências</Text>
          </View>

          {preferences ? (
            <>
              <Text style={styles.prefSectionTitle}>🎯 Metas</Text>
              <View style={styles.prefGrid}>
                <View style={styles.prefCell}>
                  <Text style={styles.prefCellLabel}>Meta diária</Text>
                  <Text style={styles.prefCellValue}>R${Number(preferences.target_day || 0).toFixed(0)}</Text>
                </View>
                <View style={styles.prefCell}>
                  <Text style={styles.prefCellLabel}>Meta semanal</Text>
                  <Text style={styles.prefCellValue}>R${Number(preferences.target_week || 0).toFixed(0)}</Text>
                </View>
                <View style={styles.prefCell}>
                  <Text style={styles.prefCellLabel}>Ganho/hora</Text>
                  <Text style={styles.prefCellValue}>R${Number(preferences.target_hour_profit || 0).toFixed(0)}</Text>
                </View>
                <View style={styles.prefCell}>
                  <Text style={styles.prefCellLabel}>Rate mínimo</Text>
                  <Text style={styles.prefCellValue}>⭐{preferences.passenger_min_rating || '—'}</Text>
                </View>
              </View>

              <Text style={styles.prefSectionTitle}>🚗 Veículo</Text>
              <View style={styles.prefGrid}>
                <View style={styles.prefCell}>
                  <Text style={styles.prefCellLabel}>Modelo</Text>
                  <Text style={styles.prefCellValue} numberOfLines={1}>{preferences.car_model || '—'}</Text>
                </View>
                <View style={styles.prefCell}>
                  <Text style={styles.prefCellLabel}>Tipo</Text>
                  <Text style={styles.prefCellValue}>{preferences.car_type || '—'}</Text>
                </View>
                <View style={styles.prefCell}>
                  <Text style={styles.prefCellLabel}>Situação</Text>
                  <Text style={styles.prefCellValue}>{preferences.car_ownership === 'alugado' ? 'Alugado' : 'Próprio'}</Text>
                </View>
                <View style={styles.prefCell}>
                  <Text style={styles.prefCellLabel}>Consumo</Text>
                  <Text style={styles.prefCellValue}>{preferences.fuel_km_avg || '—'}km/l</Text>
                </View>
                <View style={styles.prefCell}>
                  <Text style={styles.prefCellLabel}>Comb./dia</Text>
                  <Text style={styles.prefCellValue}>R${Number(preferences.fuel_day_cost || 0).toFixed(0)}</Text>
                </View>
                {preferences.car_ownership === 'alugado' && preferences.rent_week ? (
                  <View style={styles.prefCell}>
                    <Text style={styles.prefCellLabel}>Aluguel/sem</Text>
                    <Text style={styles.prefCellValue}>R${Number(preferences.rent_week).toFixed(0)}</Text>
                  </View>
                ) : null}
              </View>

              {getApps().length > 0 && (
                <>
                  <Text style={styles.prefSectionTitle}>📱 Apps & Categorias</Text>
                  <View style={styles.tagsRow}>
                    {getApps().map(app => (
                      <View key={app} style={styles.tag}>
                        <Text style={styles.tagText}>{app}</Text>
                      </View>
                    ))}
                    {getCategories().map(cat => (
                      <View key={cat} style={[styles.tag, { backgroundColor: isDark ? 'rgba(100,100,200,0.15)' : 'rgba(100,100,200,0.08)' }]}>
                        <Text style={[styles.tagText, { color: '#8888ff' }]}>{cat}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </>
          ) : (
            <Text style={{ color: C.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 24 }}>
              Nenhuma preferência configurada ainda.
            </Text>
          )}

          <TouchableOpacity style={styles.editPrefBtn} onPress={onNavigateToPreferences}>
            <MaterialIcons name="edit" size={16} color={C.accent} />
            <Text style={styles.editPrefBtnText}>Editar Preferências</Text>
          </TouchableOpacity>
        </View>
      )
    },
    {
      key: 'features',
      render: () => (
        <View style={styles.slide}>
          <View style={styles.slideHeader}>
            <View style={styles.slideIconBox}>
              <MaterialIcons name="flash-on" size={20} color={C.accent} />
            </View>
            <Text style={styles.slideTitle}>Funcionalidades</Text>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureLeft}>
              <View style={styles.featureIconBox}>
                <FontAwesome5 name="traffic-light" size={16} color={C.accent} />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureName}>Semáforo Automático</Text>
                <Text style={styles.featureDesc}>Analisa corridas em tempo real</Text>
              </View>
            </View>
            <Switch
              value={isFloatingActive}
              onValueChange={(value) => {
                if (value && userPlan === 'free') {
                  Alert.alert(
                    'Recurso Premium',
                    'O semáforo automático está disponível apenas no plano Premium.',
                    [
                      { text: 'Agora não', style: 'cancel' },
                      { text: 'Ver planos', onPress: () => setShowPlanModal(true) }
                    ]
                  );
                } else {
                  setIsFloatingActive(value);
                  setShowFloatingButton(value);
                }
              }}
              trackColor={{ false: C.switchOff, true: C.switchOn }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.featureRow, { borderBottomWidth: 0 }]}>
            <View style={styles.featureLeft}>
              <View style={styles.featureIconBox}>
                <MaterialIcons name="warning" size={18} color={C.accent} />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureName}>Alerta de Área de Risco</Text>
                <Text style={styles.featureDesc}>Notifica zonas de perigo</Text>
              </View>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: C.switchOff, true: C.switchOn }}
              thumbColor="#fff"
            />
          </View>
        </View>
      )
    },
    {
      key: 'upgrade',
      render: () => (
        <View style={styles.slide}>
          <View style={styles.upgradeGradient}>
            <Text style={styles.upgradeEmoji}>⭐</Text>
            <Text style={styles.upgradeTitle}>Seja Premium</Text>
            <Text style={styles.upgradeSub}>
              Desbloqueie todos os recursos e maximize seus ganhos como motorista.
            </Text>
            <View style={styles.upgradeFeatures}>
              {[
                '🚦 Semáforo automático de corridas',
                '📊 Relatórios detalhados de ganhos',
                '🗺️ Alertas de áreas de risco',
                '🤖 Análise inteligente de corridas',
              ].map((f, i) => (
                <View key={i} style={styles.upgradeFeatureRow}>
                  <Text style={styles.upgradeFeatureText}>{f}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.upgradeBtn} onPress={() => setShowPlanModal(true)}>
              <Text style={styles.upgradeBtnText}>Ver Planos</Text>
            </TouchableOpacity>
            <Text style={styles.upgradePrice}>A partir de R$ 19,90/mês</Text>
          </View>
        </View>
      )
    }
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={C.accent}
          colors={[C.accent]}
        />
      }
    >
      {/* Boas vindas */}
      <View style={styles.welcomeRow}>
        <View style={styles.welcomeLeft}>
          <Text style={styles.greetingText}>Bom trabalho hoje 👋</Text>
          <Text style={styles.nameText}>{user?.name?.split(' ')[0] || 'Motorista'}</Text>
        </View>
        <View style={styles.planBadge}>
          <Text style={{ fontSize: 14 }}>{isPremium ? '⭐' : '🚗'}</Text>
          <Text style={styles.planBadgeText}>{isPremium ? 'Premium' : 'Grátis'}</Text>
        </View>
      </View>

      {/* Status assinatura */}
      <View style={styles.subCard}>
        <View style={styles.subCardLeft}>
          <Text style={styles.subCardTitle}>
            {isPremium ? '✅ Plano Premium ativo' : '🚀 Faça upgrade agora'}
          </Text>
          <Text style={styles.subCardSub}>
            {isPremium
              ? 'Aproveite todos os recursos disponíveis!'
              : 'Desbloqueie análises avançadas e mais.'
            }
          </Text>
        </View>
        {!isPremium && (
          <TouchableOpacity style={styles.subCardBtn} onPress={() => setShowPlanModal(true)}>
            <Text style={styles.subCardBtnText}>Ver planos</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Carrossel */}
      <Text style={styles.carouselLabel}>Visão geral</Text>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.key}
        renderItem={({ item }) => item.render()}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
          setActiveSlide(index);
        }}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              flatListRef.current?.scrollToIndex({ index: i, animated: true });
              setActiveSlide(i);
            }}
          >
            <View style={i === activeSlide ? styles.dotActive : styles.dot} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Resumo Financeiro Diário */}
      {summary && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconBox}>
              <MaterialIcons name="calculate" size={20} color="#4ade80" />
            </View>
            <Text style={styles.summaryTitle}>Resumo do Dia</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>🎯 Meta de lucro diário</Text>
            <Text style={styles.summaryRowValue}>{fmt2(summary.metaDiaria)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>⛽ Combustível/dia</Text>
            <Text style={styles.summaryRowNeg}>- {fmt2(summary.combustivelDia)}</Text>
          </View>

          {summary.custoCarro > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryRowLabel}>
                {summary.ownership === 'financiado' ? '💳 Financiamento/dia' : '🔑 Aluguel/dia'}
              </Text>
              <Text style={styles.summaryRowNeg}>- {fmt2(summary.custoCarro)}</Text>
            </View>
          )}

          <View style={styles.summaryTotal}>
            <Text style={styles.summaryTotalLabel}>💰 Lucro líquido/dia</Text>
            <Text style={[styles.summaryTotalValue, { color: summary.lucroLiquido >= 0 ? '#4ade80' : '#f87171' }]}>
              {fmt2(summary.lucroLiquido)}
            </Text>
          </View>

          <Text style={styles.summaryNote}>
            Meta diária menos os custos do veículo e combustível
          </Text>
        </View>
      )}

    </ScrollView>
  );
};

export default HomeScreen;