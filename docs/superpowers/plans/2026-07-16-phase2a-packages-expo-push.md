# Phase 2a — Packages partagés + canal push Expo backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer `@liveshop/shared` et `@liveshop/api-client` (fondations TypeScript de l'app mobile Expo) et ajouter le canal de notification push Expo au backend, sans toucher au comportement de la PWA ni du web acheteur.

**Architecture:** Les deux packages suivent le pattern « internal packages » (export de la source TS, pas de build — Vite et Metro transpilent). `api-client` est agnostique de la plateforme : config par injection (`baseUrl`, `getToken`/`setToken`). Côté backend, le modèle `PushSubscription` gagne un champ `type` (`'webpush'` | `'expo'`), un nouveau `expoPushService` (expo-server-sdk) s'ajoute à côté du `webPushService` existant, et le fan-out de `notificationService` tente les deux canaux.

**Tech Stack:** TypeScript 5, vitest 3, socket.io-client 4.8, expo-server-sdk 3, Sequelize (existant), Express (existant).

## Global Constraints

- **Ne pas modifier le comportement de la PWA vendeur ni du web acheteur** : en Phase 2a, aucune app existante ne consomme les nouveaux packages (bascule = Phase 3 optionnelle, cf. spec).
- Noms exacts des packages : `@liveshop/shared`, `@liveshop/api-client` (spec).
- Pattern internal packages : `"main": "./src/index.ts"`, aucun build de package.
- L'endpoint Web Push existant (`POST /api/push/subscribe`) reste inchangé ; le token Expo passe par un **nouvel endpoint dédié `POST /api/push/expo-token`** (spec).
- Statuts de commande exacts (modèle Order) : `'pending' | 'paid' | 'delivered'`.
- Types de notification existants : `'new_order' | 'order_status_update' | 'new_comment' | 'credits_updated' | 'app_update'`.
- Contrats API : chemins et noms de champs **exactement** ceux du backend actuel (ex. body login = `{ phone_number, pin }`, réponse = `{ token, seller }`).
- Branche de travail : `feat/phase2a-packages-expo-push`. **Un push sur `main` déclenche le déploiement prod.**
- Backend en CommonJS (`require`) — suivre ce style pour tout fichier backend.
- Travailler depuis la racine : `/Users/macbook_1/devperso/liveshop-link-1`.

---

### Task 1: Outillage TypeScript + vitest du workspace

**Files:**
- Modify: `package.json` (racine — devDeps + rien d'autre)
- Create: `tsconfig.base.json`
- Modify: `turbo.json` (tâches `test` et `typecheck`)

**Interfaces:**
- Produces: `tsconfig.base.json` que les packages étendent (`"extends": "../../tsconfig.base.json"`) ; tâches turbo `test` (vitest) et `typecheck` (tsc) que les Tasks 2–4 utilisent via `pnpm test` / `pnpm typecheck`.

- [ ] **Step 1: Créer la branche**

```bash
git checkout -b feat/phase2a-packages-expo-push
```

- [ ] **Step 2: Ajouter les devDependencies racine**

Run: `pnpm add -Dw typescript@^5.7.0 vitest@^3.0.0`
Expected: succès, `package.json` racine et `pnpm-lock.yaml` mis à jour.

- [ ] **Step 3: Ajouter les scripts racine**

Dans `package.json` racine, ajouter aux `"scripts"` existants :

```json
    "test": "turbo run test",
    "typecheck": "turbo run typecheck"
```

- [ ] **Step 4: Créer `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "types": []
  }
}
```

- [ ] **Step 5: Ajouter les tâches turbo**

Dans `turbo.json`, ajouter aux `"tasks"` existantes :

```json
    "test": {
      "dependsOn": ["^build"]
    },
    "typecheck": {}
```

- [ ] **Step 6: Vérifier**

Run: `pnpm test`
Expected: turbo s'exécute et signale `Tasks: 0 successful, 0 total` (aucun package n'a encore de script `test`) — aucun échec.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.base.json turbo.json
git commit -m "chore: outillage typescript + vitest du workspace (phase 2a)"
```

---

### Task 2: `packages/shared` — constantes, formatage, validation téléphone

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/types.ts`
- Test: `packages/shared/src/index.test.ts`

**Interfaces:**
- Produces (consommé par api-client et l'app Expo en 2b) :
  - `ORDER_STATUSES: readonly ['pending','paid','delivered']`, `type OrderStatus`
  - `NOTIFICATION_TYPES: readonly ['new_order','order_status_update','new_comment','credits_updated','app_update']`, `type NotificationType`
  - `formatFcfa(amount: number): string` → `"12 500 FCFA"`
  - `normalizeSenegalPhone(input: string): string | null` → `"+221771234567"` ou `null`
  - `isValidSenegalPhone(input: string): boolean`
  - Types : `Seller`, `Product`, `Order`, `AppNotification` (voir types.ts)

- [ ] **Step 1: Créer `packages/shared/package.json`**

```json
{
  "name": "@liveshop/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 2: Créer `packages/shared/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src"]
}
```

- [ ] **Step 3: Écrire les tests qui échouent**

`packages/shared/src/index.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import {
  ORDER_STATUSES,
  NOTIFICATION_TYPES,
  formatFcfa,
  normalizeSenegalPhone,
  isValidSenegalPhone,
} from './index';

describe('ORDER_STATUSES', () => {
  it('matche exactement les statuts du modèle Order backend', () => {
    expect(ORDER_STATUSES).toEqual(['pending', 'paid', 'delivered']);
  });
});

describe('NOTIFICATION_TYPES', () => {
  it('contient les types utilisés par le backend', () => {
    expect(NOTIFICATION_TYPES).toEqual([
      'new_order',
      'order_status_update',
      'new_comment',
      'credits_updated',
      'app_update',
    ]);
  });
});

describe('formatFcfa', () => {
  it('groupe les milliers avec des espaces', () => {
    expect(formatFcfa(12500)).toBe('12 500 FCFA');
    expect(formatFcfa(1000000)).toBe('1 000 000 FCFA');
  });
  it('gère les petits montants et zéro', () => {
    expect(formatFcfa(500)).toBe('500 FCFA');
    expect(formatFcfa(0)).toBe('0 FCFA');
  });
  it('arrondit les décimales (le FCFA n a pas de centimes)', () => {
    expect(formatFcfa(1500.75)).toBe('1 501 FCFA');
  });
});

describe('normalizeSenegalPhone', () => {
  it('normalise les formats courants vers +221XXXXXXXXX', () => {
    expect(normalizeSenegalPhone('771234567')).toBe('+221771234567');
    expect(normalizeSenegalPhone('77 123 45 67')).toBe('+221771234567');
    expect(normalizeSenegalPhone('+221771234567')).toBe('+221771234567');
    expect(normalizeSenegalPhone('00221771234567')).toBe('+221771234567');
    expect(normalizeSenegalPhone('221771234567')).toBe('+221771234567');
  });
  it('accepte tous les préfixes mobiles sénégalais', () => {
    for (const p of ['70', '75', '76', '77', '78']) {
      expect(normalizeSenegalPhone(`${p}1234567`)).toBe(`+221${p}1234567`);
    }
  });
  it('rejette les numéros invalides', () => {
    expect(normalizeSenegalPhone('123')).toBeNull();
    expect(normalizeSenegalPhone('791234567')).toBeNull();
    expect(normalizeSenegalPhone('7712345678')).toBeNull();
    expect(normalizeSenegalPhone('')).toBeNull();
    expect(normalizeSenegalPhone('abcdefghi')).toBeNull();
  });
});

describe('isValidSenegalPhone', () => {
  it('reflète normalizeSenegalPhone', () => {
    expect(isValidSenegalPhone('77 123 45 67')).toBe(true);
    expect(isValidSenegalPhone('123')).toBe(false);
  });
});
```

- [ ] **Step 4: Vérifier que les tests échouent**

Run: `pnpm --filter @liveshop/shared test`
Expected: FAIL — `Cannot find module './index'` (ou équivalent).

- [ ] **Step 5: Implémenter `packages/shared/src/types.ts`**

```ts
import type { OrderStatus, NotificationType } from './index';

/** Vendeur — champs renvoyés par GET /api/auth/profile */
export interface Seller {
  id: number;
  name: string;
  phone_number: string;
  public_link_id: string;
  role?: string;
  is_active?: boolean;
  credit_balance?: number;
  payment_settings?: Record<string, { phone?: string; enabled?: boolean }> | null;
  logo_url?: string | null;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  price: number | null;
  stock_quantity: number;
  attributes?: Record<string, string>;
}

export interface Product {
  id: number;
  seller_id: number;
  name: string;
  description?: string | null;
  price: number;
  stock_quantity: number;
  images: Array<string | { url: string }>;
  category?: string | null;
  is_pinned?: boolean;
  variants?: ProductVariant[];
}

export interface Order {
  id: number;
  seller_id: number;
  product_id: number;
  product?: Product;
  customer_name: string;
  customer_phone: string;
  customer_address?: string | null;
  quantity: number;
  total_price: number;
  status: OrderStatus;
  payment_method?: string | null;
  comment?: string | null;
  created_at: string;
}

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
}
```

- [ ] **Step 6: Implémenter `packages/shared/src/index.ts`**

```ts
export const ORDER_STATUSES = ['pending', 'paid', 'delivered'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const NOTIFICATION_TYPES = [
  'new_order',
  'order_status_update',
  'new_comment',
  'credits_updated',
  'app_update',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Formate un montant en FCFA : 12500 → "12 500 FCFA" (pas de centimes). */
export function formatFcfa(amount: number): string {
  const rounded = Math.round(amount);
  const grouped = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${grouped} FCFA`;
}

const SN_MOBILE_PREFIXES = ['70', '75', '76', '77', '78'];

/**
 * Normalise un numéro mobile sénégalais vers +221XXXXXXXXX.
 * Accepte : "771234567", "77 123 45 67", "+221771234567", "00221…", "221…".
 * Retourne null si le numéro n'est pas un mobile SN valide (9 chiffres, préfixe 70/75/76/77/78).
 */
export function normalizeSenegalPhone(input: string): string | null {
  const digits = input.replace(/[\s.\-()]/g, '');
  let national: string;
  if (digits.startsWith('+221')) national = digits.slice(4);
  else if (digits.startsWith('00221')) national = digits.slice(5);
  else if (digits.startsWith('221') && digits.length === 12) national = digits.slice(3);
  else national = digits;

  if (!/^\d{9}$/.test(national)) return null;
  if (!SN_MOBILE_PREFIXES.includes(national.slice(0, 2))) return null;
  return `+221${national}`;
}

export function isValidSenegalPhone(input: string): boolean {
  return normalizeSenegalPhone(input) !== null;
}

export type {
  Seller,
  Product,
  ProductVariant,
  Order,
  AppNotification,
} from './types';
```

- [ ] **Step 7: Vérifier que les tests passent**

Run: `pnpm --filter @liveshop/shared test`
Expected: PASS — 5 fichiers de describe, tous verts, sortie propre.

Run: `pnpm --filter @liveshop/shared typecheck`
Expected: aucun diagnostic.

- [ ] **Step 8: Commit**

```bash
git add packages/shared pnpm-lock.yaml
git commit -m "feat(shared): package @liveshop/shared — statuts, FCFA, téléphone SN, types"
```

---

### Task 3: `packages/api-client` — client REST par injection

**Files:**
- Create: `packages/api-client/package.json`
- Create: `packages/api-client/tsconfig.json`
- Create: `packages/api-client/src/index.ts`
- Create: `packages/api-client/src/http.ts`
- Test: `packages/api-client/src/http.test.ts`

**Interfaces:**
- Consumes: types de `@liveshop/shared` (Task 2).
- Produces (consommé par l'app Expo en 2b) :
  - `createApiClient(config: ApiClientConfig): ApiClient`
  - `ApiClientConfig = { baseUrl: string; getToken: () => string | null | Promise<string | null>; setToken?: (t: string | null) => void | Promise<void> }`
  - `class ApiError extends Error { status: number; body: unknown }`
  - Méthodes (chemins backend exacts) : `login`, `register`, `resetPin`, `getProfile`, `getProducts`, `createProduct`, `updateProduct`, `deleteProduct`, `getProductCategories`, `getOrders`, `getOrderDetail`, `updateOrderStatus`, `getOrderStats`, `getPaymentSettings`, `updatePaymentSettings`, `registerExpoPushToken`, `removeExpoPushToken`, `uploadProductImage`

- [ ] **Step 1: Créer `packages/api-client/package.json`**

```json
{
  "name": "@liveshop/api-client",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@liveshop/shared": "workspace:*",
    "socket.io-client": "^4.8.1"
  }
}
```

- [ ] **Step 2: Créer `packages/api-client/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src"]
}
```

Run: `pnpm install`
Expected: succès, lien workspace `@liveshop/shared` créé.

- [ ] **Step 3: Écrire les tests qui échouent**

`packages/api-client/src/http.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiClient, ApiError } from './index';

const okJson = (data: unknown, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  );

describe('createApiClient', () => {
  const fetchMock = vi.fn();
  let token: string | null = null;

  const client = createApiClient({
    baseUrl: 'https://api.test',
    getToken: () => token,
    setToken: (t) => {
      token = t;
    },
  });

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    token = null;
  });

  it('login POST /api/auth/login avec {phone_number, pin} et stocke le token', async () => {
    fetchMock.mockReturnValueOnce(
      okJson({ token: 'jwt-123', seller: { id: 1, name: 'Awa' } })
    );
    const res = await client.login('+221771234567', '1234');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.test/api/auth/login');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ phone_number: '+221771234567', pin: '1234' });
    expect(res.token).toBe('jwt-123');
    expect(token).toBe('jwt-123'); // setToken appelé
  });

  it('joint Authorization: Bearer quand un token existe', async () => {
    token = 'jwt-abc';
    fetchMock.mockReturnValueOnce(okJson({ success: true, orders: [] }));
    await client.getOrders();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.test/api/orders?page=1&limit=6');
    expect(init.headers['Authorization']).toBe('Bearer jwt-abc');
  });

  it('getOrders passe status/page/limit en query', async () => {
    token = 'jwt-abc';
    fetchMock.mockReturnValueOnce(okJson({ success: true, orders: [] }));
    await client.getOrders('pending', 2, 10);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.test/api/orders?status=pending&page=2&limit=10');
  });

  it('updateOrderStatus PUT /api/orders/:id/status', async () => {
    token = 'jwt-abc';
    fetchMock.mockReturnValueOnce(okJson({ success: true }));
    await client.updateOrderStatus(42, 'paid');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.test/api/orders/42/status');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body)).toEqual({ status: 'paid' });
  });

  it('registerExpoPushToken POST /api/push/expo-token', async () => {
    token = 'jwt-abc';
    fetchMock.mockReturnValueOnce(okJson({ success: true }));
    await client.registerExpoPushToken('ExponentPushToken[xxx]');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.test/api/push/expo-token');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ token: 'ExponentPushToken[xxx]' });
  });

  it('jette ApiError avec status et message serveur sur erreur HTTP', async () => {
    fetchMock.mockReturnValueOnce(okJson({ error: 'PIN incorrect' }, 401));
    await expect(client.login('+221771234567', '0000')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      message: 'PIN incorrect',
    });
  });

  it('accepte un getToken asynchrone (SecureStore)', async () => {
    const asyncClient = createApiClient({
      baseUrl: 'https://api.test',
      getToken: async () => 'async-token',
    });
    fetchMock.mockReturnValueOnce(okJson({ success: true, orders: [] }));
    await asyncClient.getOrders();
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['Authorization']).toBe('Bearer async-token');
  });
});
```

- [ ] **Step 4: Vérifier que les tests échouent**

Run: `pnpm --filter @liveshop/api-client test`
Expected: FAIL — `Cannot find module './index'`.

- [ ] **Step 5: Implémenter `packages/api-client/src/http.ts`**

```ts
export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export interface ApiClientConfig {
  /** Ex. "https://api.livelink.store" (sans /api final). */
  baseUrl: string;
  getToken: () => string | null | Promise<string | null>;
  setToken?: (token: string | null) => void | Promise<void>;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** FormData brut (upload) — exclusif de body. */
  formData?: FormData;
}

export function createHttp(config: ApiClientConfig) {
  const root = config.baseUrl.replace(/\/$/, '');

  return async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const token = await config.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let body: BodyInit | undefined;
    if (options.formData) {
      body = options.formData; // fetch pose le Content-Type multipart lui-même
    } else if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    }

    const response = await fetch(`${root}/api${path}`, {
      method: options.method ?? 'GET',
      headers,
      body,
    });

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      // réponse sans corps JSON
    }

    if (!response.ok) {
      const message =
        (data as { error?: string } | null)?.error ?? `Erreur API (${response.status})`;
      throw new ApiError(response.status, message, data);
    }

    return data as T;
  };
}
```

- [ ] **Step 6: Implémenter `packages/api-client/src/index.ts`**

```ts
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

    updatePaymentSettings(settings: unknown) {
      return request<{ success: boolean }>('/sellers/payment-settings', {
        method: 'PUT',
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
```

Note : `./realtime` est créé en Task 4. Pour que cette task compile seule, créer aussi un stub `packages/api-client/src/realtime.ts` :

```ts
// Implémenté en Task 4 (createRealtimeClient).
export interface RealtimeEvents {}
export interface RealtimeClient {}
export function createRealtimeClient(): never {
  throw new Error('createRealtimeClient: implémenté en Task 4');
}
```

- [ ] **Step 7: Vérifier que les tests passent**

Run: `pnpm --filter @liveshop/api-client test`
Expected: PASS — 7 tests verts, sortie propre.

Run: `pnpm --filter @liveshop/api-client typecheck`
Expected: aucun diagnostic.

- [ ] **Step 8: Vérifier les chemins sellers (risque de contrat)**

Les chemins `/sellers/payment-settings` doivent correspondre au backend réel :

Run: `grep -n "payment-settings" apps/backend/src/routes/sellers.js apps/vendor-pwa/src/services/api.js | head -6`
Expected: les deux fichiers montrent le même chemin. Si le chemin réel diffère (ex. `/sellers/me/payment-settings`), corriger `getPaymentSettings`/`updatePaymentSettings` ET ajouter un test miroir de `updateOrderStatus` pour ces méthodes.

- [ ] **Step 9: Commit**

```bash
git add packages/api-client pnpm-lock.yaml
git commit -m "feat(api-client): client REST @liveshop/api-client par injection de config"
```

---

### Task 4: `packages/api-client` — client temps réel Socket.IO

**Files:**
- Modify: `packages/api-client/src/realtime.ts` (remplace le stub de la Task 3)
- Test: `packages/api-client/src/realtime.test.ts`

**Interfaces:**
- Consumes: `socket.io-client` (dépendance déjà déclarée en Task 3).
- Produces (consommé par l'app Expo en 2b) :
  - `createRealtimeClient(config: { url: string; getToken: () => string | null | Promise<string | null> }): RealtimeClient`
  - `RealtimeClient.connect(): void`, `.disconnect(): void`
  - `.on<E extends keyof RealtimeEvents>(event: E, cb: RealtimeEvents[E]): () => void` (retourne un unsubscribe)
  - `.ackNotification(notificationId: number): void`
  - Événements (noms exacts du backend) : `authenticated`, `authentication_error`, `new_order`, `notification`, `order_status_update`, `disconnected`

- [ ] **Step 1: Écrire les tests qui échouent**

`packages/api-client/src/realtime.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Faux socket : capture les handlers .on() et permet de simuler des événements serveur.
// vi.hoisted est OBLIGATOIRE : vi.mock est hissé au-dessus des imports/const,
// sans lui la factory référencerait des variables non initialisées (ReferenceError).
const { handlers, fakeSocket, ioMock } = vi.hoisted(() => {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  const fakeSocket = {
    on: (event: string, cb: (...args: unknown[]) => void) => {
      handlers.set(event, cb);
    },
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
  };
  const ioMock = vi.fn(() => fakeSocket);
  return { handlers, fakeSocket, ioMock };
});
vi.mock('socket.io-client', () => ({ io: ioMock }));

import { createRealtimeClient } from './realtime';

describe('createRealtimeClient', () => {
  beforeEach(() => {
    handlers.clear();
    ioMock.mockClear();
    fakeSocket.emit.mockClear();
    fakeSocket.disconnect.mockClear();
  });

  it('connect() ouvre la socket sur url et s authentifie au connect', async () => {
    const client = createRealtimeClient({ url: 'https://api.test', getToken: () => 'jwt-1' });
    client.connect();

    expect(ioMock).toHaveBeenCalledWith(
      'https://api.test',
      expect.objectContaining({ transports: ['websocket', 'polling'] })
    );

    handlers.get('connect')!();
    await vi.waitFor(() => {
      expect(fakeSocket.emit).toHaveBeenCalledWith('authenticate', { token: 'jwt-1' });
    });
  });

  it('relaie new_order aux abonnés et permet le désabonnement', () => {
    const client = createRealtimeClient({ url: 'https://api.test', getToken: () => 'jwt-1' });
    client.connect();

    const received: unknown[] = [];
    const unsubscribe = client.on('new_order', (data) => received.push(data));

    handlers.get('new_order')!({ order: { id: 7 } });
    expect(received).toEqual([{ order: { id: 7 } }]);

    unsubscribe();
    handlers.get('new_order')!({ order: { id: 8 } });
    expect(received).toHaveLength(1);
  });

  it('ackNotification émet notification_ack', () => {
    const client = createRealtimeClient({ url: 'https://api.test', getToken: () => 'jwt-1' });
    client.connect();
    client.ackNotification(123);
    expect(fakeSocket.emit).toHaveBeenCalledWith('notification_ack', { notificationId: 123 });
  });

  it('disconnect() ferme la socket', () => {
    const client = createRealtimeClient({ url: 'https://api.test', getToken: () => 'jwt-1' });
    client.connect();
    client.disconnect();
    expect(fakeSocket.disconnect).toHaveBeenCalled();
  });

  it('connect() est idempotent (une seule socket)', () => {
    const client = createRealtimeClient({ url: 'https://api.test', getToken: () => 'jwt-1' });
    client.connect();
    client.connect();
    expect(ioMock).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

Run: `pnpm --filter @liveshop/api-client test`
Expected: FAIL — le stub `createRealtimeClient` jette `implémenté en Task 4`.

- [ ] **Step 3: Implémenter `packages/api-client/src/realtime.ts`**

```ts
import { io, type Socket } from 'socket.io-client';

/** Événements serveur → client, noms exacts du backend Socket.IO. */
export interface RealtimeEvents {
  authenticated: (data: unknown) => void;
  authentication_error: (error: unknown) => void;
  new_order: (data: unknown) => void;
  notification: (data: unknown) => void;
  order_status_update: (data: unknown) => void;
  disconnected: (reason: string) => void;
}

export interface RealtimeConfig {
  /** Ex. "https://api.livelink.store" — même hôte que l'API. */
  url: string;
  getToken: () => string | null | Promise<string | null>;
}

const RELAYED_EVENTS = [
  'authenticated',
  'authentication_error',
  'new_order',
  'notification',
  'order_status_update',
] as const;

export function createRealtimeClient(config: RealtimeConfig) {
  let socket: Socket | null = null;
  const listeners = new Map<keyof RealtimeEvents, Set<(...args: never[]) => void>>();

  function relay(event: keyof RealtimeEvents, ...args: unknown[]) {
    listeners.get(event)?.forEach((cb) => (cb as (...a: unknown[]) => void)(...args));
  }

  return {
    connect(): void {
      if (socket) return;
      socket = io(config.url, {
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', async () => {
        const token = await config.getToken();
        socket?.emit('authenticate', { token });
      });

      for (const event of RELAYED_EVENTS) {
        socket.on(event, (...args: unknown[]) => relay(event, ...args));
      }

      socket.on('disconnect', (reason: string) => relay('disconnected', reason));
    },

    on<E extends keyof RealtimeEvents>(event: E, cb: RealtimeEvents[E]): () => void {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(cb as (...args: never[]) => void);
      return () => listeners.get(event)?.delete(cb as (...args: never[]) => void);
    },

    ackNotification(notificationId: number): void {
      socket?.emit('notification_ack', { notificationId });
    },

    disconnect(): void {
      socket?.disconnect();
      socket = null;
    },
  };
}

export type RealtimeClient = ReturnType<typeof createRealtimeClient>;
```

- [ ] **Step 4: Vérifier que tout passe**

Run: `pnpm --filter @liveshop/api-client test`
Expected: PASS — 12 tests verts (http + realtime), sortie propre.

Run: `pnpm typecheck && pnpm test`
Expected: turbo vert sur les 2 packages.

- [ ] **Step 5: Commit**

```bash
git add packages/api-client
git commit -m "feat(api-client): client temps réel Socket.IO (authenticate, new_order, ack)"
```

---

### Task 5: Backend — modèle PushSubscription multi-canal + migration

**Files:**
- Modify: `apps/backend/src/models/PushSubscription.js`
- Create: `apps/backend/src/scripts/migrate-push-type.js`

**Interfaces:**
- Produces: colonne `type` (`'webpush'` | `'expo'`, défaut `'webpush'`) sur `push_subscriptions` ; `keys_p256dh`/`keys_auth` nullable (les lignes Expo n'ont pas de clés VAPID — le token Expo est stocké dans `endpoint`, qui garde sa contrainte unique). La Task 6 s'appuie sur `PushSubscription.findAll({ where: { seller_id, type: 'expo' } })`.

- [ ] **Step 1: Mettre à jour le modèle**

Dans `apps/backend/src/models/PushSubscription.js`, remplacer les définitions de `keys_p256dh` et `keys_auth` et ajouter `type` :

```js
  endpoint: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  // 'webpush' : endpoint = URL push du navigateur, keys_* requis
  // 'expo'    : endpoint = ExponentPushToken[...], keys_* null
  type: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'webpush',
    validate: {
      isIn: [['webpush', 'expo']]
    }
  },
  keys_p256dh: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  keys_auth: {
    type: DataTypes.TEXT,
    allowNull: true
  }
```

Et ajouter l'index dans le tableau `indexes` existant :

```js
    { fields: ['seller_id', 'type'] }
```

- [ ] **Step 2: Créer le script de migration**

`apps/backend/src/scripts/migrate-push-type.js` (même style que les scripts `migrate-*` existants) :

```js
// Migration : push_subscriptions multi-canal (webpush | expo)
// Usage : node src/scripts/migrate-push-type.js (depuis apps/backend)
require('dotenv').config();
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

async function migrate() {
  const qi = sequelize.getQueryInterface();
  const table = await qi.describeTable('push_subscriptions');

  if (!table.type) {
    await qi.addColumn('push_subscriptions', 'type', {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'webpush'
    });
    console.log('✅ Colonne type ajoutée (défaut webpush)');
  } else {
    console.log('ℹ️ Colonne type déjà présente');
  }

  // SQLite ne supporte pas changeColumn proprement ; les nouvelles lignes Expo
  // passent par le modèle (allowNull: true). En PostgreSQL on relâche la contrainte.
  if (sequelize.getDialect() === 'postgres') {
    await sequelize.query(
      'ALTER TABLE push_subscriptions ALTER COLUMN keys_p256dh DROP NOT NULL'
    );
    await sequelize.query(
      'ALTER TABLE push_subscriptions ALTER COLUMN keys_auth DROP NOT NULL'
    );
    console.log('✅ keys_p256dh / keys_auth rendues nullable');
  }

  await sequelize.close();
  console.log('✅ Migration push_subscriptions terminée');
}

migrate().catch((err) => {
  console.error('❌ Migration échouée:', err);
  process.exit(1);
});
```

- [ ] **Step 3: Exécuter la migration en local (SQLite dev)**

Run: `(cd apps/backend && node src/scripts/migrate-push-type.js)`
Expected: `✅ Colonne type ajoutée (défaut webpush)` puis `✅ Migration push_subscriptions terminée`.

Run (idempotence): `(cd apps/backend && node src/scripts/migrate-push-type.js)`
Expected: `ℹ️ Colonne type déjà présente`.

- [ ] **Step 4: Vérifier le modèle**

Run: `(cd apps/backend && node -e "const PS = require('./src/models/PushSubscription'); const t = PS.rawAttributes.type; console.log('type default:', t.defaultValue); console.log('keys nullable:', PS.rawAttributes.keys_p256dh.allowNull, PS.rawAttributes.keys_auth.allowNull)")`
Expected:
```
type default: webpush
keys nullable: true true
```

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/models/PushSubscription.js apps/backend/src/scripts/migrate-push-type.js
git commit -m "feat(backend): PushSubscription multi-canal (webpush|expo) + migration"
```

---

### Task 6: Backend — expoPushService, endpoint expo-token, fan-out

**Files:**
- Create: `apps/backend/src/services/expoPushService.js`
- Modify: `apps/backend/src/routes/push.js` (ajout de 2 routes, rien de supprimé)
- Modify: `apps/backend/src/services/notificationService.js:82-89` (fan-out)
- Modify: `apps/backend/package.json` (dépendance expo-server-sdk)
- Test: `apps/backend/src/scripts/test-expo-push.js`

**Interfaces:**
- Consumes: modèle `PushSubscription` avec `type` (Task 5) ; `webPushService.sendPushNotification(sellerId, notification)` existant (inchangé).
- Produces:
  - `expoPushService.saveToken(sellerId: number, token: string): Promise<boolean>` (jette si token non-Expo)
  - `expoPushService.removeToken(sellerId: number, token?: string): Promise<boolean>`
  - `expoPushService.sendPushNotification(sellerId: number, notification): Promise<boolean>` (même signature que webPushService)
  - Routes : `POST /api/push/expo-token` `{token}` (201/200), `DELETE /api/push/expo-token` `{token?}` — toutes deux authentifiées (`authenticateToken`), consommées par `registerExpoPushToken`/`removeExpoPushToken` du api-client (Task 3).

- [ ] **Step 1: Installer expo-server-sdk**

Run: `pnpm --filter @liveshop/backend add expo-server-sdk@^3.11.0`
Expected: succès, `apps/backend/package.json` et lockfile racine mis à jour.

- [ ] **Step 2: Créer `apps/backend/src/services/expoPushService.js`**

```js
const { Expo } = require('expo-server-sdk');

/**
 * Canal push natif (app Expo vendeur). Symétrique de webPushService :
 * même signature sendPushNotification(sellerId, notification).
 * Le token Expo (ExponentPushToken[...]) est stocké dans push_subscriptions.endpoint
 * avec type='expo' (keys_* null).
 */
class ExpoPushService {
  constructor() {
    this.expo = new Expo();
  }

  getModel() {
    return require('../models/PushSubscription');
  }

  isExpoToken(token) {
    return Expo.isExpoPushToken(token);
  }

  async saveToken(sellerId, token) {
    if (!this.isExpoToken(token)) {
      throw new Error('Token Expo invalide');
    }

    const PushSubscription = this.getModel();
    const [sub] = await PushSubscription.findOrCreate({
      where: { endpoint: token },
      defaults: {
        seller_id: sellerId,
        endpoint: token,
        type: 'expo',
        keys_p256dh: null,
        keys_auth: null
      }
    });

    // L'appareil a changé de compte
    if (sub.seller_id !== sellerId) {
      await sub.update({ seller_id: sellerId });
    }

    console.log(`Expo push token enregistré pour seller ${sellerId}`);
    return true;
  }

  async removeToken(sellerId, token = null) {
    const PushSubscription = this.getModel();
    const where = token
      ? { seller_id: sellerId, type: 'expo', endpoint: token }
      : { seller_id: sellerId, type: 'expo' };
    await PushSubscription.destroy({ where });
    return true;
  }

  async sendPushNotification(sellerId, notification) {
    const PushSubscription = this.getModel();
    const subscriptions = await PushSubscription.findAll({
      where: { seller_id: sellerId, type: 'expo' }
    });

    if (subscriptions.length === 0) return false;

    const messages = subscriptions
      .filter((sub) => this.isExpoToken(sub.endpoint))
      .map((sub) => ({
        to: sub.endpoint,
        sound: 'default',
        title: notification.title || 'LiveShop Link',
        body: notification.message || '',
        priority: notification.type === 'new_order' ? 'high' : 'default',
        data: {
          notificationId: notification.id,
          type: notification.type,
          ...(notification.data || {})
        }
      }));

    if (messages.length === 0) return false;

    let sent = false;
    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);
        for (let i = 0; i < tickets.length; i++) {
          const ticket = tickets[i];
          if (ticket.status === 'ok') {
            sent = true;
          } else if (ticket.details?.error === 'DeviceNotRegistered') {
            // Token expiré : purger la ligne correspondante
            const badToken = chunk[i].to;
            await PushSubscription.destroy({
              where: { endpoint: badToken, type: 'expo' }
            });
            console.log(`Token Expo expiré supprimé (${String(badToken).slice(-12)})`);
          } else {
            console.error(`Expo push erreur seller ${sellerId}:`, ticket.details?.error || ticket.message);
          }
        }
      } catch (error) {
        console.error(`Expo push envoi échoué seller ${sellerId}:`, error.message);
      }
    }

    return sent;
  }
}

const expoPushService = new ExpoPushService();
module.exports = expoPushService;
```

- [ ] **Step 3: Ajouter les routes dans `apps/backend/src/routes/push.js`**

Après le `require` de `webPushService` (ligne 4), ajouter :

```js
const expoPushService = require('../services/expoPushService');
```

Avant le `module.exports = router;` final, ajouter :

```js
// Enregistrer un token push Expo (app mobile native)
router.post('/expo-token', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || !expoPushService.isExpoToken(token)) {
      return res.status(400).json({
        success: false,
        error: 'Token Expo invalide'
      });
    }

    await expoPushService.saveToken(req.seller.id, token);

    res.json({
      success: true,
      message: 'Token Expo enregistré'
    });
  } catch (error) {
    console.error('❌ Erreur enregistrement token Expo:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement'
    });
  }
});

// Supprimer un token push Expo (déconnexion de l'app mobile)
router.delete('/expo-token', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body || {};
    await expoPushService.removeToken(req.seller.id, token || null);

    res.json({
      success: true,
      message: 'Token Expo supprimé'
    });
  } catch (error) {
    console.error('❌ Erreur suppression token Expo:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression'
    });
  }
});
```

- [ ] **Step 4: Étendre le fan-out dans `notificationService.js`**

En tête de fichier, après `const webPushService = require('./webPushService');` (ligne 4), ajouter :

```js
const expoPushService = require('./expoPushService');
```

Remplacer la ligne 84 :

```js
        const pushSent = await webPushService.sendPushNotification(sellerId, notification);
```

par :

```js
        const webSent = await webPushService.sendPushNotification(sellerId, notification);
        const expoSent = await expoPushService.sendPushNotification(sellerId, notification);
        const pushSent = webSent || expoSent;
```

- [ ] **Step 5: Écrire le script de test**

`apps/backend/src/scripts/test-expo-push.js` (même pattern que les `test-*.js` existants — s'exécute sur la base SQLite dev locale) :

```js
// Test du canal push Expo : modèle, service, cohabitation webpush.
// Usage : node src/scripts/test-expo-push.js (depuis apps/backend)
require('dotenv').config();
const assert = require('assert');
const { sequelize } = require('../config/database');
const PushSubscription = require('../models/PushSubscription');
const { Seller } = require('../models');
const expoPushService = require('../services/expoPushService');

const FAKE_TOKEN = 'ExponentPushToken[test-migration-0001]';

async function run() {
  await sequelize.sync();

  // Réutiliser un vrai seller (base dev seedée) pour respecter la FK
  const seller = await Seller.findOne();
  const SELLER_ID = seller ? seller.id : 999901;

  // 0. Nettoyage
  await PushSubscription.destroy({ where: { endpoint: FAKE_TOKEN } });

  // 1. Validation de format
  assert.strictEqual(expoPushService.isExpoToken(FAKE_TOKEN), true, 'token Expo valide refusé');
  assert.strictEqual(expoPushService.isExpoToken('pas-un-token'), false, 'token invalide accepté');

  // 2. saveToken crée une ligne type=expo sans clés
  await expoPushService.saveToken(SELLER_ID, FAKE_TOKEN);
  const row = await PushSubscription.findOne({ where: { endpoint: FAKE_TOKEN } });
  assert.ok(row, 'ligne non créée');
  assert.strictEqual(row.type, 'expo');
  assert.strictEqual(row.seller_id, SELLER_ID);
  assert.strictEqual(row.keys_p256dh, null);

  // 3. saveToken est idempotent (même endpoint → pas de doublon)
  await expoPushService.saveToken(SELLER_ID, FAKE_TOKEN);
  const count = await PushSubscription.count({ where: { endpoint: FAKE_TOKEN } });
  assert.strictEqual(count, 1, 'doublon créé');

  // 4. saveToken refuse un token invalide
  await assert.rejects(
    () => expoPushService.saveToken(SELLER_ID, 'nimporte-quoi'),
    /Token Expo invalide/
  );

  // 5. sendPushNotification n'explose pas et renvoie un booléen
  //    (le token factice sera rejeté par l'API Expo : sent=false attendu,
  //    ou ticket ok si Expo accepte le format — les deux sont tolérés)
  const sent = await expoPushService.sendPushNotification(SELLER_ID, {
    id: 1,
    type: 'new_order',
    title: 'Test',
    message: 'Test expo push',
    data: {}
  });
  assert.strictEqual(typeof sent, 'boolean');

  // 6. removeToken purge
  await expoPushService.removeToken(SELLER_ID);
  const after = await PushSubscription.count({ where: { seller_id: SELLER_ID, type: 'expo' } });
  assert.strictEqual(after, 0, 'token non purgé');

  // 7. Le fan-out notificationService charge sans erreur avec le nouveau service
  require('../services/notificationService');

  await sequelize.close();
  console.log('✅ test-expo-push : 7/7 assertions OK');
}

run().catch((err) => {
  console.error('❌ test-expo-push échoué:', err);
  process.exit(1);
});
```

- [ ] **Step 6: Exécuter le script de test**

Run: `(cd apps/backend && node src/scripts/test-expo-push.js)`
Expected: `✅ test-expo-push : 7/7 assertions OK` (l'étape 5 peut logger une erreur d'envoi Expo pour le token factice — toléré tant que le script se termine en succès).

- [ ] **Step 7: Vérifier que le backend démarre toujours**

```bash
(cd apps/backend && nohup node src/app.js > /tmp/liveshop-boot-test.log 2>&1 & echo $! > /tmp/liveshop-boot-test.pid)
until curl -s http://localhost:3001/api/health > /dev/null 2>&1; do sleep 1; done
curl -s http://localhost:3001/api/health | head -c 80; echo
kill "$(cat /tmp/liveshop-boot-test.pid)"
grep -i "cannot find module" /tmp/liveshop-boot-test.log || echo "boot sans erreur de module"
```

Expected: JSON de santé, puis `boot sans erreur de module`.

- [ ] **Step 8: Commit**

```bash
git add apps/backend/package.json pnpm-lock.yaml apps/backend/src/services/expoPushService.js apps/backend/src/routes/push.js apps/backend/src/services/notificationService.js apps/backend/src/scripts/test-expo-push.js
git commit -m "feat(backend): canal push Expo (expo-server-sdk) + endpoint /api/push/expo-token + fan-out"
```

---

### Task 7: Intégration — build Docker, stack locale, checkpoint déploiement

**Files:**
- Aucun nouveau fichier (vérification d'intégration + déploiement).

**Interfaces:**
- Consumes: tout le travail des Tasks 1–6.
- Produces: Phase 2a en production, migration exécutée sur la base prod.

- [ ] **Step 1: Vérification workspace complète**

```bash
pnpm install && pnpm typecheck && pnpm test && pnpm build
```

Expected: tout vert (2 packages testés/typecheckés, 2 fronts buildés).

- [ ] **Step 2: Build Docker backend (la seule image impactée)**

Run: `docker compose build backend`
Expected: build vert — la nouvelle dépendance `expo-server-sdk` s'installe avec `--frozen-lockfile`.

- [ ] **Step 3: Stack locale + test de l'endpoint**

```bash
docker compose up -d
until docker exec livelink-backend node -e "require('http').get('http://localhost:3001/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))" 2>/dev/null; do sleep 3; done
echo "backend UP"
# La migration doit tourner dans le conteneur (base Postgres locale)
docker exec livelink-backend node src/scripts/migrate-push-type.js
# Sans token JWT on attend un 401 (l'endpoint existe et est protégé)
docker exec livelink-backend node -e "
const http = require('http');
const req = http.request({ host: 'localhost', port: 3001, path: '/api/push/expo-token', method: 'POST', headers: {'Content-Type':'application/json'} }, r => { console.log('expo-token status:', r.statusCode); process.exit(0) });
req.end(JSON.stringify({ token: 'x' }));
"
docker compose down
```

Expected: `backend UP`, migration `✅ … terminée`, puis `expo-token status: 401` (protégé par authenticateToken).

- [ ] **Step 4: ⚠️ CHECKPOINT UTILISATEUR — accord explicite avant merge**

Le merge sur `main` déclenche le déploiement prod. Ne pas merger sans le feu vert.

- [ ] **Step 5: Merger et pousser** (l'utilisateur exécute si le classifieur bloque)

```bash
git checkout main
git merge --no-ff feat/phase2a-packages-expo-push -m "feat: packages partagés + canal push Expo backend (phase 2a)"
git push origin main
```

- [ ] **Step 6: Surveiller le déploiement et migrer la prod**

```bash
gh run watch $(gh run list --workflow=deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
curl -s -o /dev/null -w "api: %{http_code}\n" https://api.livelink.store/api/health
```

Expected: workflow vert, `api: 200`.

Puis exécuter la migration sur le VPS (via SSH utilisateur ou instruction à donner) :

```bash
# Sur le VPS :
docker exec livelink-backend node src/scripts/migrate-push-type.js
```

Expected: `✅ Colonne type ajoutée` + `✅ keys_p256dh / keys_auth rendues nullable` (dialecte postgres).

- [ ] **Step 7: Vérification finale prod**

```bash
curl -s -X POST https://api.livelink.store/api/push/expo-token -H "Content-Type: application/json" -d '{"token":"x"}' -o /dev/null -w "expo-token: %{http_code}\n"
```

Expected: `expo-token: 401` (endpoint déployé et protégé).
