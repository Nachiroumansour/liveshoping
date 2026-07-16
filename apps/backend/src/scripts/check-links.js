const { sequelize } = require('../config/database');
const { Seller } = require('../models');

async function checkLinks() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    const sellers = await Seller.findAll({
      attributes: ['id', 'name', 'public_link_id']
    });

    console.log('\n📋 Liens publics des vendeurs:');
    sellers.forEach(seller => {
      console.log(`- ${seller.name} (ID: ${seller.id}): ${seller.public_link_id}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

checkLinks(); 