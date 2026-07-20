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
