/**
 * Service d'initialisation de la configuration
 * Charger les paramètres depuis la base de données au démarrage
 */

const CreditService = require('./creditService');

async function initializeCreditsConfig() {
  try {
    console.log('⚙️  Initialisation de la configuration des crédits...');
    
    // Charger la configuration depuis la base de données
    await CreditService.loadConfigFromDatabase();
    
    const config = CreditService.getConfig();
    console.log('✅ Configuration des crédits chargée:');
    console.log('   - Module activé:', config.ENABLED);
    console.log('   - Mode:', config.MODE);
    console.log('   - Crédits initiaux:', config.INITIAL_CREDITS);
    console.log('   - Packages disponibles:', Object.keys(config.PACKAGES).join(', '));
    console.log('   - Actions:', Object.keys(config.ACTION_COSTS).join(', '));
    
    return config;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la configuration:', error);
    throw error;
  }
}

module.exports = {
  initializeCreditsConfig
};
