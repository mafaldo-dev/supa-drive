import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput, // 👈 IMPORTANTE: Estava faltando!
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useGlobalStyles } from '../styles/useGlobalStyles';
import { useTheme } from '../context/ThemeContext';
import { useDriverSettings } from '../hooks/useSubscription'; // ou usePreferencias, escolha UM

const PreferenciasScreen = ({ navigation }) => {
  const globalStyles = useGlobalStyles();
  const { colors } = useTheme();
  const { settings, isLoading, updateSettings } = useDriverSettings();

  const [formData, setFormData] = useState({
    target_day: settings?.target_day || 150,
    target_week: settings?.target_week || 1000,
    target_hour_profit: settings?.target_hour_profit || 25,
    apps: settings?.apps || [],
    categories: settings?.categories || [],
    car_model: settings?.car_model || '',
    fuel_km_avg: settings?.fuel_km_avg || 12,
    car_type: settings?.car_type || '',
    rent_week: settings?.rent_week || null,
    fuel_day_cost: settings?.fuel_day_cost || 50,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 50,
      paddingBottom: 16,
      backgroundColor: colors.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    content: {
      padding: 16,
    },
    section: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 16,
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
    inputDisabled: {
      opacity: 0.7,
      backgroundColor: colors.cardBackground,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    value: {
      fontSize: 16,
      color: colors.textPrimary,
      marginBottom: 12,
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      marginBottom: 30,
      gap: 8,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 10,
    },
    editButton: {
      backgroundColor: colors.accent,
    },
    saveButton: {
      backgroundColor: colors.success || '#4CAF50',
      flex: 2,
    },
    cancelButton: {
      backgroundColor: colors.declineButton || '#f44336',
      flex: 1,
    },
    editButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    saveButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
    },
  }), [colors]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateSettings(formData);
      if (result?.success) {
        Alert.alert('Sucesso', 'Configurações salvas com sucesso!');
        setIsEditing(false);
      } else {
        Alert.alert('Erro', result?.message || 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      target_day: settings?.target_day || 150,
      target_week: settings?.target_week || 1000,
      target_hour_profit: settings?.target_hour_profit || 25,
      apps: settings?.apps || [],
      categories: settings?.categories || [],
      car_model: settings?.car_model || '',
      fuel_km_avg: settings?.fuel_km_avg || 12,
      car_type: settings?.car_type || '',
      rent_week: settings?.rent_week || null,
      fuel_day_cost: settings?.fuel_day_cost || 50,
    });
    setIsEditing(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferências</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Metas Financeiras */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Metas Financeiras</Text>

          <Text style={styles.label}>Meta diária</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.target_day.toString()}
              onChangeText={(value) => setFormData(prev => ({ 
                ...prev, 
                target_day: value ? parseFloat(value) : 0 
              }))}
              keyboardType="numeric"
              placeholder="Ex: 150"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={styles.value}>{formatCurrency(formData.target_day)}</Text>
          )}

          <Text style={styles.label}>Meta semanal</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.target_week.toString()}
              onChangeText={(value) => setFormData(prev => ({ 
                ...prev, 
                target_week: value ? parseFloat(value) : 0 
              }))}
              keyboardType="numeric"
              placeholder="Ex: 1000"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={styles.value}>{formatCurrency(formData.target_week)}</Text>
          )}

          <Text style={styles.label}>Ganho por hora desejado</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.target_hour_profit.toString()}
              onChangeText={(value) => setFormData(prev => ({ 
                ...prev, 
                target_hour_profit: value ? parseFloat(value) : 0 
              }))}
              keyboardType="numeric"
              placeholder="Ex: 25"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={styles.value}>{formatCurrency(formData.target_hour_profit)}</Text>
          )}
        </View>

        {/* Informações do Veículo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚗 Informações do Veículo</Text>

          <Text style={styles.label}>Modelo do carro</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.car_model}
              onChangeText={(value) => setFormData(prev => ({ ...prev, car_model: value }))}
              placeholder="Ex: Honda Civic"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={styles.value}>{formData.car_model || 'Não informado'}</Text>
          )}

          <Text style={styles.label}>Tipo de carro</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.car_type}
              onChangeText={(value) => setFormData(prev => ({ ...prev, car_type: value }))}
              placeholder="Ex: sedan, hatch, SUV"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={styles.value}>{formData.car_type || 'Não informado'}</Text>
          )}

          <Text style={styles.label}>Consumo (km/litro)</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.fuel_km_avg.toString()}
              onChangeText={(value) => setFormData(prev => ({ 
                ...prev, 
                fuel_km_avg: value ? parseFloat(value) : 0 
              }))}
              keyboardType="numeric"
              placeholder="Ex: 12"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={styles.value}>{formData.fuel_km_avg} km/l</Text>
          )}

          <Text style={styles.label}>Custo diário combustível</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.fuel_day_cost.toString()}
              onChangeText={(value) => setFormData(prev => ({ 
                ...prev, 
                fuel_day_cost: value ? parseFloat(value) : 0 
              }))}
              keyboardType="numeric"
              placeholder="Ex: 50"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={styles.value}>{formatCurrency(formData.fuel_day_cost)}</Text>
          )}

          <Text style={styles.label}>Aluguel semanal (opcional)</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.rent_week?.toString() || ''}
              onChangeText={(value) => setFormData(prev => ({ 
                ...prev, 
                rent_week: value ? parseFloat(value) : null 
              }))}
              keyboardType="numeric"
              placeholder="Ex: 300"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={styles.value}>
              {formData.rent_week ? formatCurrency(formData.rent_week) : 'Não informado'}
            </Text>
          )}
        </View>

        {/* Botões de ação */}
        <View style={styles.buttonContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar Preferências</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={handleEdit}
            >
              <MaterialIcons name="edit" size={20} color="#FFF" />
              <Text style={styles.editButtonText}>Editar Preferências</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default PreferenciasScreen;