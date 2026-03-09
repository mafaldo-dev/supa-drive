import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { loadPreferences, savePreferences, DEFAULT_PREFERENCES } from '../services/preferenciasService.js';

export const usePreferencias = () => {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [originalPreferences, setOriginalPreferences] = useState(DEFAULT_PREFERENCES);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    setLoading(true);
    const loaded = await loadPreferences();
    setPreferences(loaded);
    setOriginalPreferences(loaded);
    setLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setPreferences(originalPreferences);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const success = await savePreferences(preferences);
    if (success) {
      setOriginalPreferences(preferences);
      setIsEditing(false);
      Alert.alert('Sucesso', 'Preferências salvas com sucesso!', 'success');
    } else {
      Alert.alert('Erro', 'Não foi possível salvar as preferências.', 'error');
    }
  };

  const updatePreference = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedPreference = (category, newValues) => {
    setPreferences(prev => ({
      ...prev,
      [category]: newValues
    }));
  };

  const formatCurrency = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    
    const floatValue = parseFloat(numbers) / 100;
    return floatValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return {
    preferences,
    isEditing,
    loading,
    handleEdit,
    handleCancel,
    handleSave,
    updatePreference,
    updateNestedPreference,
    formatCurrency,
  };
};
