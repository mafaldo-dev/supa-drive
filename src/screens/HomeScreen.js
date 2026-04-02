import React, { useRef, useState } from 'react';

import {
  View, Text, ScrollView, TouchableOpacity,
  Switch, Dimensions, FlatList, Alert, RefreshControl,
} from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../hooks/useSubscription';

import { useHomeStyles } from '../styles/homeStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;


const HomeScreen = ({
  user, userPlan, isFloatingActive, setIsFloatingActive,
  setShowFloatingButton, setShowPlanModal, preferences, onNavigateToPreferences, onRefresh
}) => {
  
  const { isPremium } = useSubscription();
  const flatListRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const styles = useHomeStyles(isPremium);
  const { colors } = useTheme();

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh?.();
    setRefreshing(false);
  };

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
              <MaterialIcons name="tune" size={20} color={colors.accent} />
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
                      <View key={cat} style={[styles.tag, { backgroundColor: colors ? 'rgba(100,100,200,0.15)' : 'rgba(100,100,200,0.08)' }]}>
                        <Text style={[styles.tagText, { color: '#8888ff' }]}>{cat}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </>
          ) : (
            <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 24 }}>
              Nenhuma preferência configurada ainda.
            </Text>
          )}

          <TouchableOpacity style={styles.editPrefBtn} onPress={onNavigateToPreferences}>
            <MaterialIcons name="edit" size={16} color={colors.accent} />
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
              <MaterialIcons name="flash-on" size={20} color={colors.accent} />
            </View>
            <Text style={styles.slideTitle}>Funcionalidades</Text>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureLeft}>
              <View style={styles.featureIconBox}>
                <FontAwesome5 name="traffic-light" size={16} color={colors.accent} />
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
              trackColor={{ false: colors.switchOff, true: colors.switchOn }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.featureRow, { borderBottomWidth: 0 }]}>
            <View style={styles.featureLeft}>
              <View style={styles.featureIconBox}>
                <MaterialIcons name="warning" size={18} color={colors.accent} />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureName}>Alerta de Área de Risco</Text>
                <Text style={styles.featureDesc}>Notifica zonas de perigo</Text>
              </View>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.switchOff, true: colors.switchOn }}
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
          tintColor={colors.accent}
          colors={[colors.accent]}
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