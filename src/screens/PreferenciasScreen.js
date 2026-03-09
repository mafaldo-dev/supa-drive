import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { usePreferencias } from '../hooks/usePreferencias';
import PreferenciasGerais from '../components/preferencias/PreferenciasGerais';
import DefinirMetas from '../components/preferencias/DefinirMetas';
import InformacoesVeiculo from '../components/preferencias/InformacoesVeiculo';

import { useGlobalStyles } from '../styles/useGlobalStyles';
import { useTheme } from '../context/ThemeContext';


const PreferenciasScreen = ({ navigation }) => {
  const globalStyles = useGlobalStyles();
  const { colors } = useTheme();

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
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 30,
      marginTop: 8,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 10,
      marginHorizontal: 4,
    },
    editButton: {
      backgroundColor: colors.accent,
    },
    saveButton: {
      backgroundColor: colors.success,
      flex: 2,
    },
    cancelButton: {
      backgroundColor: colors.declineButton,
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
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: '600',
    },
  }), [colors]);

const {
    preferences,
    isEditing,
    loading,
    handleEdit,
    handleCancel,
    handleSave,
    updatePreference,
    updateNestedPreference,
    formatCurrency,
  } = usePreferencias();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferências</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Preferências Gerais */}
        <PreferenciasGerais
          preferences={preferences}
          isEditing={isEditing}
          onChange={updatePreference}
          formatCurrency={formatCurrency}
        />

        {/* Definir Metas */}
        <DefinirMetas
          preferences={preferences}
          isEditing={isEditing}
          onChange={updatePreference}
          formatCurrency={formatCurrency}
        />

        {/* Informações do Veículo */}
        <InformacoesVeiculo
          preferences={preferences}
          isEditing={isEditing}
          onChange={updatePreference}
          updateNested={updateNestedPreference}
        />

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
              >
                <Text style={styles.saveButtonText}>Salvar Preferências</Text>
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
