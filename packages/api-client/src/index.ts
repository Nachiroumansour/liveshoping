import type { Order, OrderStatus, Product, Seller } from '@liveshop/shared';
import { createHttp, type ApiClientConfig } from './http';

export { ApiError } from './http';
export type { ApiClientConfig } from './http';

export interface LoginResponse {
  token: string;
  seller: Seller;
}

export function createApiClient(config: ApiClientConfig) {
  const request = createHttp(config);

  return {
    // ------- Auth (contrats: apps/backend/src/routes/auth.js) -------
    async login(phoneNumber: string, pin: string): Promise<LoginResponse> {
      const data = await request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { phone_number: phoneNumber, pin },
      });
      await config.setToken?.(data.token);
      return data;
    },

    async register(phoneNumber: string, name: string, pin: string): Promise<LoginResponse> {
      const data = await request<LoginResponse>('/auth/register', {
        method: 'POST',
        body: { phone_number: phoneNumber, name, pin },
      });
      await config.setToken?.(data.token);
      return data;
    },

    resetPin(phoneNumber: string) {
      return request<{ success: boolean }>('/auth/reset-pin', {
        method: 'POST',
        body: { phone_number: phoneNumber },
      });
    },

    getProfile() {
      return request<{ seller: Seller }>('/auth/profile');
    },

    async logout(): Promise<void> {
      await config.setToken?.(null);
    },

    // ------- Produits (contrats: apps/backend/src/routes/products.js) -------
    getProducts(page = 1, limit = 12) {
      return request<{ products: Product[]; total?: number }>(
        `/products?page=${page}&limit=${limit}`
      );
    },

    createProduct(productData: Partial<Product>) {
      return request<{ product: Product }>('/products', {
        method: 'POST',
        body: productData,
      });
    },

    updateProduct(productId: number, productData: Partial<Product>) {
      return request<{ product: Product }>(`/products/${productId}`, {
        method: 'PUT',
        body: productData,
      });
    },

    deleteProduct(productId: number) {
      return request<{ success: boolean }>(`/products/${productId}`, {
        method: 'DELETE',
      });
    },

    getProductCategories() {
      return request<{ categories: unknown[] }>('/products/categories');
    },

    // ------- Commandes (contrats: apps/backend/src/routes/orders.js) -------
    getOrders(status: OrderStatus | null = null, page = 1, limit = 6) {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', String(page));
      params.append('limit', String(limit));
      return request<{ orders: Order[]; total?: number }>(`/orders?${params.toString()}`);
    },

    getOrderDetail(orderId: number) {
      return request<{ order: Order }>(`/orders/${orderId}`);
    },

    updateOrderStatus(orderId: number, status: OrderStatus) {
      return request<{ success: boolean; order?: Order }>(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: { status },
      });
    },

    getOrderStats() {
      return request<{ stats: Record<string, number> }>('/orders/stats/summary');
    },

    // ------- Paramètres vendeur (contrats: apps/backend/src/routes/sellers.js) -------
    getPaymentSettings() {
      return request<{ settings: unknown }>('/sellers/payment-settings');
    },

    // Backend: router.post('/payment-settings', ...) — pas PUT (apps/backend/src/routes/sellers.js:37)
    updatePaymentSettings(settings: unknown) {
      return request<{ success: boolean }>('/sellers/payment-settings', {
        method: 'POST',
        body: settings,
      });
    },

    // ------- Upload (contrat: apps/backend/src/routes/upload.js) -------
    /** `file` doit être ajouté par l'appelant dans un FormData sous la clé "image". */
    uploadProductImage(formData: FormData) {
      return request<{ url: string }>('/upload/product', {
        method: 'POST',
        formData,
      });
    },

    // ------- Push Expo (contrat: Task 6 de ce plan) -------
    registerExpoPushToken(token: string) {
      return request<{ success: boolean }>('/push/expo-token', {
        method: 'POST',
        body: { token },
      });
    },

    removeExpoPushToken(token: string) {
      return request<{ success: boolean }>('/push/expo-token', {
        method: 'DELETE',
        body: { token },
      });
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
export { createRealtimeClient } from './realtime';
export type { RealtimeClient, RealtimeEvents } from './realtime';
