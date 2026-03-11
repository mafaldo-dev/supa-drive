import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  Image, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { BACKEND_URL } from '../utils/constants';
import { STORAGE_KEYS } from '../utils/storage';
import { driverService } from '../services/apiService';

const ContaScreen = ({ user, userPlan, onLogout, onUpgradeClick }) => {
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  const C = {
    bg: isDark ? '#0d0d14' : '#f0f0f7',
    card: isDark ? '#1a1a2e' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a2e',
    textSecondary: isDark ? '#8888aa' : '#888899',
    accent: '#FF6B6B',
    green: '#4ade80',
    yellow: '#facc15',
    input: isDark ? '#16213e' : '#f8f8ff',
    accentSoft: isDark ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.08)',
    greenSoft: isDark ? 'rgba(74,222,128,0.12)' : 'rgba(74,222,128,0.1)',
  };

  useEffect(() => {
    loadStats();
    loadSubscription();
  }, []);

  const loadStats = async () => {
    try {
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      const res = await fetch(`${BACKEND_URL}/api/sessions/${driverId}?days=365`);
      if (res.ok) {
        const sessions = await res.json();
        const totalGanhos = sessions.reduce((a, s) => a + (parseFloat(s.earnings) || 0), 0);
        const totalCorridas = sessions.reduce((a, s) => a + (parseInt(s.rides_count) || 0), 0);
        const totalJornadas = sessions.length;
        const totalHoras = sessions.reduce((a, s) => a + (parseInt(s.duration_seconds) || 0), 0) / 3600;
        setStats({ totalGanhos, totalCorridas, totalJornadas, totalHoras });
      }
    } catch (e) {
      console.log('Erro ao carregar stats:', e);
    }
  };

  const loadSubscription = async () => {
    try {
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      const res = await fetch(`${BACKEND_URL}/api/subscriptions/status/${driverId}`);
      if (res.ok) {
        const data = await res.json();
        setSubscriptionInfo(data);
      }
    } catch (e) {}
  };

  const getInitials = () => {
    const name = user?.name || user?.givenName || '';
    return name ? name.charAt(0).toUpperCase() : 'M';
  };

  const formatCurrency = (val) =>
    `R$ ${parseFloat(val || 0).toFixed(2).replace('.', ',')}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
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
        Alert.alert('Sucesso', 'Nome atualizado!');
        setIsEditing(false);
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar');
      }
    } catch (e) {
      Alert.alert('Erro', 'Erro de conexão');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const daysLeft = () => {
    if (!subscriptionInfo?.end_date) return null;
    const diff = new Date(subscriptionInfo.end_date) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const dias = daysLeft();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontSize: 22, fontWeight: '800', color: C.textPrimary, marginBottom: 20 }}>
        Minha Conta
      </Text>

      {/* Avatar + info */}
      <View style={{
        backgroundColor: C.card, borderRadius: 20, padding: 24,
        alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: C.border,
      }}>
        {user?.photo ? (
          <Image source={{ uri: user.photo }} style={{ width: 84, height: 84, borderRadius: 42, marginBottom: 12 }} />
        ) : (
          <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 34, fontWeight: '800', color: '#fff' }}>{getInitials()}</Text>
          </View>
        )}

        {isEditing ? (
          <View style={{ width: '100%', marginBottom: 12 }}>
            <TextInput
              style={{ backgroundColor: C.input, borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, color: C.textPrimary, textAlign: 'center', marginBottom: 10 }}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Seu nome"
              placeholderTextColor={C.textSecondary}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={handleSave} disabled={isSaving} style={{ flex: 1, backgroundColor: C.green, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}>
                {isSaving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Salvar</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setEditedName(user?.name || ''); setIsEditing(false); }} style={{ flex: 1, backgroundColor: C.border, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ color: C.textSecondary, fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.textPrimary, marginBottom: 2 }}>{user?.name || 'Motorista'}</Text>
            <Text style={{ fontSize: 13, color: C.textSecondary, marginBottom: 16 }}>{user?.email || ''}</Text>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.accentSoft, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}>
              <MaterialIcons name="edit" size={15} color={C.accent} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.accent }}>Editar nome</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Card do plano */}
      {userPlan === 'premium' ? (
        <View style={{ backgroundColor: C.greenSoft, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.green + '40', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.green + '20', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 22 }}>⭐</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: C.textPrimary }}>Plano Premium ativo</Text>
            {dias !== null && (
              <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>
                {dias > 0 ? `Vence em ${dias} dias` : 'Vencido — renove para continuar'}
              </Text>
            )}
            {subscriptionInfo?.end_date && (
              <Text style={{ fontSize: 11, color: C.textSecondary }}>até {formatDate(subscriptionInfo.end_date)}</Text>
            )}
          </View>
          <MaterialIcons name="check-circle" size={24} color={C.green} />
        </View>
      ) : (
        <TouchableOpacity onPress={onUpgradeClick} style={{ backgroundColor: C.accentSoft, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.accent + '40', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialIcons name="workspace-premium" size={24} color={C.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: C.textPrimary }}>Plano Grátis</Text>
            <Text style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>Assine o Premium por R$ 14,90/mês</Text>
          </View>
          <View style={{ backgroundColor: C.accent, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>UPGRADE</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Estatísticas */}
      {stats && (
        <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.textPrimary, marginBottom: 14 }}>
            📊 Seus números (últimos 12 meses)
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: 'Total ganho', value: formatCurrency(stats.totalGanhos), icon: 'attach-money', color: C.green },
              { label: 'Corridas', value: String(stats.totalCorridas), icon: 'local-taxi', color: C.accent },
              { label: 'Jornadas', value: String(stats.totalJornadas), icon: 'event-note', color: C.yellow },
              { label: 'Horas ao volante', value: `${stats.totalHoras.toFixed(0)}h`, icon: 'timer', color: C.textSecondary },
            ].map((item, i) => (
              <View key={i} style={{ flex: 1, minWidth: '40%', backgroundColor: C.bg, borderRadius: 12, padding: 12, alignItems: 'center' }}>
                <MaterialIcons name={item.icon} size={20} color={item.color} />
                <Text style={{ fontSize: 18, fontWeight: '800', color: C.textPrimary, marginTop: 6 }}>{item.value}</Text>
                <Text style={{ fontSize: 11, color: C.textSecondary, textAlign: 'center' }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ContaScreen;