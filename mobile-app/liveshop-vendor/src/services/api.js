// URL dynamique basée sur l'environnement
const getApiBaseUrl = () => {
  // FORCER LA PRODUCTION si on est sur livelink.store
  if (typeof window !== 'undefined' && window.location.hostname.includes('livelink.store')) {
    console.log('🌐 API Service - Forçage production pour livelink.store');
    return 'https://api.livelink.store/api';
  }

  // Support d'override via Vite
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) ? import.meta.env.VITE_BACKEND_URL : null;
  const envPort = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_PORT) ? import.meta.env.VITE_BACKEND_PORT : null;

  if (envUrl) {
    // Autoriser les valeurs comme "http://192.168.1.10:3001" ou "http://.../api"
    const cleaned = envUrl.replace(/\/$/, '');
    return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
  }

  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const isPrivateIp = (h) => (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h)
  );
  const port = envPort || '3001';
  
  if (isPrivateIp(hostname)) {
    return `${protocol}//${hostname}:${port}/api`;
  }
  
  // Production: même host sans port
  return `${protocol}//${hostname}/api`;
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Service - URL de base:', API_BASE_URL);
console.log('🔗 API Service - Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'unknown');

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('liveshop_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur API');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth
  async login(phoneNumber, pin) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone_number: phoneNumber, pin })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur de connexion');
    }

    return data;
  }

  async register(phoneNumber, name, pin) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        phone_number: phoneNumber,
        name: name,
        pin: pin
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur d\'inscription');
    }

    return data;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async resetPin(phoneNumber) {
    const response = await fetch(`${this.baseURL}/auth/reset-pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone_number: phoneNumber })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur de réinitialisation');
    }

    return data;
  }

  // Products
  async getProducts(page = 1, limit = 12) {
    return this.request(`/products?page=${page}&limit=${limit}`);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(productId, productData) {
    console.log('📤 API - updateProduct appelé avec:', {
      productId,
      productData
    });
    
    // Nettoyer les données avant envoi
    const cleanedData = {
      ...productData,
      // S'assurer que les nombres sont bien des nombres
      price: productData.price ? parseFloat(productData.price) : 0,
      stock_quantity: productData.stock_quantity ? parseInt(productData.stock_quantity) : 0,
      weight: productData.weight ? parseFloat(productData.weight) : null,
      // Nettoyer les dimensions
      dimensions: productData.dimensions && (
        productData.dimensions.length || 
        productData.dimensions.width || 
        productData.dimensions.height
      ) ? {
        length: productData.dimensions.length ? parseFloat(productData.dimensions.length) : null,
        width: productData.dimensions.width ? parseFloat(productData.dimensions.width) : null,
        height: productData.dimensions.height ? parseFloat(productData.dimensions.height) : null
      } : null,
      // S'assurer que les images sont bien formatées
      images: Array.isArray(productData.images) ? productData.images : [],
      // Nettoyer les attributs
      attributes: productData.attributes || {}
    };
    
    console.log('📤 API - Données nettoyées:', cleanedData);
    
    return this.request(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(cleanedData)
    });
  }

  async deleteProduct(productId) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE'
    });
  }

  async togglePinProduct(productId) {
    return this.request(`/products/${productId}/pin`, {
      method: 'PATCH'
    });
  }

  async getProductCategories() {
    return this.request('/products/categories');
  }

  // Orders
  async getOrders(status = null, page = 1, limit = 6) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page);
    params.append('limit', limit);
    return this.request(`/orders?${params.toString()}`);
  }

  async getOrderDetail(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async deleteOrder(orderId) {
    return this.request(`/orders/${orderId}`, {
      method: 'DELETE'
    });
  }

  async getOrderStats() {
    return this.request('/orders/stats/summary');
  }

  // Lives
  async createLive(liveData) {
    return this.request('/lives', {
      method: 'POST',
      body: JSON.stringify(liveData)
    });
  }

  async associateProductsToLive(liveId, productIds) {
    return this.request(`/lives/${liveId}/products`, {
      method: 'POST',
      body: JSON.stringify({ productIds })
    });
  }

  async deleteLive(liveId) {
    return this.request(`/lives/${liveId}`, {
      method: 'DELETE'
    });
  }

  // Lives avancé
  async getLives(sellerId) {
    return this.request(`/lives?sellerId=${sellerId}`);
  }
  async getProductsOfLive(liveId) {
    return this.request(`/lives/${liveId}/products`);
  }
  async getOrdersOfLive(liveId) {
    return this.request(`/lives/${liveId}/orders`);
  }

  // Credits
  async getCredits() {
    return this.request('/credits');
  }

  async getCreditPackages() {
    return this.request('/credits/packages');
  }

  async purchaseCredits(packageType, paymentMethod, paymentReference = null) {
    return this.request('/credits/purchase', {
      method: 'POST',
      body: JSON.stringify({
        packageType,
        paymentMethod,
        paymentReference
      })
    });
  }

  async checkCredits(actionType) {
    return this.request('/credits/check', {
      method: 'POST',
      body: JSON.stringify({ actionType })
    });
  }

  async getCreditHistory(limit = 50, offset = 0) {
    return this.request(`/credits/history?limit=${limit}&offset=${offset}`);
  }

  async getCreditStats() {
    return this.request('/credits/stats');
  }

  async addBonusCredits(amount, reason, metadata = {}) {
    return this.request('/credits/bonus', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        reason,
        metadata
      })
    });
  }

  // Admin
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getAdminSellers(page = 1, limit = 20) {
    return this.request(`/admin/sellers?page=${page}&limit=${limit}`);
  }

  async getAdminSellerDetails(id) {
    return this.request(`/admin/sellers/${id}`);
  }

  async updateSeller(id, updates) {
    return this.request(`/admin/sellers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async updateSellerCredits(id, amount, reason, type = 'bonus') {
    return this.request(`/admin/sellers/${id}/credits`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason, type })
    });
  }

  // Admin Orders
  async getAdminOrders(page = 1, limit = 20) {
    return this.request(`/admin/orders?page=${page}&limit=${limit}`);
  }

  // Admin Products
  async getAdminProducts(page = 1, limit = 20) {
    return this.request(`/admin/products?page=${page}&limit=${limit}`);
  }

  async deleteAdminProduct(productId) {
    return this.request(`/admin/products/${productId}`, {
      method: 'DELETE'
    });
  }

  // Admin Credits/Transactions
  async getAdminTransactions(page = 1, limit = 20) {
    return this.request(`/admin/transactions?page=${page}&limit=${limit}`);
  }

  // Super Admin - Gestion des vendeurs
  async suspendSeller(sellerId) {
    return this.request(`/admin/sellers/${sellerId}/suspend`, {
      method: 'POST'
    });
  }

  async activateSeller(sellerId) {
    return this.request(`/admin/sellers/${sellerId}/activate`, {
      method: 'POST'
    });
  }

  async getSellerOrders(sellerId) {
    return this.request(`/admin/sellers/${sellerId}/orders`);
  }

  async getSellerProducts(sellerId) {
    return this.request(`/admin/sellers/${sellerId}/products`);
  }

  // Payment Settings
  async getPaymentSettings() {
    return this.request('/sellers/payment-settings');
  }

  async updatePaymentSettings(settings) {
    return this.request('/sellers/payment-settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    });
  }

  async uploadQRCode(formData) {
    const url = `${this.baseURL}/sellers/upload-qr-code`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeaders().Authorization
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Erreur upload');
    }
    return data;
  }

  async deleteQRCode(paymentMethod) {
    return this.request(`/sellers/qr-code/${paymentMethod}`, {
      method: 'DELETE'
    });
  }

  // Shop Profile
  async getShopProfile() {
    return this.request('/sellers/profile');
  }

  async updateShopProfile(data) {
    return this.request('/sellers/profile', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async uploadLogo(formData) {
    const url = `${this.baseURL}/sellers/upload-logo`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeaders().Authorization
      },
      body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur upload');
    return data;
  }

  async deleteLogo() {
    return this.request('/sellers/logo', { method: 'DELETE' });
  }

  async updateSlug(slug) {
    return this.request('/sellers/slug', {
      method: 'PUT',
      body: JSON.stringify({ slug })
    });
  }

  // Admin Credits Settings
  async getCreditsModuleStatus() {
    return this.request('/admin/settings/credits/status');
  }

  async getCreditsSettings() {
    return this.request('/admin/settings/credits');
  }

  async updateCreditsSettings(settings) {
    return this.request('/admin/settings/credits', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  async toggleCreditsModule() {
    return this.request('/admin/settings/credits/toggle', {
      method: 'POST'
    });
  }

  async updateCreditPackage(packageType, data) {
    return this.request(`/admin/settings/credits/package/${packageType}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async updateActionCost(actionType, cost) {
    return this.request(`/admin/settings/credits/action-cost/${actionType}`, {
      method: 'PUT',
      body: JSON.stringify({ cost })
    });
  }

  async getCreditsStats() {
    return this.request('/admin/settings/credits/stats');
  }
}

export default new ApiService();

