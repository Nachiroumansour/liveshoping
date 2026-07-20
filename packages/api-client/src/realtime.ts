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
