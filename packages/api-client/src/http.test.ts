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

  it('updatePaymentSettings POST /api/sellers/payment-settings', async () => {
    token = 'jwt-abc';
    fetchMock.mockReturnValueOnce(okJson({ success: true }));
    await client.updatePaymentSettings({ wave: { phone: '771234567', enabled: true } });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.test/api/sellers/payment-settings');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ wave: { phone: '771234567', enabled: true } });
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
