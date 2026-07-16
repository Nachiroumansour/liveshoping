const fs = require('fs');
const path = require('path');

// Configuration des messages audio Wolof
const audioMessages = {
  'new-order-intro': 'Amna kou commander',
  'customer-name-prefix': 'Jëkkë bi',
  'product-prefix': 'Dëkk bi',
  'address-prefix': 'Adres bi',
  'total-price-prefix': 'Xaalis bi',
  'fcfa-suffix': 'FCFA',
  'order-paid': 'Commande payée',
  'order-delivered': 'Commande livrée',
  'order-cancelled': 'Commande annulée'
};

function createAudioDirectory() {
  const audioDir = path.join(__dirname, 'public', 'audio', 'wolof');
  
  try {
    // Créer le dossier audio s'il n'existe pas
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
      console.log('✅ Dossier audio créé:', audioDir);
    } else {
      console.log('📁 Dossier audio existe déjà:', audioDir);
    }
    
    return audioDir;
  } catch (error) {
    console.error('❌ Erreur création dossier audio:', error);
    return null;
  }
}

function createPlaceholderFiles(audioDir) {
  console.log('\n📝 Création des fichiers placeholders...');
  
  for (const [filename, message] of Object.entries(audioMessages)) {
    const filePath = path.join(audioDir, `${filename}.mp3`);
    
    if (!fs.existsSync(filePath)) {
      // Créer un fichier placeholder avec un commentaire
      const placeholderContent = `# Placeholder pour: ${message}
# Remplacez ce fichier par votre enregistrement audio réel
# Format: MP3, 44.1kHz, 128kbps minimum
# Message à enregistrer: "${message}"`;
      
      fs.writeFileSync(filePath, placeholderContent);
      console.log(`📄 Placeholder créé: ${filename}.mp3`);
    } else {
      console.log(`✅ Fichier existe: ${filename}.mp3`);
    }
  }
}

function createReadme(audioDir) {
  const readmePath = path.join(audioDir, 'README.md');
  const readmeContent = `# 🎤 Fichiers Audio Wolof

## 📋 Messages à Enregistrer

Ces fichiers doivent être remplacés par vos enregistrements audio réels.

### 🛒 Messages de Base
- \`new-order-intro.mp3\` - "Amna kou commander" (Vous avez une commande)
- \`customer-name-prefix.mp3\` - "Jëkkë bi" (Le client)
- \`product-prefix.mp3\` - "Dëkk bi" (Le produit)
- \`address-prefix.mp3\` - "Adres bi" (L'adresse)
- \`total-price-prefix.mp3\` - "Xaalis bi" (Le montant)
- \`fcfa-suffix.mp3\` - "FCFA"

### 📊 Messages de Statut
- \`order-paid.mp3\` - "Commande payée"
- \`order-delivered.mp3\` - "Commande livrée"
- \`order-cancelled.mp3\` - "Commande annulée"

## 🎙️ Instructions

1. **Enregistrez** chaque message avec votre voix en Wolof
2. **Remplacez** les fichiers placeholders par vos enregistrements
3. **Format** : MP3, 44.1kHz, 128kbps minimum
4. **Testez** en rechargeant l'application

## 🧪 Test

Une fois les fichiers remplacés, testez avec :
\`\`\`javascript
// Dans la console du navigateur
import voiceNotification from '../src/utils/voiceNotification.js';
await voiceNotification.init();
await voiceNotification.testVoiceNotification();
\`\`\`
`;

  fs.writeFileSync(readmePath, readmeContent);
  console.log('📖 README créé:', readmePath);
}

function main() {
  console.log('🎤 Configuration des fichiers audio Wolof...\n');
  
  // Créer le dossier audio
  const audioDir = createAudioDirectory();
  if (!audioDir) {
    console.error('❌ Impossible de créer le dossier audio');
    return;
  }
  
  // Créer les fichiers placeholders
  createPlaceholderFiles(audioDir);
  
  // Créer le README
  createReadme(audioDir);
  
  console.log('\n✅ Configuration audio terminée !');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Enregistrez vos messages audio en Wolof');
  console.log('2. Remplacez les fichiers placeholders par vos enregistrements');
  console.log('3. Testez les notifications vocales dans l\'application');
  console.log('\n📖 Consultez le guide complet: AUDIO_SETUP_GUIDE.md');
}

// Exécuter le script
main(); 