import AsyncStorage from '@react-native-async-storage/async-storage';
import swal from 'sweetalert2';
import { BACKEND_URL } from '../utils/constants';
import { STORAGE_KEYS } from '../utils/storage';

export const handleGoogleToken = async (token, userData, setLoading, onLogin) => {
  setLoading(true);
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();

    if (data.token) {
      // Salva todos os dados do usuário
      await AsyncStorage.setItem(STORAGE_KEYS.JWT_TOKEN, data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.DRIVER_ID, String(data.driver_id));

      // Salva os dados do perfil do Google
      if (userData) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, userData.givenName || userData.name || '');
        await AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, userData.email || '');
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PHOTO, userData.photo || '');
        await AsyncStorage.setItem(STORAGE_KEYS.USER_FULL_NAME, userData.name || userData.givenName || '');
      }

      // Combina os dados do backend com os dados do Google
      const completeUserData = {
        ...data,
        name: userData?.name || userData?.givenName || data.name,
        email: userData?.email || data.email,
        photo: userData?.photo || null,
        givenName: userData?.givenName || null,
      };

      onLogin(completeUserData);
    } else {
      swal.fire('Erro', 'Falha ao autenticar. Tente novamente.', 'error');
    }
  } catch (err) {
    console.error('Erro de autenticação:', err);
    swal.fire('Erro de conexão', 'Verifique sua internet e tente novamente.', 'error');
  } finally {
    setLoading(false);
  }
};

export const checkSavedLogin = async (setIsLoggedIn, setUser, setUserPlan, setCheckingAuth) => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    const plan = await AsyncStorage.getItem(STORAGE_KEYS.USER_PLAN);
    const userName = await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
    const userEmail = await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL);
    const userPhoto = await AsyncStorage.getItem(STORAGE_KEYS.USER_PHOTO);
    const driverId = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_ID);
    
    if (token) {
      setIsLoggedIn(true);
      if (plan) setUserPlan(plan);
      
      // Recria o objeto do usuário com os dados salvos
      setUser({
        token,
        driver_id: driverId,
        name: userName || 'Motorista',
        email: userEmail || '',
        photo: userPhoto || null,
      });
    }
  } catch (e) {
    console.error('Erro ao verificar login salvo:', e);
  }
  setCheckingAuth(false);
};

export const saveUserPlan = async (plan, setUserPlan) => {
  await AsyncStorage.setItem(STORAGE_KEYS.USER_PLAN, plan);
  setUserPlan(plan);
};

export const logoutUser = async (onLogout) => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.JWT_TOKEN,
      STORAGE_KEYS.DRIVER_ID,
      STORAGE_KEYS.USER_PLAN,
      STORAGE_KEYS.USER_NAME,
      STORAGE_KEYS.USER_EMAIL,
      STORAGE_KEYS.USER_PHOTO,
      STORAGE_KEYS.USER_FULL_NAME,
    ]);
    onLogout();
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
};