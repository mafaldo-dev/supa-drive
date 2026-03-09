import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    extra: {
      BACKEND_URL: process.env.BACKEND_URL,
      WEB_CLIENT_ID: process.env.WEB_CLIENT_ID,
    },
  };
};
