// Service léger de limitation OTP (in-memory)
// NOTE: In-memory => se réinitialise au redémarrage. Pour production durable: Redis conseillé.

const sendHistory = new Map(); // phone -> timestamps (ms)
const attemptHistory = new Map(); // key (phone|type) -> { attempts, lastFailure }

function now() { return Date.now(); }

const MAX_SENDS_PER_HOUR = parseInt(process.env.OTP_MAX_SENDS_PER_HOUR || '5', 10);
const SEND_COOLDOWN_MS = (parseInt(process.env.OTP_SEND_COOLDOWN_SECONDS || '60', 10)) * 1000;
const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);

function pruneOld(list, horizonMs) {
  const cutoff = now() - horizonMs;
  return list.filter(ts => ts >= cutoff);
}

function canSend(phone) {
  const normalized = String(phone).trim();
  const entries = sendHistory.get(normalized) || [];
  const pruned = pruneOld(entries, 3600_000); // 1h
  const last = pruned[pruned.length - 1];
  if (last && now() - last < SEND_COOLDOWN_MS) {
    const waitMs = SEND_COOLDOWN_MS - (now() - last);
    return { ok: false, code: 'COOLDOWN', retry_after_seconds: Math.ceil(waitMs / 1000) };
  }
  if (pruned.length >= MAX_SENDS_PER_HOUR) {
    return { ok: false, code: 'HOURLY_LIMIT', retry_after_seconds: 3600 - Math.floor((now() - pruned[0]) / 1000) };
  }
  return { ok: true };
}

function registerSend(phone) {
  const normalized = String(phone).trim();
  const entries = sendHistory.get(normalized) || [];
  entries.push(now());
  sendHistory.set(normalized, pruneOld(entries, 3600_000));
}

function attemptKey(phone, type) {
  return `${phone}|${type}`;
}

function registerAttempt(phone, type, success) {
  const key = attemptKey(phone, type);
  const data = attemptHistory.get(key) || { attempts: 0, lastFailure: null };
  if (success) {
    // Reset on success
    attemptHistory.delete(key);
    return;
  }
  data.attempts += 1;
  data.lastFailure = now();
  attemptHistory.set(key, data);
}

function canAttempt(phone, type) {
  const key = attemptKey(phone, type);
  const data = attemptHistory.get(key);
  if (!data) return { ok: true };
  if (data.attempts >= MAX_ATTEMPTS) {
    return { ok: false, code: 'ATTEMPT_LIMIT' };
  }
  return { ok: true };
}

module.exports = {
  canSend,
  registerSend,
  canAttempt,
  registerAttempt,
  // Expose config for debugging if needed
  config: { MAX_SENDS_PER_HOUR, SEND_COOLDOWN_MS, MAX_ATTEMPTS }
};
