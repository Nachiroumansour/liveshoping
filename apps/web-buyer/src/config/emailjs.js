// Configuration EmailJS
// Remplacez ces valeurs par vos vraies clés EmailJS

export const EMAILJS_CONFIG = {
  // Service ID - Créez un service sur https://dashboard.emailjs.com/admin
  SERVICE_ID: 'service_3kxswy4',
  
  // Template ID - Créez un template sur https://dashboard.emailjs.com/admin/templates
  TEMPLATE_ID: 'template_lx42nwm',
  
  // Public Key - Trouvez-la sur https://dashboard.emailjs.com/admin/integration
  PUBLIC_KEY: 'RingPNZJXA9wUu5sa'
};

// Template d'email recommandé pour EmailJS :
/*
Sujet: Nouveau message de contact - {{from_name}}

Bonjour,

Vous avez reçu un nouveau message de contact depuis votre site web :

Nom: {{from_name}}
Email: {{from_email}}
Téléphone: {{phone}}

Message:
{{message}}

---
Envoyé depuis livelink.store
*/
