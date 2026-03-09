import { StyleSheet } from 'react-native';
import { height } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';
import { useMemo } from 'react';

// dynamic styles for the login screen - adapts to the active color palette
export const useLoginStyles = () => {
  const { colors } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        bgTop: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: height * 0.55,
          backgroundColor: colors.background,
        },
        bgBottom: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: height * 0.45,
          backgroundColor: colors.headerBackground,
        },
        content: { flex: 1, paddingHorizontal: 32, justifyContent: 'center' },
        logoContainer: { alignItems: 'center', marginBottom: 48 },
        logoCircle: {
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.accentLight,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.accent + '40',
        },
        appName: { fontSize: 32, fontWeight: '800', color: colors.textPrimary, letterSpacing: 1 },
        tagline: { fontSize: 14, color: colors.textSecondary + '80', marginTop: 8, textAlign: 'center' },
        features: { marginBottom: 48 },
        featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
        featureIcon: {
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: colors.accentLight,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 14,
        },
        featureLabel: { color: colors.textSecondary + 'cc', fontSize: 14 },
        googleButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.googleButtonBg,
          borderRadius: 14,
          paddingVertical: 16,
          marginBottom: 20,
        },
        googleIcon: {
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.googleIconBg,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        },
        googleButtonText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
        terms: { textAlign: 'center', color: colors.textSecondary + '80', fontSize: 12, lineHeight: 20 },
        termsLink: { color: colors.accent, textDecorationLine: 'underline' },
      }),
    [colors]
  );
};