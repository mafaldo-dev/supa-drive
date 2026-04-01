import { useMemo } from 'react';
import { StyleSheet } from 'react-native'
import { useTheme } from '../context/ThemeContext';


export const useJornadaStyles = () => {
    const { colors, isDark } = useTheme();
    return useMemo(
        () =>
            StyleSheet.create({
                container: { flex: 1, backgroundColor: colors.bg },
                content: { padding: 16, paddingBottom: 40 },

                timerCard: {
                    backgroundColor: colors.card, borderRadius: 24, paddingVertical: 32, paddingHorizontal: 20,
                    alignItems: 'center', marginBottom: 16,
                    borderWidth: 1, borderColor: colors.border,
                    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: isDark ? 0.4 : 0.08, shadowRadius: 16, elevation: 8,
                },
                timerLabel: {
                    fontSize: 11, fontWeight: '700', color: colors.textSecondary,
                    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 24,
                },
                timerBtnRow: { flexDirection: 'row', gap: 12, marginTop: 28 },
                btnStart: {
                    backgroundColor: colors.green, borderRadius: 50,
                    paddingVertical: 14, paddingHorizontal: 36,
                    flexDirection: 'row', alignItems: 'center', gap: 8,
                },
                btnStop: {
                    backgroundColor: colors.accent, borderRadius: 50,
                    paddingVertical: 14, paddingHorizontal: 28,
                    flexDirection: 'row', alignItems: 'center', gap: 8,
                },
                btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

                switchCard: {
                    backgroundColor: colors.card, borderRadius: 20, padding: 20,
                    marginBottom: 16, borderWidth: 1, borderColor: colors.border,
                },
                switchCardTitle: {
                    fontSize: 11, fontWeight: '700', color: colors.textSecondary,
                    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14,
                },
                switchRow: {
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
                },
                switchRowLast: {
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingVertical: 12,
                },
                switchLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
                switchIconBox: {
                    width: 34, height: 34, borderRadius: 10,
                    backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center',
                },
                switchTextWrap: { flex: 1 },
                switchLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
                switchDesc: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
                premiumTag: {
                    backgroundColor: 'rgba(255,215,0,0.15)', borderRadius: 6,
                    paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6,
                },
                premiumTagText: { fontSize: 9, fontWeight: '800', color: '#FFD700' },

                sectionTitle: {
                    fontSize: 11, fontWeight: '700', color: colors.textSecondary,
                    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12,
                },
                sessionCard: {
                    backgroundColor: colors.card, borderRadius: 16, padding: 16,
                    marginBottom: 10, borderWidth: 1, borderColor: colors.border,
                },
                sessionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
                sessionDate: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
                sessionEarningsBig: { fontSize: 20, fontWeight: '800', color: colors.green },
                sessionStats: { flexDirection: 'row', gap: 8 },
                sessionStat: {
                    flex: 1, backgroundColor: colors.card2, borderRadius: 10, padding: 10,
                    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
                },
                sessionStatVal: { fontSize: 14, fontWeight: '800', color: colors.accent, marginBottom: 2 },
                sessionStatLabel: { fontSize: 10, color: colors.textSecondary },
                progressBar: { height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 12 },
                progressFill: { height: 4, borderRadius: 2 },
                progressLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 4 },
                emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 30, fontStyle: 'italic' },

                modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
                modalCard: {
                    backgroundColor: colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
                    padding: 28, paddingBottom: 40,
                },
                modalTitle: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 4, textAlign: 'center' },
                modalSub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: 20 },
                modalDuration: {
                    backgroundColor: colors.greenSoft, borderRadius: 14, padding: 14,
                    alignItems: 'center', marginBottom: 20,
                    borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)',
                },
                modalDurationVal: { fontSize: 32, fontWeight: '800', color: colors.green },
                modalDurationLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
                modalLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
                modalInput: {
                    backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border,
                    borderRadius: 12, padding: 14, fontSize: 18, fontWeight: '700',
                    color: colors.textPrimary, marginBottom: 14, textAlign: 'center',
                },
                modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
                modalBtnSave: { flex: 2, backgroundColor: colors.green, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
                modalBtnDiscard: {
                    flex: 1, backgroundColor: colors.accentSoft, borderRadius: 14, paddingVertical: 16,
                    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,107,107,0.2)',
                },
                modalBtnSaveText: { color: '#fff', fontWeight: '800', fontSize: 15 },
                modalBtnDiscardText: { color: colors.accent, fontWeight: '700', fontSize: 14 },
                modalBackBtn: { alignItems: 'center', marginTop: 16 },
                modalBackText: { color: colors.textSecondary, fontSize: 13 },
            }),
            [colors]
    )
}