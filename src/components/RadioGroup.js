import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const RadioGroup = ({ title, options, value, onChange }) => {
    const { isDark } = useTheme();
    const C = {
        textPrimary: isDark ? '#f0f0f0' : '#1a1a2e',
        textSecondary: isDark ? '#8888aa' : '#888899',
        accent: '#FF6B6B',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    };
    return (
        <View style={{ marginBottom: 16 }}>
            {title && <Text style={{ fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 10 }}>{title}</Text>}
            <View style={{ flexDirection: 'row', gap: 10 }}>
                {options.map((opt) => (
                    <TouchableOpacity key={opt.value} onPress={() => onChange(opt.value)} style={{
                        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                        paddingVertical: 10, borderRadius: 10, gap: 8,
                        backgroundColor: value === opt.value ? 'rgba(255,107,107,0.12)' : 'transparent',
                        borderWidth: 1.5, borderColor: value === opt.value ? C.accent : C.border,
                    }}>
                        <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: C.accent, alignItems: 'center', justifyContent: 'center' }}>
                            {value === opt.value && <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: C.accent }} />}
                        </View>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: value === opt.value ? C.accent : C.textSecondary }}>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};
