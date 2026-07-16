const { Seller } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function makeAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connecté à la base de données');

    // Afficher tous les vendeurs
    const sellers = await Seller.findAll({
      attributes: ['id', 'name', 'phone_number', 'role']
    });

    console.log('\n📋 Liste des vendeurs:');
    sellers.forEach(seller => {
      console.log(`  ${seller.id}. ${seller.name} (${seller.phone_number}) - Role: ${seller.role}`);
    });

    // Demander l'ID du vendeur à promouvoir
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('\n🔑 Entrez l\'ID du vendeur à promouvoir admin: ', async (sellerId) => {
      try {
        const seller = await Seller.findByPk(sellerId);
        
        if (!seller) {
          console.log('❌ Vendeur non trouvé');
          process.exit(1);
        }

        // Mettre à jour le rôle
        seller.role = 'super_admin';
        await seller.save();

        console.log(`\n✅ ${seller.name} est maintenant super_admin !`);
        console.log(`   ID: ${seller.id}`);
        console.log(`   Téléphone: ${seller.phone_number}`);
        console.log(`   Role: ${seller.role}`);
        console.log('\n🎉 Vous pouvez maintenant vous reconnecter avec ce compte.');
        
        process.exit(0);
      } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    process.exit(1);
  }
}

makeAdmin();
