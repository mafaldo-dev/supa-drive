import { StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useMemo } from 'react';

const CARD_WIDTH = Dimensions.get('window').width - 32;

export const useHomeStyles = (isPremium) => {
    const { colors, isDark } = useTheme()
    return useMemo(
        () =>
            StyleSheet.create({
                container: { flex: 1, backgroundColor: colors.bg },
                content: { padding: 16, paddingBottom: 32 },

                // Boas vindas
                welcomeRow: {
                    flexDirection: 'row', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 24,
                },
                welcomeLeft: { flex: 1 },
                greetingText: { fontSize: 15, color: colors.textSecondary, fontWeight: '500', marginBottom: 4 },
                nameText: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
                planBadge: {
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    backgroundColor: isPremium ? 'rgba(255,215,0,0.15)' : colors.accentSoft,
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                    borderWidth: 1, borderColor: isPremium ? 'rgba(255,215,0,0.3)' : 'rgba(255,107,107,0.2)',
                },
                planBadgeText: {
                    fontSize: 13, fontWeight: '700',
                    color: isPremium ? colors.gold : colors.accent,
                },

                // Status assinatura
                subCard: {
                    backgroundColor: isPremium ? 'rgba(74,222,128,0.08)' : colors.accentSoft,
                    borderRadius: 16, padding: 18, marginBottom: 24,
                    borderWidth: 1, borderColor: isPremium ? 'rgba(74,222,128,0.2)' : 'rgba(255,107,107,0.15)',
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                },
                subCardLeft: { flex: 1 },
                subCardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
                subCardSub: { fontSize: 13, color: colors.textSecondary },
                subCardBtn: {
                    backgroundColor: colors.accent, borderRadius: 10,
                    paddingHorizontal: 16, paddingVertical: 10,
                },
                subCardBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

                // Carrossel
                carouselLabel: {
                    fontSize: 13, fontWeight: '600', color: colors.textSecondary,
                    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12,
                },
                slide: {
                    width: CARD_WIDTH, backgroundColor: colors.card,
                    borderRadius: 20, padding: 24,
                    borderWidth: 1, borderColor: colors.border,
                    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 12, elevation: 5,
                },
                slideHeader: {
                    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20,
                },
                slideIconBox: {
                    width: 42, height: 42, borderRadius: 12,
                    backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center',
                },
                slideTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },

                // Preferências grid
                prefGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
                prefCell: {
                    width: '31%', backgroundColor: colors.card2,
                    borderRadius: 12, padding: 12,
                    borderWidth: 1, borderColor: colors.border,
                    alignItems: 'flex-start',
                },
                prefCellLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 6 },
                prefCellValue: { fontSize: 15, fontWeight: '800', color: colors.accent },
                prefSectionTitle: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 14, marginBottom: 8 },
                tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
                tag: {
                    backgroundColor: colors.accentSoft, borderRadius: 8,
                    paddingHorizontal: 12, paddingVertical: 6,
                },
                tagText: { color: colors.accent, fontSize: 12, fontWeight: '600' },
                editPrefBtn: {
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                    gap: 6, marginTop: 16, backgroundColor: colors.accentSoft,
                    borderRadius: 12, paddingVertical: 12,
                },
                editPrefBtnText: { color: colors.accent, fontWeight: '700', fontSize: 14 },

                // Funcionalidades
                featureRow: {
                    flexDirection: 'row', justifyContent: 'space-between',
                    alignItems: 'center', paddingVertical: 16,
                    borderBottomWidth: 1, borderBottomColor: colors.border,
                },
                featureLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
                featureIconBox: {
                    width: 42, height: 42, borderRadius: 12,
                    backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center',
                },
                featureTextWrap: { flex: 1 },
                featureName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
                featureDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

                // Upgrade
                upgradeGradient: { alignItems: 'center' },
                upgradeEmoji: { fontSize: 44, marginBottom: 12 },
                upgradeTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: 8 },
                upgradeSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
                upgradeFeatures: { width: '100%', gap: 10, marginBottom: 24 },
                upgradeFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
                upgradeFeatureText: { fontSize: 14, color: colors.textPrimary },
                upgradeBtn: {
                    backgroundColor: colors.accent, borderRadius: 14,
                    paddingVertical: 16, paddingHorizontal: 32, width: '100%', alignItems: 'center',
                },
                upgradeBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
                upgradePrice: { fontSize: 12, color: colors.textSecondary, marginTop: 10 },

                // Dots
                dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 16 },
                dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border },
                dotActive: { width: 22, height: 7, borderRadius: 4, backgroundColor: colors.accent },

                // Resumo financeiro
                summaryCard: {
                    backgroundColor: colors.card, borderRadius: 20, padding: 22, marginTop: 24,
                    borderWidth: 1, borderColor: colors.border,
                    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 12, elevation: 5,
                },
                summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
                summaryIconBox: {
                    width: 42, height: 42, borderRadius: 12,
                    backgroundColor: 'rgba(74,222,128,0.12)', alignItems: 'center', justifyContent: 'center',
                },
                summaryTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
                summaryRow: {
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
                },
                summaryRowLabel: { fontSize: 14, color: colors.textSecondary },
                summaryRowValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
                summaryRowNeg: { fontSize: 14, fontWeight: '600', color: '#f87171' },
                summaryTotal: {
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: 'rgba(74,222,128,0.08)', borderRadius: 14, padding: 16,
                    borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)', marginTop: 8,
                },
                summaryTotalLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
                summaryTotalValue: { fontSize: 22, fontWeight: '800', color: '#4ade80' },
                summaryNote: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 14, fontStyle: 'italic' },
            }),
        [colors, isPremium]
    )
}