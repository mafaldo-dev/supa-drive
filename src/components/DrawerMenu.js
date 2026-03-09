import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import swal from 'sweetalert2';
import { useDrawerStyles } from '../styles/drawerStyles';
import { width, APP_VERSION } from '../utils/constants';
import { logoutUser } from '../services/authService';

import { useGlobalStyles } from '../styles/useGlobalStyles';
import { useTheme } from '../context/ThemeContext';


const DrawerMenu = ({ visible, onClose, onNavigate, user, userPlan }) => {
  const slideAnim = useRef(new Animated.Value(-width * 0.78)).current;
  const globalStyles = useGlobalStyles();
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
    { id: 'dashboard', icon: 'dashboard', label: 'Central', iconLib:'material' },
    { id: 'conta', icon: 'person', label: 'Minha Conta', iconLib: 'material' },
    { id: 'preferencias', icon: 'edit', label: 'Preferências', iconLib: 'material' },
    { id: 'corridas', icon: 'list-alt', label: 'Relatório', iconLib: 'material' },
    { id: 'promocoes', icon: 'local-offer', label: 'Promoções', iconLib: 'material' },
    { id: 'assinatura', icon: 'star', label: 'Assinatura', iconLib: 'material', badge: userPlan === 'free' ? 'UPGRADE' : null },
    { id: 'novidades', icon: 'new-releases', label: 'Novidades', iconLib: 'material' },
    { id: 'parceiros', icon: 'people', label: 'Parceiros', iconLib: 'material', disabled: true},
    { id: 'configuracoes', icon: 'settings', label: 'Configurações', iconLib: 'material' },
    { id: 'suporte', icon: 'headset-mic', label: 'Suporte', iconLib: 'material' },
    { id: 'versao', icon: 'info-outline', label: `Versão ${APP_VERSION}`, iconLib: 'material', disabled: true },
  ];

  const handleLogout = () => {
    swal.fire({
      title: 'Sair',
      text: 'Deseja sair da sua conta?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sair',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#FF6B6B',
    }).then((result) => {
      if (result.isConfirmed) {
        logoutUser(() => {
          onNavigate('logout');
          onClose();
        });
      }
    });
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.givenName) {
      return user.givenName.charAt(0).toUpperCase();
    }
    return 'M';
  };

  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.givenName) return user.givenName;
    return 'Motorista';
  };

  const getEmail = () => {
    return user?.email || '';
  };

  return (
    <>
      {visible && (
        <TouchableOpacity style={drawerStyles.overlay} onPress={onClose} activeOpacity={1} />
      )}
      <Animated.View style={[drawerStyles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={drawerStyles.drawerHeader}>
          {user?.photo ? (
            <Image 
              source={{ uri: user.photo }} 
              style={drawerStyles.avatarImage}
              defaultSource={require('../../assets/default-avatar.svg')}
            />
          ) : (
            <View style={drawerStyles.avatarCircle}>
              <Text style={drawerStyles.avatarText}>
                {getInitials()}
              </Text>
            </View>
          )}
          
          <View style={{ flex: 1 }}>
            <Text style={drawerStyles.userName}>{getDisplayName()}</Text>
            <Text style={drawerStyles.userEmail}>{getEmail()}</Text>
            <View style={[
              drawerStyles.planBadge, 
              userPlan === 'premium' ? drawerStyles.premiumBadge : drawerStyles.freeBadge
            ]}>
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
              style={[drawerStyles.menuItem, item.disabled && { opacity: 0.5 }]}
              onPress={() => { 
                if (!item.disabled) {
                  	onNavigate(item.id); 
                 	onClose();
        	  } else {
			onNavigate('home')	
	} 
              }}
              disabled={item.disabled}
            >
              <MaterialIcons name={item.icon} size={22} color={colors.accent} />
              <Text style={drawerStyles.menuLabel}>{item.label}</Text>
              {item.badge && (
                <View style={drawerStyles.menuBadge}>
                  <Text style={drawerStyles.menuBadgeText}>{item.badge}</Text>
                </View>
              )}
              {!item.disabled && (
                <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
              )}
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
