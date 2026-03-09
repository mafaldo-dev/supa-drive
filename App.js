import React, { useState, useEffect } from 'react';
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

import * as NavigationBar from 'expo-navigation-bar'

// Componentes
import DrawerMenu from './src/components/DrawerMenu';
import FloatingButton from './src/components/FloatingButton';
import TrafficModal from './src/modals/TrafficModal';
import PlanModal from './src/modals/PlanModal';

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
import PaymentScreen from './src/screens/PaymentScreen';
import JornadaScreen from './src/screens/JornadaScreen';
import ResumoSemanalScreen from './src/screens/ResumoSemanalScreen';

// Serviços e Utils
import { checkSavedLogin, saveUserPlan } from './src/services/authService';
import { useGlobalStyles } from './src/styles/useGlobalStyles';
import { useTheme } from './src/context/ThemeContext';
import { useDriverSettings } from './src/hooks/useSubscription';

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

  useEffect(() => {
    checkSavedLogin(setIsLoggedIn, setUser, setUserPlan, setCheckingAuth);
  }, []);

  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden")
    NavigationBar.setBehaviorAsync("overlay-swipe")
  }, [])

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

  const handleSelectPlan = async (planId) => {
    await saveUserPlan(planId, setUserPlan);
    setShowPlanModal(false);
    Alert.alert('Plano alterado', `Agora você está no plano ${planId === 'premium' ? 'Premium' : 'Gratuito'}`, 'success');
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
      return (
        <PaymentScreen
          navigation={{ goBack: () => setShowPaymentScreen(false) }}
          onPaymentSuccess={(payment) => {
            Alert.alert('Pagamento Registrado', 'Seu pagamento foi registrado. Premium ativado!', 'success');
            setUserPlan('premium');
            setShowPaymentScreen(false);
            saveUserPlan('premium', setUserPlan);
          }}
        />
      );
    }

    switch (currentScreen) {
      case 'corridas': return <CorridasScreen />;
      case 'novidades': return <NovidadesScreen />;
      case 'promocoes': return <PromocoesScreen />;
      case 'configuracoes': return <ConfiguracoesScreen />;
      case 'suporte': return <SuporteScreen />;
      case 'conta': return <ContaScreen user={user} userPlan={userPlan} />;
      case 'preferencias': return <PreferenciasScreen navigation={{ goBack: () => setCurrentScreen('home') }} />
      case 'jornada': return <JornadaScreen preferences={preferences} />;
      case 'resumo': return <ResumoSemanalScreen preferences={preferences} />;
    
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
