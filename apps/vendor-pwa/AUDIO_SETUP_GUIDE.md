# 🎤 Guide d'Enregistrement Audio Wolof

## 📋 Messages à Enregistrer

### 🛒 Messages de Base (Nouvelles Commandes)

1. **`new-order-intro.mp3`** - "Amna kou commander" (Vous avez une commande)
2. **`customer-name-prefix.mp3`** - "Jëkkë bi" (Le client)
3. **`product-prefix.mp3`** - "Dëkk bi" (Le produit)
4. **`address-prefix.mp3`** - "Adres bi" (L'adresse)
5. **`total-price-prefix.mp3`** - "Xaalis bi" (Le montant)
6. **`fcfa-suffix.mp3`** - "FCFA"

### 📊 Messages de Statut

7. **`order-paid.mp3`** - "Commande payée"
8. **`order-delivered.mp3`** - "Commande livrée"
9. **`order-cancelled.mp3`** - "Commande annulée"

## 🎯 Structure des Dossiers

```
mobile-app/liveshop-vendor/public/audio/wolof/
├── new-order-intro.mp3
├── customer-name-prefix.mp3
├── product-prefix.mp3
├── address-prefix.mp3
├── total-price-prefix.mp3
├── fcfa-suffix.mp3
├── order-paid.mp3
├── order-delivered.mp3
└── order-cancelled.mp3
```

## 🎙️ Instructions d'Enregistrement

### Équipement Recommandé
- **Microphone** : Microphone USB ou smartphone de bonne qualité
- **Logiciel** : Audacity (gratuit) ou enregistreur vocal du téléphone
- **Environnement** : Pièce calme, sans écho

### Conseils d'Enregistrement
1. **Parlez clairement** et à un rythme normal
2. **Faites des pauses** entre chaque mot
3. **Enregistrez plusieurs versions** et choisissez la meilleure
4. **Format** : MP3, 44.1kHz, 128kbps minimum
5. **Durée** : 1-3 secondes par message

### Exemple de Script d'Enregistrement

```
Message 1: "Amna kou commander" (pause 2s)
Message 2: "Jëkkë bi" (pause 2s)
Message 3: "Dëkk bi" (pause 2s)
Message 4: "Adres bi" (pause 2s)
Message 5: "Xaalis bi" (pause 2s)
Message 6: "FCFA" (pause 2s)
Message 7: "Commande payée" (pause 2s)
Message 8: "Commande livrée" (pause 2s)
Message 9: "Commande annulée" (pause 2s)
```

## 🔧 Installation

### Étape 1 : Créer les Dossiers
```bash
cd mobile-app/liveshop-vendor/public
mkdir -p audio/wolof
```

### Étape 2 : Placer les Fichiers Audio
Placez tous vos fichiers `.mp3` dans le dossier `audio/wolof/`

### Étape 3 : Vérifier les Noms
Assurez-vous que les noms de fichiers correspondent exactement à ceux listés ci-dessus.

## 🧪 Test

Une fois les fichiers placés, testez avec :

```javascript
// Dans la console du navigateur
import voiceNotification from './src/utils/voiceNotification.js';
await voiceNotification.init();
await voiceNotification.testVoiceNotification();
```

## 🎵 Exemple de Séquence Complète

Quand une nouvelle commande arrive, la séquence sera :

1. **Audio Wolof** : "Amna kou commander" (Vous avez une commande)
2. **Audio Wolof** : "Jëkkë bi" (Le client)
3. **Synthèse vocale** : "Mamadou Ba"
4. **Audio Wolof** : "Dëkk bi" (Le produit)
5. **Synthèse vocale** : "Chaussures Nike"
6. **Audio Wolof** : "Adres bi" (L'adresse)
7. **Synthèse vocale** : "Yoff, Dakar"
8. **Audio Wolof** : "Xaalis bi" (Le montant)
9. **Synthèse vocale** : "15 000 FCFA"

## 🚀 Avantages de cette Approche

✅ **Robuste** : Pas de problèmes de permissions navigateur
✅ **Personnalisé** : Votre voix en Wolof
✅ **Flexible** : Synthèse vocale pour les détails dynamiques
✅ **Professionnel** : Son de qualité
✅ **Culturally Appropriate** : Messages en Wolof

## 🔄 Mise à Jour

Pour modifier un message :
1. Réenregistrez le fichier audio
2. Remplacez l'ancien fichier
3. Rechargez l'application

---

**Note** : Si vous préférez d'autres expressions en Wolof, modifiez simplement les fichiers audio et les clés dans `voiceNotification.js`. 