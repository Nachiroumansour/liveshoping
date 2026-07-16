/**
 * Script d'initialisation du compte superadmin
 * S'exécute automatiquement au démarrage du backend
 */

const bcrypt = require('bcryptjs');

async function initSuperAdmin() {
  try {
    const { Seller } = require('../models');
    
    // Paramètres du superadmin (depuis variables d'environnement ou valeurs par défaut)
    const SUPERADMIN_PHONE = process.env.SUPERADMIN_PHONE || '+221778325569';
    const SUPERADMIN_NAME = process.env.SUPERADMIN_NAME || 'Nachirou';
    const SUPERADMIN_PIN = process.env.SUPERADMIN_PIN || '2468';
    
    console.log('🔐 Vérification du compte superadmin (par téléphone)...');

    // Chercher uniquement par numéro de téléphone spécifié
    const existingUser = await Seller.findOne({ where: { phone_number: SUPERADMIN_PHONE } });

    if (existingUser) {
      console.log('✅ Compte déjà existant pour ce numéro, aucune création effectuée.');
      console.log('   Téléphone:', existingUser.phone_number);
      console.log('   Rôle actuel:', existingUser.role);
      console.log('   Pour créer un nouveau superadmin: changer SUPERADMIN_PHONE et redéployer (éventuellement supprimer l\'ancien).');
      return existingUser;
    }

    // Créer le compte superadmin si absent
    console.log('📝 Création du compte superadmin (nouveau numéro)...');
    const pin_hash = await bcrypt.hash(SUPERADMIN_PIN, 10);
    
    // Générer un public_link_id unique
    const generateId = async () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let id, exists;
      do {
        id = Array.from({length:8},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
        exists = await Seller.findOne({ where: { public_link_id: id } });
      } while (exists);
      return id;
    };
    
    const public_link_id = await generateId();
    
    const admin = await Seller.create({
      phone_number: SUPERADMIN_PHONE,
      name: SUPERADMIN_NAME,
      pin_hash: pin_hash,
      public_link_id: public_link_id,
      is_active: true,
      role: 'superadmin',
      credit_balance: 9999
    });
    
    console.log('✅ Compte superadmin créé avec succès!');
    console.log('📋 Informations:');
    console.log('   - Nom:', admin.name);
    console.log('   - Téléphone:', admin.phone_number);
    console.log('   - Role:', admin.role);
    console.log('   - Crédits:', admin.credit_balance);
    
    return admin;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation du superadmin:', error);
    // Ne pas faire crasher l'application si la création échoue
    return null;
  }
}

module.exports = { initSuperAdmin };
