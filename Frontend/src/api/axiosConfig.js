import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://uiaphotography.onrender.com', // Direct URL now that CORS is enabled
  timeout: 120000, // 2 minutes for slow operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 REQUEST: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ RESPONSE: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ ERROR DETAILS:');
    
    if (error.response) {
      // Server responded with error
      console.log('Type: Server Error');
      console.log('Status:', error.response.status);
      console.log('Full Response Data:', error.response.data);
      
      // Handle 422 Validation Errors specially
      if (error.response.status === 422 && error.response.data.detail) {
        console.log('📋 VALIDATION ERRORS:');
        error.response.data.detail.forEach((err, index) => {
          console.log(`  ${index + 1}. Field: ${err.loc.join(' -> ')}`);
          console.log(`     Message: ${err.msg}`);
          console.log(`     Type: ${err.type}`);
        });
      }
    } else if (error.request) {
      // Request made but no response
      console.log('Type: No Response Received');
      console.log('Possible cause: Network issue or backend is down');
    } else {
      // Something else happened
      console.log('Type: Request Setup Error');
      console.log('Message:', error.message);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return Promise.reject(error);
  }
);

export default apiClient;