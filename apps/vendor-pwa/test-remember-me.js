// Script de test pour la fonctionnalité "Se souvenir"
console.log('🧪 Test de la fonctionnalité "Se souvenir"');

// Simuler le stockage local
const localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
    console.log(`💾 Sauvegardé: ${key} = ${value}`);
  },
  removeItem(key) {
    delete this.data[key];
    console.log(`🗑️ Supprimé: ${key}`);
  }
};

// Test 1: Activation de "Se souvenir"
console.log('\n📝 Test 1: Activation de "Se souvenir"');
localStorage.setItem('remembered_phone', '+221772345678');
localStorage.setItem('remember_me', 'true');

console.log('📱 Numéro sauvegardé:', localStorage.getItem('remembered_phone'));
console.log('🔒 Option activée:', localStorage.getItem('remember_me'));

// Test 2: Désactivation de "Se souvenir"
console.log('\n📝 Test 2: Désactivation de "Se souvenir"');
localStorage.removeItem('remembered_phone');
localStorage.removeItem('remember_me');

console.log('📱 Numéro sauvegardé:', localStorage.getItem('remembered_phone'));
console.log('🔒 Option activée:', localStorage.getItem('remember_me'));

// Test 3: Simulation de reconnexion
console.log('\n📝 Test 3: Simulation de reconnexion');
localStorage.setItem('remembered_phone', '+221772345678');
localStorage.setItem('remember_me', 'true');

// Simuler le chargement des données
const savedPhone = localStorage.getItem('remembered_phone');
const savedRememberMe = localStorage.getItem('remember_me') === 'true';

if (savedRememberMe && savedPhone) {
  console.log('✅ Données "Se souvenir" trouvées et chargées');
  console.log(`📱 Numéro pré-rempli: ${savedPhone}`);
} else {
  console.log('❌ Aucune donnée "Se souvenir" trouvée');
}

console.log('\n✅ Tests terminés !');
console.log('💡 Pour tester dans l\'app:');
console.log('   1. Connectez-vous avec "Se souvenir" activé');
console.log('   2. Rechargez la page');
console.log('   3. Le numéro devrait être pré-rempli');
console.log('   4. Testez la déconnexion avec l\'option de garder/supprimer'); 