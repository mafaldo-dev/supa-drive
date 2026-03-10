import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Alert, ScrollView, TouchableOpacity, Linking, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getNotificationStatus, setNotificationStatus } from '../services/notificationService';

const APP_VERSION = '1.0.2 BETA';

const TERMS = `TERMOS E CONDIÇÕES DE USO — SUPA DRIVER

Última atualização: março de 2026

1. ACEITAÇÃO DOS TERMOS
Ao utilizar o aplicativo Supa Driver, você concorda com estes Termos e Condições. Caso não concorde, não utilize o app.

2. DESCRIÇÃO DO SERVIÇO
O Supa Driver é uma ferramenta de apoio para motoristas de aplicativo, oferecendo controle de jornadas, análise de ganhos e recursos de produtividade. Não somos uma plataforma de transporte e não intermediamos corridas.

3. PLANOS E PAGAMENTOS
O plano Básico é gratuito. O plano Premium custa R$ 14,90/mês e não possui renovação automática. O acesso premium permanece ativo até o fim do período contratado.

4. DADOS E PRIVACIDADE
Coletamos apenas os dados necessários para o funcionamento do app (e-mail, nome e dados de jornada). Não vendemos seus dados a terceiros. Os dados são armazenados de forma segura em nossos servidores.

5. RESPONSABILIDADES
O Supa Driver não se responsabiliza por decisões tomadas com base nas informações do app. O motorista é o único responsável por suas ações no trânsito e nas plataformas de transporte.

6. CANCELAMENTO
Você pode encerrar sua conta a qualquer momento pelo menu de configurações. Os dados serão removidos em até 30 dias após a solicitação.

7. CONTATO
Dúvidas: suporte@supadriver.com.br`;

const ConfiguracoesScreen = () => {
  const { isDark, toggleTheme, colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [showTerms, setShowTerms] = useState(false);

  const C = {
    bg: isDark ? '#0d0d14' : '#f0f0f7',
    card: isDark ? '#1a1a2e' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    textPrimary: isDark ? '#f0f0f0' : '#1a1a2e',
    textSecondary: isDark ? '#8888aa' : '#888899',
    accentSoft: isDark ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.08)',
    overlay: 'rgba(0,0,0,0.75)',
  };

  useEffect(() => {
    getNotificationStatus().then(enabled => {
      setNotificationsEnabled(enabled);
      setLoadingNotifications(false);
    });
  }, []);

  const handleNotificationsToggle = async (value) => {
    setNotificationsEnabled(value);
    const success = await setNotificationStatus(value);
    if (!success) {
      setNotificationsEnabled(!value);
      Alert.alert('Permissão Negada', 'Você precisa conceder permissão para receber notificações.');
    }
  };

  const SectionTitle = ({ title }) => (
    <Text style={{
      fontSize: 11, fontWeight: '700', color: C.textSecondary,
      letterSpacing: 1.2, textTransform: 'uppercase',
      marginBottom: 10, marginTop: 20,
    }}>{title}</Text>
  );

  const SettingRow = ({ icon, label, right, onPress, last }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row', alignItems: 'center', padding: 16,
        borderBottomWidth: last ? 0 : 1, borderBottomColor: C.border,
      }}
    >
      {icon && (
        <View style={{
          width: 34, height: 34, borderRadius: 10,
          backgroundColor: C.accentSoft,
          alignItems: 'center', justifyContent: 'center', marginRight: 14,
        }}>
          <MaterialIcons name={icon} size={16} color={colors.accent} />
        </View>
      )}
      <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.textPrimary }}>
        {label}
      </Text>
      {right}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Preferências */}
      <SectionTitle title="⚙️ Preferências" />
      <View style={{ backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}>
        <SettingRow
          icon="notifications"
          label="Notificações"
          right={
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
              thumbColor={colors.switchThumb}
              disabled={loadingNotifications}
            />
          }
        />
        <SettingRow
          icon="brightness-2"
          label="Tema escuro"
          last
          right={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
              thumbColor={colors.switchThumb}
            />
          }
        />
      </View>

      {/* Sobre o app */}
      <SectionTitle title="ℹ️ Informações gerais" />
      <View style={{ backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}>
        <SettingRow icon="info" label="Versão do app"
          right={<Text style={{ fontSize: 13, color: C.textSecondary }}>{APP_VERSION}</Text>}
        />
        <SettingRow icon="star" label="Avaliar o app"
          onPress={() => Linking.openURL('market://details?id=com.markondes.supadrive')}
          right={<MaterialIcons name="chevron-right" size={20} color={C.textSecondary} />}
        />
        <SettingRow icon="email" label="Falar com suporte"
          onPress={() => Linking.openURL('mailto:suporte@supadriver.com.br')}
          right={<MaterialIcons name="chevron-right" size={20} color={C.textSecondary} />}
        />
        <SettingRow icon="code" label="Desenvolvido por"
          last
          right={<Text style={{ fontSize: 13, color: C.textSecondary }}>Guiman System</Text>}
        />
      </View>

      {/* Legal */}
      <SectionTitle title="📄 Legal" />
      <View style={{ backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}>
        <SettingRow icon="description" label="Termos e Condições de Uso"
          onPress={() => setShowTerms(true)}
          right={<MaterialIcons name="chevron-right" size={20} color={C.textSecondary} />}
        />
        <SettingRow icon="privacy-tip" label="Política de Privacidade"
          last
          onPress={() => setShowTerms(true)}
          right={<MaterialIcons name="chevron-right" size={20} color={C.textSecondary} />}
        />
      </View>

      {/* Modal Termos */}
      <Modal visible={showTerms} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 24, maxHeight: '85%',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: C.textPrimary }}>Termos e Condições</Text>
              <TouchableOpacity onPress={() => setShowTerms(false)}>
                <MaterialIcons name="close" size={22} color={C.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 13, color: C.textSecondary, lineHeight: 22 }}>
                {TERMS}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ConfiguracoesScreen;