const API_BASE_URL = 'https://api.livelink.store/api';

console.log('🔍 Configuration API Service :');
console.log('- API_BASE_URL:', API_BASE_URL);

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('✅ ApiService initialisé avec:', this.baseURL);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.log('🌐 Requête API:', url);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      console.log('📤 Envoi de la requête...');
      const response = await fetch(url, config);
      console.log('📥 Réponse reçue:', response.status, response.statusText);
      
      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Erreur API:', data.error || 'Erreur inconnue');
        throw new Error(data.error || 'Erreur API');
      }

      console.log('✅ Requête réussie');
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la requête:', error);
      throw error;
    }
  }

  // Public routes for clients
  async getSellerProducts(sellerId) {
    return this.request(`/public/seller/${sellerId}/products`);
  }

  async createOrder(orderData) {
    return this.request('/public/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getOrderStatus(orderId) {
    return this.request(`/public/orders/${orderId}/status`);
  }
}

export default new ApiService(); 