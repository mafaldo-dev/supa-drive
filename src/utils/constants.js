import { Dimensions } from 'react-native';
import Constants from 'expo-constants';

export const { width, height } = Dimensions.get('window');

// sensitive values should be defined via environment variables or Expo extras
// add them to your `.env` (ignored) or to app.json under expo.extra
// e.g.:
// {
//   "expo": {
//     "extra": {
//       "BACKEND_URL": "https://api.example.com",
//       "WEB_CLIENT_ID": "your-google-client-id"
//     }
//   }
// }

export const BACKEND_URL =
  process.env.BACKEND_URL ||
  Constants.manifest?.extra?.BACKEND_URL ||
  'https://backend-supa-drive.onrender.com';

export const APP_VERSION = '1.0.1';

export const WEB_CLIENT_ID =
  process.env.WEB_CLIENT_ID ||
  Constants.manifest?.extra?.WEB_CLIENT_ID ||
  '9376164532-bc5fuh64gsfs6itm3rnhmt81sd9c5dq3.apps.googleusercontent.com';