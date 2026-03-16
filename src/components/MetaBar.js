import React from 'react';
import { View, Text } from 'react-native';
import { fmt } from '../utils/validators';

export const MetaBar = ({ label, value, meta, unit = 'R$', isDark, C }) => {
    const progress = meta > 0 ? Math.min(value / meta, 1) : 0;
    const pct = Math.round(progress * 100);
    const ok = value >= meta;
    const color = ok ? '#4ade80' : pct >= 70 ? '#facc15' : '#f87171';

    return (
        <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: C.textSecondary }}>{label}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color }}>
                    {unit === 'R$' ? fmt(value) : `${Number(value).toFixed(1)}h`}
                    {meta > 0 && <Text style={{ fontWeight: '400', color: C.textSecondary }}>
                        {' '}/ {unit === 'R$' ? fmt(meta) : `${Number(meta).toFixed(1)}h`}
                    </Text>}
                </Text>
            </View>
            <View style={{ height: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', borderRadius: 3 }}>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: color, width: `${pct}%` }} />
            </View>
            <Text style={{ fontSize: 10, color, marginTop: 3, fontWeight: '600' }}>
                {ok ? `✅ ${pct}% — Meta atingida!` : `${pct}% da meta`}
            </Text>
        </View>
    );
};
