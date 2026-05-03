import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, Animated, ScrollView, Image, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDrawerStyles } from '../styles/drawerStyles';
import { width, APP_VERSION, BACKEND_URL } from '../utils/constants';
import { logoutUser } from '../services/authService';
import { useTheme } from '../context/ThemeContext';
import { STORAGE_KEYS } from '../utils/storage';

const DrawerMenu = ({ visible, onClose, onNavigate, user, userPlan }) => {
  const slideAnim = useRef(new Animated.Value(-width * 0.78)).current;
  const drawerStyles = useDrawerStyles();
  const { colors } = useTheme();
  const [showMore, setShowMore] = useState(false);
  const [promoBadge, setPromoBadge] = useState(0);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -width * 0.78,
      duration: 280,
      useNativeDriver: true,
    }).start();
    if (!visible) setShowMore(false);
    if (visible) loadPromoBadge();
  }, [visible]);

  const loadPromoBadge = async () => {
    try {
      const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
      if (!driverId) return;
      const res = await fetch(`${BACKEND_URL}/api/promotions/driver/${driverId}/badge`);
      if (res.ok) {
        const data = await res.json();
        setPromoBadge(data.badge_count || 0);
      }
    } catch (e) {
      // silencioso
    }
  };

  const mainItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Central' },
    { id: 'conta', icon: 'person', label: 'Minha Conta' },
    { id: 'preferencias', icon: 'edit', label: 'Preferências' },
    { id: 'semaforo', icon: 'traffic', label: 'Semáforo Inteligente', premium: true },
    { id: 'jornada', icon: 'directions-car', label: 'Jornada' },
    { id: 'corridas', icon: 'history', label: 'Histórico' },
  ];

  const extraItems = [
    { id: 'promocoes', icon: 'local-offer', label: 'Promoções', promoBadge: promoBadge },
    { id: 'assinatura', icon: 'star', label: 'Assinatura', badge: userPlan === 'free' ? 'UPGRADE' : null },
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

  const renderItem = (item) => (
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
        if (item.id === 'promocoes') setPromoBadge(0);
        onNavigate(item.id);
        onClose();
      }}
      disabled={item.disabled}
    >
      {/* Ícone com badge de promoções */}
      <View style={{ position: 'relative' }}>
        <MaterialIcons
          name={item.icon}
          size={22}
          color={isPremiumLocked(item) || item.comingSoon ? colors.textSecondary : colors.accent}
        />
        {item.promoBadge > 0 && (
          <View style={{
            position: 'absolute', top: -4, right: -6,
            width: 16, height: 16, borderRadius: 8,
            backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 9, fontWeight: '900', color: '#fff' }}>
              {item.promoBadge > 9 ? '9+' : item.promoBadge}
            </Text>
          </View>
        )}
      </View>

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
        <View style={{ marginLeft: 'auto', backgroundColor: 'rgba(255,215,0,0.15)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
          <Text style={{ fontSize: 9, fontWeight: '800', color: '#FFD700' }}>EM BREVE</Text>
        </View>
      ) : isPremiumLocked(item) ? (
        <MaterialIcons name="lock" size={16} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
      ) : !item.disabled ? (
        <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
      ) : null}
    </TouchableOpacity>
  );

  // Botão "ver mais" com badge se houver promos
  const hasPromoInExtra = promoBadge > 0;

  return (
    <>
      {visible && (
        <TouchableOpacity style={drawerStyles.overlay} onPress={onClose} activeOpacity={1} />
      )}
      <Animated.View style={[drawerStyles.drawer, { transform: [{ translateX: slideAnim }] }]}>

        <View style={drawerStyles.drawerHeader}>
          {user?.photo ? (
            <Image source={{ uri: user.photo }} style={drawerStyles.avatarImage} />
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

          {mainItems.map(renderItem)}

          {/* Botão ver mais — com bolinha se houver promo */}
          <TouchableOpacity
            onPress={() => setShowMore(prev => !prev)}
            style={{
              flexDirection: 'row', alignItems: 'center',
              paddingVertical: 12, paddingHorizontal: 4,
              marginTop: 4, gap: 8,
              borderTopWidth: 1, borderTopColor: colors.border,
            }}
          >
            <View style={{ position: 'relative' }}>
              <MaterialIcons
                name={showMore ? 'expand-less' : 'expand-more'}
                size={20}
                color={colors.textSecondary}
              />
              {!showMore && hasPromoInExtra && (
                <View style={{
                  position: 'absolute', top: -3, right: -5,
                  width: 10, height: 10, borderRadius: 5,
                  backgroundColor: '#FF6B6B',
                }} />
              )}
            </View>
            <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>
              {showMore ? 'Ver menos' : 'Ver mais opções'}
            </Text>
            {!showMore && hasPromoInExtra && (
              <View style={{ backgroundColor: 'rgba(255,107,107,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#FF6B6B' }}>
                  {promoBadge} promo{promoBadge > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {showMore && extraItems.map(renderItem)}

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