#!/usr/bin/env node

/**
 * 🤖 Seeding Automatique - Appelé après déploiement
 * Vérifie et crée les données essentielles
 */

const { seedProduction } = require('./seed-production');

const autoSeed = async () => {
  try {
    console.log('🤖 Démarrage du seeding automatique...');
    
    // Attendre un peu que la base soit prête
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Exécuter le seeding
    await seedProduction();
    
    console.log('✅ Seeding automatique terminé avec succès !');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur seeding automatique:', error.message);
    process.exit(1);
  }
};

// Exécuter si appelé directement
if (require.main === module) {
  autoSeed();
}

module.exports = { autoSeed };
