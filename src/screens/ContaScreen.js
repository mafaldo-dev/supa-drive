import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { driverService } from '../services/apiService';

const ContaScreen = ({ user, userPlan, onUpdateName }) => {
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const colors = {
    background: isDark ? '#1a1a2e' : '#f5f5f5',
    card: isDark ? '#16213e' : '#ffffff',
    border: isDark ? '#333' : '#eee',
    textPrimary: isDark ? '#ffffff' : '#333333',
    textSecondary: isDark ? '#aaaaaa' : '#999999',
    accent: '#FF6B6B',
    success: '#4CAF50',
    input: isDark ? '#0f3460' : '#f9f9f9',
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    screen: { flex: 1, padding: 16 },
    screenTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 20 },
    accountCard: {
      backgroundColor: colors.card, borderRadius: 16, padding: 24,
      alignItems: 'center', marginBottom: 16,
    },
    accountAvatar: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    accountAvatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
    accountName: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
    accountEmail: { fontSize: 14, color: colors.textSecondary, marginBottom: 12 },
    planBadge: {
      paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 16,
    },
    planBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
    editButton: {
      backgroundColor: colors.accent, paddingVertical: 12,
      paddingHorizontal: 24, borderRadius: 8, alignItems: 'center',
    },
    editButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    editSection: {
      backgroundColor: colors.card, borderRadius: 12,
      padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border,
    },
    editLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
    editInput: {
      borderWidth: 1, borderColor: colors.border, borderRadius: 8,
      paddingHorizontal: 12, paddingVertical: 10, fontSize: 16,
      color: colors.textPrimary, backgroundColor: colors.input, marginBottom: 12,
    },
    editActions: { flexDirection: 'row', gap: 8 },
    saveBtn: { flex: 1, backgroundColor: colors.success, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    cancelBtn: { flex: 1, backgroundColor: '#aaa', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    cancelBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  });

  const getInitials = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.givenName) return user.givenName.charAt(0).toUpperCase();
    return 'M';
  };

  const handleSave = async () => {
    if (!editedName.trim()) {
      Alert.alert('Erro', 'O nome não pode ser vazio');
      return;
    }
    setIsSaving(true);
    try {
      const result = await driverService.updateProfile(editedName.trim());
      if (result) {
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        setIsEditing(false);
        if (onUpdateName) onUpdateName(editedName.trim());
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o perfil');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.screen}>
        <Text style={styles.screenTitle}>Minha Conta</Text>

        <View style={styles.accountCard}>
          {user?.photo ? (
            <Image source={{ uri: user.photo }} style={styles.accountAvatar} />
          ) : (
            <View style={styles.accountAvatar}>
              <Text style={styles.accountAvatarText}>{getInitials()}</Text>
            </View>
          )}
          <Text style={styles.accountName}>{user?.name || 'Motorista'}</Text>
          <Text style={styles.accountEmail}>{user?.email || ''}</Text>
          <View style={[styles.planBadge, { backgroundColor: userPlan === 'premium' ? colors.accent : '#999' }]}>
            <Text style={styles.planBadgeText}>{userPlan === 'premium' ? '⭐ PREMIUM' : 'PLANO GRÁTIS'}</Text>
          </View>

          {!isEditing && (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.editButtonText}>✏️ Editar Perfil</Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditing && (
          <View style={styles.editSection}>
            <Text style={styles.editLabel}>Nome</Text>
            <TextInput
              style={styles.editInput}
              placeholder="Seu nome"
              value={editedName}
              onChangeText={setEditedName}
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
                {isSaving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>Salvar</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ContaScreen;