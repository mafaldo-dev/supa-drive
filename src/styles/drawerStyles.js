import { StyleSheet } from 'react-native';
import { width } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';
import { useMemo } from 'react';

export const useDrawerStyles = () => {
  const { colors } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.modalOverlay,
          zIndex: 998,
        },
        drawer: {
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: width * 0.78,
          backgroundColor: colors.cardBackground,
          zIndex: 999,
          shadowColor: '#000',
          shadowOffset: { width: 4, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 20,
        },
        drawerHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 20,
          paddingTop: 50,
          backgroundColor: colors.headerBackground,
          gap: 12,
        },
        avatarCircle: {
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: colors.accent,
          justifyContent: 'center',
          alignItems: 'center',
        },
        avatarImage: {
          width: 50,
          height: 50,
          borderRadius: 25,
          borderWidth: 2,
          borderColor: colors.accent,
        },
        avatarText: {
          color: colors.textPrimary,
          fontSize: 22,
          fontWeight: 'bold',
        },
        userName: {
          color: colors.textPrimary,
          fontWeight: '700',
          fontSize: 15,
        },
        userEmail: {
          color: colors.textSecondary + '80',
          fontSize: 12,
          marginTop: 2,
        },
        planBadge: {
          marginTop: 6,
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 10,
          alignSelf: 'flex-start',
        },
        premiumBadge: {
          backgroundColor: colors.accent,
        },
        freeBadge: {
          backgroundColor: colors.freeBadge,
        },
        planBadgeText: {
          color: colors.onAccent,
          fontSize: 10,
          fontWeight: '700',
        },
        menuList: {
          flex: 1,
          paddingTop: 8,
        },
        menuItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
          gap: 14,
        },
        menuLabel: {
          fontSize: 15,
          color: colors.textPrimary,
          flex: 1,
        },
        menuBadge: {
          backgroundColor: colors.accent,
          borderRadius: 10,
          paddingHorizontal: 8,
          paddingVertical: 2,
        },
        menuBadgeText: {
          color: colors.onAccent,
          fontSize: 10,
          fontWeight: '700',
        },
        logoutBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: colors.declineButton,
          gap: 12,
        },
        logoutText: {
          color: colors.accent,
          fontWeight: '600',
          fontSize: 15,
        },
      }),
    [colors]
  );
};