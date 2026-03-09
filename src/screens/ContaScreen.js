import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import swal from 'sweetalert2';
import { useGlobalStyles } from '../styles/useGlobalStyles';
import { useTheme } from '../context/ThemeContext';
import { useMemo } from 'react';

const ContaScreen = ({ user, userPlan }) => {
  const globalStyles = useGlobalStyles();
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');

  const styles = useMemo(() => StyleSheet.create({
    editButton: {
      marginTop: 16,
      backgroundColor: colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
    },
    editButtonText: {
      color: colors.onAccent,
      fontWeight: '700',
      fontSize: 15,
    },
    editSection: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    editLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    editInput: {
      borderWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: colors.textPrimary,
      backgroundColor: colors.background,
      marginBottom: 12,
    },
    editActions: {
      flexDirection: 'row',
      gap: 8,
    },
    saveBtn: {
      flex: 1,
      backgroundColor: colors.success,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    saveBtnText: {
      color: colors.onAccent,
      fontWeight: '700',
      fontSize: 14,
    },
    cancelBtn: {
      flex: 1,
      backgroundColor: colors.declineButton,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelBtnText: {
      color: colors.textSecondary,
      fontWeight: '700',
      fontSize: 14,
    },
  }), [colors]);

  const getInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.givenName) {
      return user.givenName.charAt(0).toUpperCase();
    }
    return 'M';
  };

  const handleSave = () => {
    if (!editedName.trim()) {
      swal.fire('Erro', 'O nome não pode ser vazio', 'error');
      return;
    }
    setIsEditing(false);
    swal.fire('Sucesso', 'Perfil atualizado com sucesso!', 'success');
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setIsEditing(false);
  };

return (
    <ScrollView style={globalStyles.screen} showsVerticalScrollIndicator={false}>
      <Text style={globalStyles.screenTitle}>Minha Conta</Text>
      <View style={globalStyles.accountCard}>
        {user?.photo ? (
          <Image 
            source={{ uri: user.photo }} 
            style={globalStyles.accountAvatar}
          />
        ) : (
          <View style={globalStyles.accountAvatar}>
            <Text style={globalStyles.accountAvatarText}>{getInitials()}</Text>
          </View>
        )}
        <Text style={globalStyles.accountName}>{user?.name || 'Motorista'}</Text>
        <Text style={globalStyles.accountEmail}>{user?.email || ''}</Text>
        <View style={[globalStyles.planBadgeLarge, userPlan === 'premium' ? { backgroundColor: colors.accent } : { backgroundColor: colors.freeBadge }]}>
          <Text style={globalStyles.planBadgeLargeText}>{userPlan === 'premium' ? '⭐ PREMIUM' : 'PLANO GRÁTIS'}</Text>
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
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ContaScreen;
