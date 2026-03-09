import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useGlobalStyles } from '../styles/useGlobalStyles';
import { useSubscription } from '../hooks/useSubscription';
import { rideService } from '../services/apiService';

const CorridasScreen = () => {
  const globalStyles = useGlobalStyles();
  const { colors } = useTheme();
  const { isPremium } = useSubscription();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [formData, setFormData] = useState({
    gain_per_min: '',
    gain_per_hour: '',
    gain_per_km: '',
    passenger_min_rating: '',
    distance: '',
    duration: '',
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.headerBackground,
      paddingHorizontal: 16,
      paddingTop: 50,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    content: {
      padding: 16,
    },
    premiumBanner: {
      backgroundColor: colors.accentLight,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    premiumText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.accent,
      textAlign: 'center',
    },
    formCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    formTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 16,
      textAlign: 'center',
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.textPrimary,
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    analyzeButton: {
      backgroundColor: colors.accent,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 16,
    },
    analyzeButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    resultCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    resultTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 12,
      textAlign: 'center',
    },
    resultItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    resultLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    resultValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    recommendation: {
      backgroundColor: colors.accentLight,
      borderRadius: 8,
      padding: 12,
      marginTop: 12,
    },
    recommendationText: {
      fontSize: 14,
      color: colors.accent,
      textAlign: 'center',
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
    },
    emptyIcon: {
      marginBottom: 16,
      opacity: 0.5,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  const handleAnalyze = async () => {
    // Validar campos obrigatórios
    const requiredFields = ['gain_per_min', 'gain_per_hour', 'gain_per_km', 'passenger_min_rating', 'distance', 'duration'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await rideService.analyzeRide({
        driver_id: 1, // Será obtido do contexto do usuário
        ...formData,
        gain_per_min: parseFloat(formData.gain_per_min),
        gain_per_hour: parseFloat(formData.gain_per_hour),
        gain_per_km: parseFloat(formData.gain_per_km),
        passenger_min_rating: parseFloat(formData.passenger_min_rating),
        distance: parseFloat(formData.distance),
      });

      if (result) {
        setAnalysisResult(result);
      } else {
        Alert.alert('Erro', 'Erro ao analisar corrida');
      }
    } catch (error) {
      console.error('Erro na análise:', error);
      Alert.alert('Erro', 'Erro ao analisar corrida');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderAnalysisForm = () => (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>📊 Analisar Corrida</Text>

      <Text style={styles.label}>Ganho por minuto (R$)</Text>
      <TextInput
        style={styles.input}
        value={formData.gain_per_min}
        onChangeText={(value) => setFormData(prev => ({ ...prev, gain_per_min: value }))}
        keyboardType="numeric"
        placeholder="Ex: 2.5"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Ganho por hora (R$)</Text>
      <TextInput
        style={styles.input}
        value={formData.gain_per_hour}
        onChangeText={(value) => setFormData(prev => ({ ...prev, gain_per_hour: value }))}
        keyboardType="numeric"
        placeholder="Ex: 150"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Ganho por km (R$)</Text>
      <TextInput
        style={styles.input}
        value={formData.gain_per_km}
        onChangeText={(value) => setFormData(prev => ({ ...prev, gain_per_km: value }))}
        keyboardType="numeric"
        placeholder="Ex: 3.0"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Avaliação mínima do passageiro</Text>
      <TextInput
        style={styles.input}
        value={formData.passenger_min_rating}
        onChangeText={(value) => setFormData(prev => ({ ...prev, passenger_min_rating: value }))}
        keyboardType="numeric"
        placeholder="Ex: 4.5"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Distância (km)</Text>
      <TextInput
        style={styles.input}
        value={formData.distance}
        onChangeText={(value) => setFormData(prev => ({ ...prev, distance: value }))}
        keyboardType="numeric"
        placeholder="Ex: 15.5"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Duração (HH:MM:SS)</Text>
      <TextInput
        style={styles.input}
        value={formData.duration}
        onChangeText={(value) => setFormData(prev => ({ ...prev, duration: value }))}
        placeholder="Ex: 00:45:00"
        placeholderTextColor={colors.textSecondary}
      />

      <TouchableOpacity
        style={styles.analyzeButton}
        onPress={handleAnalyze}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.analyzeButtonText}>Analisar Corrida</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderAnalysisResult = () => (
    <View style={styles.resultCard}>
      <Text style={styles.resultTitle}>📈 Resultado da Análise</Text>

      <View style={styles.resultItem}>
        <Text style={styles.resultLabel}>Pontuação</Text>
        <Text style={styles.resultValue}>{analysisResult.score}/10</Text>
      </View>

      <View style={styles.resultItem}>
        <Text style={styles.resultLabel}>Preço por km</Text>
        <Text style={styles.resultValue}>R$ {analysisResult.price_per_km}</Text>
      </View>

      <View style={styles.recommendation}>
        <Text style={styles.recommendationText}>
          💡 {analysisResult.recommendation}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Análise de Corridas</Text>
      </View>

      <View style={styles.content}>
        {!isPremium && (
          <View style={styles.premiumBanner}>
            <Text style={styles.premiumText}>
              🚀 Faça upgrade para Premium e tenha acesso a análises avançadas de corridas!
            </Text>
          </View>
        )}

        {isPremium ? (
          <>
            {renderAnalysisForm()}
            {analysisResult && renderAnalysisResult()}
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="analytics"
              size={60}
              color={colors.border}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>
              Análises de corridas disponíveis apenas para usuários Premium.
              {'\n\n'}Faça upgrade para desbloquear esta funcionalidade!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default CorridasScreen;
