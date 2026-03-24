const axios = require('axios');

class OtpService {
  constructor() {
    // En prod: utilise OTP_PROVIDER de l'env; en dev: fallback nexteranga
    this.provider = process.env.OTP_PROVIDER || 'nexteranga';
    if (process.env.NODE_ENV !== 'production') console.log('🔐 OTP Service initialisé - Provider actif:', this.provider);
  }

  async sendOTP(phoneNumber, otp) {
    const original = this.normalizePhone(phoneNumber);
    const redirectTo = (process.env.DEV_OTP_REDIRECT_TO || '').trim();
    const destination = redirectTo ? this.normalizePhone(redirectTo) : original;

    // Ajout d'un suffixe pour identifier l'utilisateur concerné si redirigé
    const baseMessage = `Votre code LiveShop Link : ${otp}`;
    const message = redirectTo ? `${baseMessage} (pour: ${original})` : baseMessage;

    try {
      switch (this.provider) {
        case 'whatsapp_cloud':
          return await this.sendViaWhatsAppCloud(destination, message);
        case 'twilio':
          return await this.sendViaTwilio(destination, message);
        case 'nexteranga':
          return await this.sendViaNexteranga(original, otp);
        case 'callmebot':
          return await this.sendViaCallMeBot(destination, message);
        case 'console':
        default:
          if (process.env.NODE_ENV !== 'production') console.log(`[DEV] OTP pour ${original} => envoyé à ${destination} : ${otp}`);
          return true;
      }
    } catch (error) {
      console.error('❌ Échec envoi OTP:', error.response?.data || error.message);
      return false;
    }
  }

  normalizePhone(phone) {
    if (!phone) return phone;
    const trimmed = String(phone).trim();
    // Déjà au format E.164
    if (trimmed.startsWith('+')) return trimmed;
    // Numéro uniquement numérique
    if (/^\d+$/.test(trimmed)) {
      // Cas Sénégal: 9 chiffres commençant par 7 ou 6 -> préfixer +221
      if (/^[76]\d{8}$/.test(trimmed)) {
        return `+221${trimmed}`;
      }
      // Si déjà inclut un indicatif (ex: 221771234567)
      if (/^\d{11,15}$/.test(trimmed)) {
        return `+${trimmed}`;
      }
      // Fallback: ajouter simplement +
      return `+${trimmed}`;
    }
    return trimmed;
  }

  // WhatsApp Cloud (officiel)
  async sendViaWhatsAppCloud(to, body) {
    const token = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
    if (!token || !phoneId) {
      console.warn('⚠️ WHATSAPP_CLOUD_* non configuré, fallback console');
      if (process.env.NODE_ENV !== 'production') console.log(`[DEV] ${body} -> ${to}`);
      return true;
    }

    const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
    const payload = { messaging_product: 'whatsapp', to, type: 'text', text: { body } };

    const res = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    if (process.env.NODE_ENV !== 'production') console.log('✅ OTP envoyé via WhatsApp Cloud:', res.data);
    return true;
  }

  // Twilio (officiel)
  async sendViaTwilio(to, body) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const auth = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;
    if (!sid || !auth || !from) {
      console.warn('⚠️ TWILIO_* non configuré, fallback console');
      if (process.env.NODE_ENV !== 'production') console.log(`[DEV] ${body} -> ${to}`);
      return true;
    }

    const twilio = require('twilio')(sid, auth);
    const result = await twilio.messages.create({ from: `whatsapp:${from}`, to: `whatsapp:${to}`, body });

    if (process.env.NODE_ENV !== 'production') console.log('✅ OTP envoyé via Twilio:', result.sid);
    return true;
  }

  // Nexteranga (custom WhatsApp API - message personnalisé)
  async sendViaNexteranga(originalPhone, otp) {
    const apiUrl = process.env.NEXTERANGA_API_URL;
    const secret = process.env.NEXTERANGA_SECRET;

    if (!apiUrl || !secret) {
      console.warn('⚠️ NEXTERANGA_API_URL ou NEXTERANGA_SECRET manquant dans .env');
      if (process.env.NODE_ENV !== 'production') console.log(`[DEV] OTP ${otp} -> ${originalPhone}`);
      return true;
    }

    // Nexteranga attend un numéro sans +, avec indicatif (ex: 221771234567)
    const phoneForApi = String(originalPhone).replace(/^\+/, '');

    // Message professionnel personnalisé
    const message = `🔐 *LiveShop Link*\n\nVotre code de vérification est : *${otp}*\n\nCe code expire dans 5 minutes.\nNe partagez jamais ce code avec personne.`;

    const payload = {
      phone: phoneForApi,
      message: message
    };

    try {
      // Log sécurisé (sans exposer le secret)
      const maskedSecret = secret ? `${String(secret).slice(0,4)}...${String(secret).slice(-4)}` : 'none';
      if (process.env.NODE_ENV !== 'production') console.log('📤 Envoi OTP via Nexteranga:', {
        url: apiUrl,
        phone: phoneForApi,
        headers: { 'X-WA-SECRET': maskedSecret }
      });

      const res = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-WA-SECRET': secret
        },
        timeout: 8000
      });

      // On considère 2xx comme succès
      if (res.status >= 200 && res.status < 300) {
        console.log('✅ OTP envoyé via Nexteranga');
        return true;
      }

      console.error('❌ Nexteranga a répondu avec un statut non succès:', res.status, res.data);
      return false;
    } catch (error) {
      console.error('❌ Échec envoi OTP via Nexteranga:', error.response?.data || error.message);
      return false;
    }
  }

  // CallMeBot (non officiel, très simple)
  async sendViaCallMeBot(to, body) {
    const apiKey = process.env.CALLMEBOT_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ CALLMEBOT_API_KEY manquant, fallback console');
      if (process.env.NODE_ENV !== 'production') console.log(`[DEV] ${body} -> ${to}`);
      return true;
    }

    const url = 'https://api.callmebot.com/whatsapp.php';
    const params = new URLSearchParams({ phone: to.replace(/^\+/, ''), text: body, apikey: apiKey });

    const res = await axios.get(`${url}?${params.toString()}`);
    const ok = typeof res.data === 'string' ? /success|queued|message queued/i.test(res.data) : true;
    if (!ok) console.warn('⚠️ Réponse CallMeBot non confirmée:', res.data);
    if (process.env.NODE_ENV !== 'production') console.log('✅ OTP envoyé via CallMeBot');
    return true;
  }
}

module.exports = new OtpService(); 