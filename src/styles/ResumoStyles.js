import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useMemo } from 'react';
export const useResumoStyles = () => {
    const { colors } = useTheme();
    return useMemo(
        () =>
            StyleSheet.create({
                container: { flex: 1, backgroundColor: C.bg },
                content: { padding: 16, paddingBottom: 40 },
                card: {
                    backgroundColor: C.card, borderRadius: 20, padding: 20, marginBottom: 16,
                    borderWidth: 1, borderColor: C.border,
                    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 12, elevation: 5,
                },
                cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
                cardIconBox: {
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center',
                },
                cardTitle: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
                scoreBox: {
                    alignItems: 'center', backgroundColor: C.card2,
                    borderRadius: 16, padding: 20, marginBottom: 16,
                    borderWidth: 1, borderColor: C.border,
                },
                scoreEmoji: { fontSize: 40, marginBottom: 6 },
                scoreNum: { fontSize: 48, fontWeight: '800', marginBottom: 4 },
                scoreSub: { fontSize: 13, color: C.textSecondary },
                gridRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
                gridCell: {
                    flex: 1, backgroundColor: C.card2, borderRadius: 14, padding: 14,
                    alignItems: 'center', borderWidth: 1, borderColor: C.border,
                },
                gridVal: { fontSize: 18, fontWeight: '800', color: C.accent, marginBottom: 2 },
                gridLabel: { fontSize: 11, color: C.textSecondary, textAlign: 'center' },
                dayRow: {
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border,
                },
                dayDate: { fontSize: 13, color: C.textSecondary, width: 80 },
                dayHours: { fontSize: 12, color: C.textSecondary, width: 50, textAlign: 'center' },
                dayRides: { fontSize: 12, color: C.textSecondary, width: 50, textAlign: 'center' },
                dayEarnings: { fontSize: 14, fontWeight: '700', color: C.green, width: 80, textAlign: 'right' },
                emptyText: { color: C.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 30, fontStyle: 'italic' },
            }),
        [colors]
    )
}