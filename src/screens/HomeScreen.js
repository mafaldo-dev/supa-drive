import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import swal from 'sweetalert2';
import { useGlobalStyles } from '../styles/useGlobalStyles';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../hooks/useSubscription';
import { useMemo } from 'react';

const HomeScreen = ({ user, userPlan, isFloatingActive, setIsFloatingActive, setShowFloatingButton, setShowPlanModal, preferences, onNavigateToPreferences }) => {
  const globalStyles = useGlobalStyles();
  const { colors } = useTheme();
  const { isPremium, subscription } = useSubscription();

  const styles = useMemo(() => StyleSheet.create({
    preferencesCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 20,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    preferencesTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 15,
    },
    preferenceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    preferenceLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    preferenceValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.accent,
    },
    appsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 10,
    },
    appTag: {
      backgroundColor: colors.accentLight,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    appTagText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '600',
    },
    editPreferencesBtn: {
      marginTop: 14,
      backgroundColor: colors.accent,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    editPreferencesBtnText: {
      color: colors.onAccent,
      fontWeight: '700',
      fontSize: 14,
    },
  }), [colors]);

  const getSelectedApps = () => {
    if (!preferences?.appsUsados) return [];
    return Object.entries(preferences.appsUsados)
      .filter(([_, value]) => value)
      .map(([key]) => key);
  };

  const getSelectedCategories = () => {
    if (!preferences?.categorias) return [];
    return Object.entries(preferences.categorias)
      .filter(([_, value]) => value)
      .map(([key]) => key);
  };

  const selectedApps = getSelectedApps();
  const selectedCategories = getSelectedCategories();

  return (
    <ScrollView style={globalStyles.screen} showsVerticalScrollIndicator={false}>
      <View style={globalStyles.welcomeCard}>
        <Text style={globalStyles.welcomeTitle}>Olá, {user?.name?.split(' ')[0] || 'Motorista'}!</Text>
        <Text style={globalStyles.welcomeSubtitle}>Bom trabalho hoje 🚗</Text>
      </View>

      {/* Status da Assinatura */}
      <View style={[styles.preferencesCard, {
        backgroundColor: isPremium ? colors.accentLight : colors.cardBackground,
        borderWidth: 1,
        borderColor: isPremium ? colors.accent : colors.border
      }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={[styles.preferencesTitle, { marginBottom: 0 }]}>
            {isPremium ? '🎉 Plano Premium Ativo' : '🚀 Faça Upgrade'}
          </Text>
          <View style={{
            backgroundColor: isPremium ? '#4CAF50' : colors.accent,
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 4
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
              {isPremium ? 'ATIVO' : 'GRÁTIS'}
            </Text>
          </View>
        </View>

        {isPremium ? (
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            Aproveite todos os recursos premium disponíveis no app!
          </Text>
        ) : (
          <View>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>
              Desbloqueie análises avançadas, relatórios detalhados e muito mais!
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.accent,
                borderRadius: 8,
                padding: 12,
                alignItems: 'center'
              }}
              onPress={() => setShowPlanModal(true)}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                Ver Planos Premium
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={globalStyles.statsCard}>
        <Text style={globalStyles.statsTitle}>Resumo de Hoje</Text>
        <View style={globalStyles.statsGrid}>
          {[
            { value: 'R$ 247,50', label: 'Ganhos' },
            { value: '12', label: 'Corridas' },
            { value: '8h', label: 'Online' }
          ].map((s, i) => (
            <View key={i} style={globalStyles.statItem}>
              <Text style={globalStyles.statValue}>{s.value}</Text>
              <Text style={globalStyles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {preferences && (
        <View style={styles.preferencesCard}>
          <Text style={styles.preferencesTitle}>Suas Preferências</Text>
          
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>💰 Ganho por minuto</Text>
            <Text style={styles.preferenceValue}>R$ {preferences.ganhoPorMinuto || '0,00'}</Text>
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>⏱️ Ganho por hora</Text>
            <Text style={styles.preferenceValue}>R$ {preferences.ganhoPorHora || '0,00'}</Text>
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>📍 Ganho por km</Text>
            <Text style={styles.preferenceValue}>R$ {preferences.ganhoPorKm || '0,00'}</Text>
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>⬇️ Rate mínimo</Text>
            <Text style={styles.preferenceValue}>R$ {preferences.rateMinimo || '0,00'}</Text>
          </View>

          {selectedApps.length > 0 && (
            <View style={[styles.preferenceRow, { borderBottomWidth: 0, paddingBottom: 8 }]}>
              <Text style={styles.preferenceLabel}>📱 Plataformas</Text>
              <View style={styles.appsContainer}>
                {selectedApps.map(app => (
                  <View key={app} style={styles.appTag}>
                    <Text style={styles.appTagText}>{app}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {selectedCategories.length > 0 && (
            <View style={[styles.preferenceRow, { borderBottomWidth: 0, paddingTop: 12 }]}>
              <Text style={styles.preferenceLabel}>🏆 Categorias</Text>
              <View style={styles.appsContainer}>
                {selectedCategories.map(cat => (
                  <View key={cat} style={styles.appTag}>
                    <Text style={styles.appTagText}>{cat}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={styles.editPreferencesBtn}
            onPress={onNavigateToPreferences}
          >
            <MaterialIcons name="edit" size={16} color={colors.onAccent} />
            <Text style={styles.editPreferencesBtnText}>Editar Preferências</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={globalStyles.featuresCard}>
        <Text style={globalStyles.featuresTitle}>Funcionalidades</Text>
        <View style={globalStyles.featureItem}>
          <View style={globalStyles.featureInfo}>
            <FontAwesome5 name="traffic-light" size={20} color={colors.accent} />
            <Text style={globalStyles.featureText}>Semáforo Automático</Text>
          </View>
          <Switch
            value={isFloatingActive}
            onValueChange={(value) => {
              if (value && userPlan === 'free') {
                swal.fire({
                  title: 'Plano Gratuito',
                  text: 'Disponível apenas no Premium.',
                  icon: 'info',
                  showCancelButton: true,
                  confirmButtonText: 'Ver planos',
                  cancelButtonText: 'Agora não',
                  confirmButtonColor: '#FF6B6B',
                }).then((result) => {
                  if (result.isConfirmed) {
                    setShowPlanModal(true);
                  }
                });
              } else {
                setIsFloatingActive(value);
                setShowFloatingButton(value);
              }
            }}
            trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
            thumbColor={isFloatingActive ? colors.switchThumb : colors.declineButton}
          />
        </View>
        <View style={globalStyles.featureItem}>
          <View style={globalStyles.featureInfo}>
            <MaterialIcons name="warning" size={20} color={colors.accent} />
            <Text style={globalStyles.featureText}>Alerta de Área de Risco</Text>
          </View>
          <Switch value={true} onValueChange={() => {}} trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }} thumbColor={colors.switchThumb} />
        </View>
      </View>

      {userPlan === 'free' && (
        <TouchableOpacity style={globalStyles.upgradeBanner} onPress={() => setShowPlanModal(true)}>
          <View>
            <Text style={globalStyles.upgradeBannerTitle}>Desbloqueie o Semáforo Automático!</Text>
            <Text style={globalStyles.upgradeBannerSubtitle}>A partir de R$ 14,90/mês</Text>
          </View>
          <MaterialIcons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default HomeScreen;
