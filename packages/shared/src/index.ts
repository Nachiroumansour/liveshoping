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
