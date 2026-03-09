import React, { useState, useEffect } from 'react';
import { View, Text, Switch } from 'react-native';
import swal from 'sweetalert2';
import { useGlobalStyles } from '../styles/useGlobalStyles';
import { useTheme } from '../context/ThemeContext';
import { getNotificationStatus, setNotificationStatus } from '../services/notificationService';

const ConfiguracoesScreen = () => {

  const globalStyles = useGlobalStyles();
  const { isDark, toggleTheme, colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    loadNotificationStatus();
  }, []);

  const loadNotificationStatus = async () => {
    const enabled = await getNotificationStatus();
    setNotificationsEnabled(enabled);
    setLoadingNotifications(false);
  };

  const handleNotificationsToggle = async (value) => {
    setNotificationsEnabled(value);
    const success = await setNotificationStatus(value);
    
    if (!success) {
      setNotificationsEnabled(!value);
      swal.fire(
        'Permissão Negada',
        'Você precisa conceder permissão para receber notificações.',
        'warning'
      );
    }
  };

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.screenTitle}>Configurações</Text>

      <View style={globalStyles.settingsCard}>

        <View style={globalStyles.settingRow}>
          <Text style={globalStyles.settingLabel}>Notificações</Text>
          <Switch
            onValueChange={handleNotificationsToggle}
            value={notificationsEnabled}
            trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
            thumbColor={colors.switchThumb}
            disabled={loadingNotifications}
          />
        </View>

        <View style={globalStyles.settingRow}>
          <Text style={globalStyles.settingLabel}>Tema escuro</Text>

          <Switch
            onValueChange={toggleTheme}
            value={isDark}
            trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
            thumbColor={colors.switchThumb}
          />
        </View>

        <View style={globalStyles.settingRow}>
          <Text style={globalStyles.settingLabel}>Informações Gerais</Text>
        </View>

      </View>
    </View>
  );
};

export default ConfiguracoesScreen;
