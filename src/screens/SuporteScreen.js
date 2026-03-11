import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useGlobalStyles } from '../styles/useGlobalStyles';

const FAQ_ITEMS = [
  {
    question: 'O que é o Supa Driver?',
    answer: 'O Supa Driver é um aplicativo para motoristas de aplicativo que ajuda a controlar jornadas, acompanhar ganhos diários e semanais, e tomar decisões mais inteligentes no volante.',
  },
  {
    question: 'Como funciona o cronômetro de jornada?',
    answer: 'Ao iniciar uma jornada, o cronômetro começa a contar o tempo ao volante. Ao encerrar, você informa os ganhos e o número de corridas — tudo é salvo no histórico automaticamente.',
  },
  {
    question: 'O que é o Resumo Semanal?',
    answer: 'O Resumo Semanal compara seus ganhos reais da semana com as metas configuradas nas suas preferências, mostrando sua performance e média por hora.',
  },
  {
    question: 'O que está incluso no plano Grátis?',
    answer: 'No plano Grátis você tem acesso às preferências personalizadas, cronômetro de jornada com histórico, resumo semanal e notificações push.',
  },
  {
    question: 'O que é o plano Premium?',
    answer: 'O plano Premium por R$ 14,90/mês desbloqueia o semáforo inteligente de corridas, mensagens de voz ao fim da jornada, relatórios detalhados e suporte prioritário.',
  },
  {
    question: 'Meus dados ficam salvos se eu trocar de celular?',
    answer: 'Sim! Seus dados são sincronizados com nosso servidor. Basta fazer login com o mesmo Google na conta e tudo estará disponível.',
  },
  {
    question: 'Como cancelo minha assinatura?',
    answer: 'Você pode cancelar a qualquer momento pelo menu Assinatura dentro do app. Não há renovação automática — o acesso premium fica ativo até o fim do período pago.',
  },
];

const FAQItem = ({ item, colors, isDark }) => {
  const [open, setOpen] = useState(false);
  const C = {
    card: isDark ? '#1a1a2e' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a2e',
    textSecondary: isDark ? '#8888aa' : '#888899',
  };

  return (
    <TouchableOpacity
      onPress={() => setOpen(!open)}
      activeOpacity={0.8}
      style={{
        backgroundColor: C.card, borderRadius: 14, marginBottom: 8,
        borderWidth: 1, borderColor: open ? colors.accent + '40' : C.border,
        overflow: 'hidden',
      }}
    >
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16,
      }}>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.textPrimary, paddingRight: 8 }}>
          {item.question}
        </Text>
        <MaterialIcons
          name={open ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={22} color={colors.accent}
        />
      </View>
      {open && (
        <View style={{
          paddingHorizontal: 16, paddingBottom: 16,
          borderTopWidth: 1, borderTopColor: C.border,
        }}>
          <Text style={{ fontSize: 13, color: C.textSecondary, lineHeight: 20, marginTop: 12 }}>
            {item.answer}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const SuporteScreen = () => {
  const globalStyles = useGlobalStyles();
  const { colors, isDark } = useTheme();

  const C = {
    bg: isDark ? '#0d0d14' : '#f0f0f7',
    card: isDark ? '#1a1a2e' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a2e',
    textSecondary: isDark ? '#8888aa' : '#888899',
    accentSoft: isDark ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.08)',
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Contato */}
      <Text style={{
        fontSize: 11, fontWeight: '700', color: C.textSecondary,
        letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12,
      }}>
        📞 Fale conosco
      </Text>

      <View style={{
        backgroundColor: C.card, borderRadius: 16, marginBottom: 20,
        borderWidth: 1, borderColor: C.border, overflow: 'hidden',
      }}>
        {[
          { icon: 'chat', label: 'Enviar Mensagem', onPress: () => {Linking.openURL('https://wa.me/5511999999999')} },
          { icon: 'email', label: 'Enviar e-mail', onPress: () => Linking.openURL('mailto:suporte-supadrive@gmail.com') },
        ].map((item, i, arr) => (
          <TouchableOpacity
            key={i}
            onPress={item.onPress}
            style={{
              flexDirection: 'row', alignItems: 'center', padding: 16,
              borderBottomWidth: i < arr.length - 1 ? 1 : 0,
              borderBottomColor: C.border,
            }}
          >
            <View style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: C.accentSoft,
              alignItems: 'center', justifyContent: 'center', marginRight: 14,
            }}>
              <MaterialIcons name={item.icon} size={18} color={colors.accent} />
            </View>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.textPrimary }}>
              {item.label}
            </Text>
            <MaterialIcons name="chevron-right" size={20} color={C.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* FAQ */}
      <Text style={{
        fontSize: 11, fontWeight: '700', color: C.textSecondary,
        letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12,
      }}>
        ❓ Perguntas frequentes
      </Text>

      {FAQ_ITEMS.map((item, i) => (
        <FAQItem key={i} item={item} colors={colors} isDark={isDark} />
      ))}
    </ScrollView>
  );
};

export default SuporteScreen;