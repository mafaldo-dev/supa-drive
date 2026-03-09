import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import swal from 'sweetalert2';
import { useLoginStyles } from '../styles/loginStyles';
import { useTheme } from '../context/ThemeContext';
import { WEB_CLIENT_ID } from '../utils/constants';
import { handleGoogleToken } from '../services/authService';
import { useGlobalStyles } from '../styles/useGlobalStyles'


const LoginScreen = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const styles = useLoginStyles();
  const { colors } = useTheme();

  useEffect(() => {
    GoogleSignin.configure({ 
      webClientId: WEB_CLIENT_ID,
      offlineAccess: true,
      scopes: ['profile', 'email'], // Escopos para pegar mais informações
    });
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // Pega o token e os dados do usuário
      const token = userInfo.data?.idToken || userInfo.idToken;
      const userData = userInfo.data?.user || userInfo.user;
      
      console.log('Dados completos do Google:', JSON.stringify(userInfo, null, 2)); // Debug
      
      if (!token) {
        swal.fire('Erro', 'Token não encontrado.', 'error');
        setLoading(false);
        return;
      }

      // Monta o objeto com todos os dados do usuário
      const googleUserData = {
        givenName: userData?.givenName || userData?.name?.split(' ')[0] || '',
        name: userData?.name || '',
        email: userData?.email || '',
        photo: userData?.photo || userData?.picture || null,
        familyName: userData?.familyName || '',
      };

      // Passa os dados do usuário junto com o token
      await handleGoogleToken(token, googleUserData, setLoading, onLogin);
      
    } catch (error) {
      console.log('Erro detalhado:', JSON.stringify(error, null, 2));
      swal.fire('Erro', 'Falha no login com Google.', 'error');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style={colors.textPrimary === '#333333' ? 'dark' : 'light'} />
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <FontAwesome5 name="taxi" size={48} color={colors.accent} />
          </View>
          <Text style={styles.appName}>Supa Driver</Text>
          <Text style={styles.tagline}>Maximize seus ganhos em cada corrida</Text>
        </View>

        <View style={styles.features}>
          {[
            { icon: 'traffic-light', label: 'Semáforo inteligente de corridas' },
            { icon: 'chart-line', label: 'Análise de ganhos em tempo real' },
            { icon: 'shield-alt', label: 'Alertas de área de risco' },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <FontAwesome5 name={f.icon} size={16} color={colors.accent} />
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <>
              <View style={styles.googleIcon}>
                <Text style={{ fontSize: 18, color: '#4285F4', fontWeight: 'bold' }}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Continuar com Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.terms}>
          Ao continuar, você concorda com nossos{'\n'}
          <Text style={styles.termsLink}>Termos de Uso</Text> e{' '}
          <Text style={styles.termsLink}>Política de Privacidade</Text>
        </Text>
      </Animated.View>
    </View>
  );
};

export default LoginScreen;
