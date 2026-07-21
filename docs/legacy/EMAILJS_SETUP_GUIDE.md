# 📧 Guide de Configuration EmailJS

## 🚀 Étapes pour configurer EmailJS

### 1. Créer un compte EmailJS
1. Allez sur [https://dashboard.emailjs.com](https://dashboard.emailjs.com)
2. Créez un compte gratuit
3. Confirmez votre email

### 2. Configurer un service email
1. Dans le dashboard, allez dans **"Email Services"**
2. Cliquez sur **"Add New Service"**
3. Choisissez votre fournisseur email (Gmail, Outlook, etc.)
4. Connectez votre compte email
5. **Copiez le Service ID** (ex: `service_abc123`)

### 3. Créer un template d'email
1. Allez dans **"Email Templates"**
2. Cliquez sur **"Create New Template"**
3. Utilisez ce template :

**Sujet :**
```
Nouveau message de contact - {{from_name}}
```

**Contenu :**
```
Bonjour,

Vous avez reçu un nouveau message de contact depuis votre site web :

Nom: {{from_name}}
Email: {{from_email}}
Téléphone: {{phone}}

Message:
{{message}}

---
Envoyé depuis livelink.store
```

4. **Copiez le Template ID** (ex: `template_xyz789`)

### 4. Obtenir la clé publique
1. Allez dans **"Account"** > **"General"**
2. **Copiez la Public Key** (ex: `user_abc123def456`)

### 5. Configurer le code
1. Ouvrez le fichier : `web-client/liveshop-client/src/config/emailjs.js`
2. Remplacez les valeurs :

```javascript
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_abc123',        // Votre Service ID
  TEMPLATE_ID: 'template_xyz789',      // Votre Template ID  
  PUBLIC_KEY: 'user_abc123def456'      // Votre Public Key
};
```

### 6. Tester le formulaire
1. Remplissez le formulaire de contact
2. Vérifiez que vous recevez l'email sur `contact@livelink.store`

## ✅ Vérifications

- [ ] Compte EmailJS créé
- [ ] Service email configuré
- [ ] Template créé avec les bonnes variables
- [ ] Clés ajoutées dans `emailjs.js`
- [ ] Test du formulaire réussi

## 🔧 Variables du template

Le template doit contenir ces variables :
- `{{from_name}}` - Nom de l'expéditeur
- `{{from_email}}` - Email de l'expéditeur  
- `{{phone}}` - Téléphone (optionnel)
- `{{message}}` - Message
- `{{to_email}}` - Email de destination

## 📱 Limites gratuites

- **200 emails/mois** gratuitement
- **3 services email** maximum
- **Templates illimités**

## 🆘 Support

Si vous avez des problèmes :
1. Vérifiez que toutes les clés sont correctes
2. Testez avec un email simple d'abord
3. Consultez la console du navigateur pour les erreurs
