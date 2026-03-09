export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      BACKEND_URL: process.env.BACKEND_URL || config.extra?.BACKEND_URL,
      WEB_CLIENT_ID: process.env.WEB_CLIENT_ID || config.extra?.WEB_CLIENT_ID,
    },
  };
};
