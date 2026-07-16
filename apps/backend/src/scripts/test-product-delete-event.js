// Test d'émission d'événement de suppression de produit
console.log('🧪 Test d\'émission d\'événement product_deleted...');

// Vérifier que global.notifyAllSellers est disponible
if (!global.notifyAllSellers) {
  console.log('❌ global.notifyAllSellers non disponible');
  console.log('🔍 Vérifiez que le serveur backend est démarré');
  process.exit(1);
}

console.log('✅ global.notifyAllSellers disponible');

// Simuler la suppression d'un produit
const testProduct = {
  id: 999,
  name: 'iPhone 15 Pro Max Test',
  seller_id: 1
};

const testSeller = {
  id: 1,
  name: 'Mansour',
  public_link_id: 'kbzd7r6a52'
};

console.log('📡 Émission de l\'événement product_deleted...');
global.notifyAllSellers('product_deleted', {
  product: testProduct,
  seller: testSeller
});

console.log('✅ Événement product_deleted émis');
console.log('📊 Données émises:', {
  product: testProduct,
  seller: testSeller
});

process.exit(0); 