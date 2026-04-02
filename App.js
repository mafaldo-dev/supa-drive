import React, { useState, useEffect } from 'react';
import * as Updates from 'expo-updates';

import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';

// Componentes
import DrawerMenu from './src/components/DrawerMenu';
import FloatingButton from './src/components/FloatingButton';
import FloatingTimer from './src/components/FloatingTimer';
import TrafficModal from './src/modals/TrafficModal';
import PlanModal from './src/modals/PlanModal';
import PixPaymentScreen from './src/screens/PixPaymentScreen';
import RideAnalyzer from './src/components/RideAnalyzer';

// Telas
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CorridasScreen from './src/screens/CorridasScreen';
import NovidadesScreen from './src/screens/NovidadesScreen';
import PromocoesScreen from './src/screens/PromocoesScreen';
import ConfiguracoesScreen from './src/screens/ConfiguracoesScreen';
import SuporteScreen from './src/screens/SuporteScreen';
import ContaScreen from './src/screens/ContaScreen';
import PreferenciasScreen from './src/screens/PreferenciasScreen';
import JornadaScreen from './src/screens/JornadaScreen';
import ResumoSemanalScreen from './src/screens/ResumoSemanalScreen';
import SemaforoScreen from './src/screens/SemaforoScreen';


// Serviços e Utils
import { checkSavedLogin, saveUserPlan } from './src/services/authService';
import { useGlobalStyles } from './src/styles/useGlobalStyles';
import { useTheme } from './src/context/ThemeContext';
import { useDriverSettings } from './src/hooks/useSubscription';
import { timerService } from './src/services/sessionService';


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isFloatingActive, setIsFloatingActive] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [showTrafficModal, setShowTrafficModal] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [userPlan, setUserPlan] = useState('free');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const { settings: preferences, refreshSettings } = useDriverSettings();

  // Estado global do cronômetro para o FloatingTimer
  const [timerElapsed, setTimerElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [floatingTimerVisible, setFloatingTimerVisible] = useState(false);

  useEffect(() => {
  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        console.log('Update disponível, baixando...');
        await Updates.fetchUpdateAsync();
        console.log('Update baixado, reiniciando app...');
        await Updates.reloadAsync();
      } else {
        console.log('Nenhum update disponível');
      }
    } catch (error) {
      console.log('Erro ao verificar update:', error);
    }
  };

  // Verifica updates quando o app iniciar
  checkForUpdates();
}, []);

  useEffect(() => {
    checkSavedLogin(setIsLoggedIn, setUser, setUserPlan, setCheckingAuth);
  }, []);

  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");
  }, []);

  // Auto-carrega preferências assim que logar
  useEffect(() => {
    if (isLoggedIn) {
      refreshSettings();
    }
  }, [isLoggedIn]);

  // Sync global do timer para o FloatingTimer
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(async () => {
      const startTime = await timerService.getStartTime();
      const floatingPref = await AsyncStorage.getItem('jornada_floating');
      if (startTime) {
        const secs = Math.floor((Date.now() - startTime) / 1000);
        setTimerRunning(true);
        setTimerElapsed(secs);
        setFloatingTimerVisible(floatingPref === 'true' && currentScreen !== 'jornada');
      } else {
        setTimerRunning(false);
        setFloatingTimerVisible(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoggedIn, currentScreen]);

  useEffect(() => {
    let interval;
    if (isFloatingActive && userPlan === 'premium') {
      interval = setInterval(() => {
        if (Math.random() > 0.5) simulateNewRide();
      }, 30000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isFloatingActive, userPlan]);

  const simulateNewRide = () => {
    const platforms = ['Uber', '99', 'UberX'];
    const destinations = ['Centro', 'Zona Sul', 'Aeroporto', 'Shopping', 'Praia'];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const destination = destinations[Math.floor(Math.random() * destinations.length)];
    const value = (Math.random() * 40 + 10).toFixed(2);
    const distance = (Math.random() * 15 + 3).toFixed(1);
    const time = Math.floor(Math.random() * 30 + 10);
    const valuePerKm = (parseFloat(value) / parseFloat(distance)).toFixed(2);
    const trafficLight = parseFloat(valuePerKm) > 3.5 ? 'green' : parseFloat(valuePerKm) > 2.0 ? 'yellow' : 'red';
    setCurrentRide({
      id: Date.now().toString(),
      platform,
      value: parseFloat(value),
      distance: parseFloat(distance),
      time,
      destination,
      trafficLight,
      valuePerKm: parseFloat(valuePerKm)
    });
    setShowTrafficModal(true);
  };

  const handleLogin = (data) => {
    setUser(data);
    setIsLoggedIn(true);
    // refreshSettings é disparado automaticamente pelo useEffect [isLoggedIn]
    AsyncStorage.getItem('userPlan').then(plan => setUserPlan(plan || 'free'));
  };

  const handleNavigate = (screen) => {
    if (screen === 'logout') {
      setIsLoggedIn(false);
      setUser(null);
      setUserPlan('free');
      return;
    }
    if (screen === 'assinatura') {
      setShowPlanModal(true);
      return;
    }
    setCurrentScreen(screen);
  };

  // Ao voltar das preferências recarrega os dados na home
  const handleBackFromPreferences = () => {
    setCurrentScreen('home');
    refreshSettings();
  };

  const handleSelectPlan = async (planId) => {
    await saveUserPlan(planId, setUserPlan);
    setShowPlanModal(false);
    Alert.alert('Plano alterado', `Agora você está no plano ${planId === 'premium' ? 'Premium' : 'Gratuito'}`);
  };

  const { colors } = useTheme();
  const globalStyles = useGlobalStyles();

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderScreen = () => {
    if (showPaymentScreen) {
      return <PixPaymentScreen
        onBack={() => setShowPaymentScreen(false)}
        onSuccess={() => {
          setShowPaymentScreen(false);
          Alert.alert('⭐ Premium ativado!', 'Seu plano Premium está ativo por 30 dias.');
        }}
        setUserPlan={setUserPlan}
      />;
    }

    switch (currentScreen) {
      case 'semaforo':      return <SemaforoScreen />;
      case 'novidades':     return <NovidadesScreen />;
      case 'promocoes':     return <PromocoesScreen />;
      case 'configuracoes': return <ConfiguracoesScreen />;
      case 'suporte':       return <SuporteScreen />;
      case 'conta':         return <ContaScreen user={user} userPlan={userPlan} onLogout={() => handleNavigate('logout')} onUpgradeClick={() => setShowPaymentScreen(true)} />;
      case 'preferencias':  return <PreferenciasScreen navigation={{ goBack: handleBackFromPreferences }} />;
      case 'jornada':       return <JornadaScreen preferences={preferences} userPlan={userPlan} />;
      case 'resumo':        return <ResumoSemanalScreen preferences={preferences} />;
      case 'corridas':      return <CorridasScreen />;
      default: return (
        <HomeScreen
          user={user}
          userPlan={userPlan}
          isFloatingActive={isFloatingActive}
          setIsFloatingActive={setIsFloatingActive}
          setShowFloatingButton={setShowFloatingButton}
          setShowPlanModal={setShowPlanModal}
          onRefresh={refreshSettings}
          preferences={preferences}
          onNavigateToPreferences={() => setCurrentScreen('preferencias')}
        />
      );
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar style={colors.textPrimary === '#333333' ? 'dark' : 'light'} />

      <View style={globalStyles.header}>
        <TouchableOpacity onPress={() => setDrawerOpen(true)} style={globalStyles.hamburger}>
          <MaterialIcons name="menu" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={globalStyles.headerCenter}>
          <FontAwesome5 name="taxi" size={20} color={colors.accent} />
          <Text style={globalStyles.headerTitle}>Supa Driver</Text>
        </View>
        <TouchableOpacity onPress={() => setShowPlanModal(true)}>
          <View style={[globalStyles.planIndicator, userPlan === 'premium' ? globalStyles.premiumBadge : globalStyles.freeBadge]}>
            <Text style={globalStyles.planIndicatorText}>{userPlan === 'premium' ? '⭐ PRO' : 'GRÁTIS'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>

      <FloatingTimer
        elapsed={timerElapsed}
        isRunning={timerRunning}
        visible={floatingTimerVisible}
        onPress={() => setCurrentScreen('jornada')}
      />

      {showFloatingButton && isFloatingActive && userPlan === 'premium' && (
        <FloatingButton onPress={() => setShowFloatingButton(false)} badgeCount={3} />
      )}

      <DrawerMenu
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={handleNavigate}
        user={user}
        userPlan={userPlan}
      />

      <TrafficModal
        visible={showTrafficModal}
        onClose={() => setShowTrafficModal(false)}
        currentRide={currentRide}
      />

      <PlanModal
        visible={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        userPlan={userPlan}
        onSelectPlan={handleSelectPlan}
        onUpgradeClick={() => setShowPaymentScreen(true)}
      />
    </SafeAreaView>
  );
}