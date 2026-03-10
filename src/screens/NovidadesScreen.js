import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { novidades } from '../data/novidades';

const NovidadesScreen = () => {
  const { isDark } = useTheme();

  const C = {
    bg: isDark ? '#0d0d14' : '#f0f0f7',
    card: isDark ? '#1a1a2e' : '#ffffff',
    card2: isDark ? '#16213e' : '#f8f8ff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a2e',
    textSecondary: isDark ? '#8888aa' : '#888899',
    accent: '#FF6B6B',
    accentSoft: isDark ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.08)',
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{
        fontSize: 11, fontWeight: '700', color: C.textSecondary,
        letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 16,
      }}>
        🆕 Atualizações do app
      </Text>

      {novidades.map((item, index) => (
        <View key={item.id} style={{
          backgroundColor: C.card, borderRadius: 20, padding: 20,
          marginBottom: 14, borderWidth: 1, borderColor: C.border,
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.06, shadowRadius: 10, elevation: 4,
        }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {/* Tag */}
              <View style={{
                backgroundColor: item.tagColor + '20', borderRadius: 8,
                paddingHorizontal: 8, paddingVertical: 3,
                borderWidth: 1, borderColor: item.tagColor + '40',
              }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: item.tagColor, textTransform: 'uppercase' }}>
                  {item.tag}
                </Text>
              </View>
              {/* Versão */}
              <Text style={{ fontSize: 11, color: C.textSecondary, fontWeight: '600' }}>
                v{item.version}
              </Text>
            </View>
            {/* Data */}
            <Text style={{ fontSize: 11, color: C.textSecondary }}>
              {formatDate(item.date)}
            </Text>
          </View>

          {/* Título */}
          <Text style={{ fontSize: 17, fontWeight: '800', color: C.textPrimary, marginBottom: 8 }}>
            {item.title}
          </Text>

          {/* Descrição */}
          <Text style={{ fontSize: 13, color: C.textSecondary, lineHeight: 20, marginBottom: 14 }}>
            {item.description}
          </Text>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: C.border, marginBottom: 14 }} />

          {/* Items */}
          {item.items.map((feat, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <View style={{
                width: 20, height: 20, borderRadius: 10,
                backgroundColor: item.tagColor + '20',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <MaterialIcons name="check" size={12} color={item.tagColor} />
              </View>
              <Text style={{ fontSize: 13, color: C.textPrimary, flex: 1 }}>{feat}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

export default NovidadesScreen;