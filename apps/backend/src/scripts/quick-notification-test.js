const { sequelize } = require('../config/database');
const { Seller } = require('../models');

async function quickTest() {
  try {
    console.log('🧪 Test rapide des notifications...\n');

    // 1. Vérifier Mansour
    const mansour = await Seller.findOne({ where: { name: 'Mansour' } });
    if (!mansour) {
      console.log('❌ Mansour non trouvé');
      return;
    }

    console.log('✅ Mansour trouvé:', {
      id: mansour.id,
      name: mansour.name,
      link_id: mansour.public_link_id
    });

    // 2. Tester une requête HTTP pour créer une notification
    console.log('\n📡 Test via API HTTP...');
    
    const https = require('https');
    const http = require('http');
    
    const testNotification = () => {
      return new Promise((resolve, reject) => {
        const data = JSON.stringify({
          order: {
            id: 999,
            customer_name: 'Test Client',
            total_price: 50000,
            product: {
              name: 'Produit Test'
            }
          }
        });

        const options = {
          hostname: 'localhost',
          port: 3001,
          path: '/api/notifications/test',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        };

        const req = http.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => {
            console.log('📡 Réponse API:', res.statusCode, body);
            resolve({ statusCode: res.statusCode, body });
          });
        });

        req.on('error', (error) => {
          console.error('❌ Erreur requête:', error);
          reject(error);
        });

        req.write(data);
        req.end();
      });
    };

    await testNotification();

    // 3. Instructions pour tester manuellement
    console.log('\n🎯 Instructions pour tester manuellement:');
    console.log('1. Connectez-vous à l\'app vendeur: http://localhost:5174/');
    console.log('2. Vérifiez l\'indicateur de notification dans le header');
    console.log('3. Passez une vraie commande depuis: http://localhost:5173/kbzd7r6a52');
    console.log('4. Vérifiez que la notification apparaît en temps réel');

    await sequelize.close();
    console.log('\n✅ Test terminé');

  } catch (error) {
    console.error('❌ Erreur:', error);
    await sequelize.close();
  }
}

quickTest(); 