import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const CheckboxGroup = ({ title, options, values = {}, onChange, columns = 2 }) => {
    const { isDark } = useTheme();
    const C = { textPrimary: isDark ? '#f0f0f0' : '#1a1a2e', accent: '#FF6B6B' };
    const toggle = (key) => onChange({ ...values, [key]: !values[key] });

    return (
        <View style={{ marginBottom: 16 }}>
            {title && <Text style={{ fontSize: 14, fontWeight: '600', color: C.textPrimary, marginBottom: 10 }}>{title}</Text>}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
                {Object.entries(options).map(([key, label]) => (
                    <TouchableOpacity key={key} onPress={() => toggle(key)}
                        style={{ width: `${100 / columns}%`, paddingHorizontal: 4, marginBottom: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                                width: 22, height: 22, borderRadius: 4, borderWidth: 2,
                                borderColor: C.accent, justifyContent: 'center', alignItems: 'center',
                                marginRight: 8, backgroundColor: values[key] ? C.accent : 'transparent',
                            }}>
                                {values[key] && <MaterialIcons name="check" size={14} color="#fff" />}
                            </View>
                            <Text style={{ fontSize: 13, color: C.textPrimary }}>{label}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};