import { useTheme } from "../context/ThemeContext";
import { StyleSheet } from "react-native";
import { useMemo } from "react";

export const usePreferencesStyles = () => {
    const { colors } = useTheme();

    return useMemo(
        () =>
            StyleSheet.create({
                container: { flex: 1, backgroundColor: colors.bg },
                loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
                header: {
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16,
                    backgroundColor: colors.header, borderBottomWidth: 1, borderBottomColor: colors.border,
                },
                headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
                content: { padding: 16 },
                section: {
                    backgroundColor: colors.card, borderRadius: 16, padding: 16,
                    marginBottom: 16, borderWidth: 1, borderColor: colors.border,
                },
                sectionTitle: {
                    fontSize: 15, fontWeight: '700', color: colors.textPrimary,
                    marginBottom: 16, paddingBottom: 10,
                    borderBottomWidth: 1, borderBottomColor: colors.border,
                },
                label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 5 },
                input: {
                    backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border,
                    borderRadius: 10, padding: 12, fontSize: 15, color: colors.textPrimary, marginBottom: 12,
                },
                valueBox: {
                    backgroundColor: colors.accentSoft, borderRadius: 10, padding: 12,
                    marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,107,107,0.15)',
                },
                valueText: { fontSize: 15, fontWeight: '700', color: colors.accent },
                valueTextPlain: { fontSize: 15, color: colors.textPrimary },
                tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
                tag: { backgroundColor: colors.accentSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
                tagText: { color: colors.accent, fontSize: 12, fontWeight: '600' },
                emptyText: { color: colors.textSecondary, fontSize: 13, fontStyle: 'italic' },
                btnRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 32 },
                btn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
                btnEdit: { backgroundColor: colors.accent },
                btnSave: { backgroundColor: colors.success, flex: 2 },
                btnCancel: { backgroundColor: colors.danger, flex: 1 },
                btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
            }), [colors]
    );
}