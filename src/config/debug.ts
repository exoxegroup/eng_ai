export const getApiConfig = () => {
  const config = {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    port: window.location.port,
    viteApiUrl: import.meta.env.VITE_API_URL,
    apiBaseUrl: '',
    isLocal: window.location.hostname === 'localhost',
    isProduction: window.location.hostname !== 'localhost'
  };

  // Determine API URL based on environment
  if (config.viteApiUrl) {
    config.apiBaseUrl = config.viteApiUrl;
  } else if (config.isLocal) {
    config.apiBaseUrl = 'http://localhost:3001/api/v1';
  } else {
    // Use the actual backend service URL from deployment
    config.apiBaseUrl = 'https://ai-coach-backend-rg8j.onrender.com/api/v1';
  }

  return config;
};

export const logApiConfig = () => {
  const config = getApiConfig();
  console.log('🔍 API Configuration Debug:', config);
  return config;
};