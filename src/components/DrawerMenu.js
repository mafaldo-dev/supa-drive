import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Animated, ScrollView, Image, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDrawerStyles } from '../styles/drawerStyles';
import { width, APP_VERSION } from '../utils/constants';
import { logoutUser } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

const DrawerMenu = ({ visible, onClose, onNavigate, user, userPlan }) => {
  const slideAnim = useRef(new Animated.Value(-width * 0.78)).current;
  const drawerStyles = useDrawerStyles();
  const { colors } = useTheme();

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -width * 0.78,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const menuItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Central' },
    { id: 'conta', icon: 'person', label: 'Minha Conta' },
    { id: 'preferencias', icon: 'edit', label: 'Preferências' },
    { id: 'semaforo', icon: 'traffic', label: 'Semáforo Inteligente', comingSoon: true },
    { id: 'jornada', icon: 'directions-car', label: 'Jornada' },
    { id: 'resumo', icon: 'bar-chart', label: 'Resumo', premium: true },
    { id: 'promocoes', icon: 'local-offer', label: 'Promoções' },
    { id: 'assinatura', icon: 'star', label: 'Assinatura', badge: userPlan === 'free' ? 'UPGRADE' : null, comingSoon: true },
    { id: 'novidades', icon: 'new-releases', label: 'Novidades' },
    { id: 'parceiros', icon: 'people', label: 'Parceiros', comingSoon: true },
    { id: 'configuracoes', icon: 'settings', label: 'Configurações' },
    { id: 'suporte', icon: 'headset-mic', label: 'Suporte' },
    { id: 'versao', icon: 'info-outline', label: `Versão ${APP_VERSION}`, disabled: true },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Sair', 'Deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair', style: 'destructive',
          onPress: () => { logoutUser(() => { onNavigate('logout'); onClose(); }); },
        },
      ],
      { cancelable: true }
    );
  };

  const getInitials = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.givenName) return user.givenName.charAt(0).toUpperCase();
    return 'M';
  };

  const getDisplayName = () => user?.name || user?.givenName || 'Motorista';
  const getEmail = () => user?.email || '';
  const isPremiumLocked = (item) => item.premium && userPlan !== 'premium';

  return (
    <>
      {visible && (
        <TouchableOpacity style={drawerStyles.overlay} onPress={onClose} activeOpacity={1} />
      )}
      <Animated.View style={[drawerStyles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={drawerStyles.drawerHeader}>
          {user?.photo ? (
            <Image source={{ uri: user.photo }} style={drawerStyles.avatarImage}
              defaultSource={require('../../assets/default-avatar.svg')} />
          ) : (
            <View style={drawerStyles.avatarCircle}>
              <Text style={drawerStyles.avatarText}>{getInitials()}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={drawerStyles.userName}>{getDisplayName()}</Text>
            <Text style={drawerStyles.userEmail}>{getEmail()}</Text>
            <View style={[drawerStyles.planBadge, userPlan === 'premium' ? drawerStyles.premiumBadge : drawerStyles.freeBadge]}>
              <Text style={drawerStyles.planBadgeText}>
                {userPlan === 'premium' ? '⭐ PREMIUM' : 'GRÁTIS'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={drawerStyles.menuList} showsVerticalScrollIndicator={false}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                drawerStyles.menuItem,
                (item.disabled || item.comingSoon) && { opacity: 0.6 },
              ]}
              onPress={() => {
                if (item.disabled || item.comingSoon) return;
                if (isPremiumLocked(item)) {
                  Alert.alert(
                    '⭐ Recurso Premium',
                    'Esta funcionalidade está disponível apenas no plano Premium.',
                    [
                      { text: 'Agora não', style: 'cancel' },
                      { text: 'Ver planos', onPress: () => { onNavigate('assinatura'); onClose(); } }
                    ]
                  );
                  return;
                }
                onNavigate(item.id);
                onClose();
              }}
              disabled={item.disabled}
            >
              <MaterialIcons
                name={item.icon}
                size={22}
                color={isPremiumLocked(item) || item.comingSoon ? colors.textSecondary : colors.accent}
              />
              <Text style={[
                drawerStyles.menuLabel,
                (isPremiumLocked(item) || item.comingSoon) && { color: colors.textSecondary }
              ]}>
                {item.label}
              </Text>

              {item.badge ? (
                <View style={drawerStyles.menuBadge}>
                  <Text style={drawerStyles.menuBadgeText}>{item.badge}</Text>
                </View>
              ) : item.comingSoon ? (
                <View style={{
                  marginLeft: 'auto', backgroundColor: 'rgba(255,215,0,0.15)',
                  borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
                }}>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: '#FFD700' }}>EM BREVE</Text>
                </View>
              ) : isPremiumLocked(item) ? (
                <MaterialIcons name="lock" size={16} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
              ) : !item.disabled ? (
                <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={drawerStyles.logoutBtn} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color={colors.accent} />
          <Text style={drawerStyles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

export default DrawerMenu;