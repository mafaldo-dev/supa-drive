import { Dimensions } from 'react-native';
import Constants from 'expo-constants';

export const { width, height } = Dimensions.get('window');

export const BACKEND_URL =
  process.env.BACKEND_URL ||
  Constants.manifest?.extra?.BACKEND_URL ||
  'https://backend-supa-drive.onrender.com';

export const APP_VERSION = 'BETA 1.0.1';

export const WEB_CLIENT_ID =
  process.env.WEB_CLIENT_ID ||
  Constants.manifest?.extra?.WEB_CLIENT_ID ||
  '9376164532-bc5fuh64gsfs6itm3rnhmt81sd9c5dq3.apps.googleusercontent.com';

export const PLANS = {
  monthly: { price: 19.90, label: '30 dias', description: 'Mensal' },
  yearly: { price: 129.90, label: '12 meses', description: 'Anual' },
};

export const APPS_OPTIONS = { uber: 'Uber', '99': '99', indrive: 'inDrive', lalamove: 'Lalamove' };
export const CATS_OPTIONS = {
  uberx: 'UberX', '99pop': '99Pop', comfort: 'Comfort',
  black: 'Black', entregas: 'Entregas', taxi: 'Taxi', flash: 'Flash', vip: 'VIP',
};