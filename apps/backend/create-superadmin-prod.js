/**
 * Script pour créer un compte superadmin en production
 * Usage: node create-superadmin-prod.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Seller } = require('./src/models');

async function createSuperAdmin() {
  try {
    console.log('🔐 Création du compte superadmin...');
    
    // Paramètres du superadmin
    const PHONE = '+221778325569';
    const NAME = 'Nachirou';
    const PIN = '2468';
    
    // Hasher le PIN
    const pin_hash = await bcrypt.hash(PIN, 10);
    
    // Créer ou mettre à jour le compte
    const [admin, created] = await Seller.upsert({
      phone_number: PHONE,
      name: NAME,
      pin_hash: pin_hash,
      public_link_id: 'superadmin',
      is_active: true,
      role: 'superadmin',
      credit_balance: 9999  // Crédits illimités
    }, {
      returning: true
    });
    
    if (created) {
      console.log('✅ Compte superadmin créé avec succès!');
    } else {
      console.log('✅ Compte superadmin mis à jour!');
    }
    
    console.log('📋 Informations du compte:');
    console.log('   - ID:', admin.id);
    console.log('   - Nom:', admin.name);
    console.log('   - Téléphone:', admin.phone_number);
    console.log('   - Role:', admin.role);
    console.log('   - Crédits:', admin.credit_balance);
    console.log('   - Lien public:', admin.public_link_id);
    
    console.log('\n🔑 Pour te connecter:');
    console.log('   - Numéro:', PHONE);
    console.log('   - Code PIN:', PIN);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    process.exit(1);
  }
}

createSuperAdmin();
