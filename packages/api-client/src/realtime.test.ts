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
