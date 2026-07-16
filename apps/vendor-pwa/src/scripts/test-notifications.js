// Script pour tester les notifications côté frontend
console.log('🧪 Test des notifications côté frontend...');

// Simuler une nouvelle commande
const testOrder = {
  order: {
    id: 999,
    customer_name: 'Test Client',
    total_price: 50000,
    product: {
      name: 'Produit Test'
    }
  }
};

// Déclencher l'événement de nouvelle commande
window.dispatchEvent(new CustomEvent('new_order', { detail: testOrder }));

console.log('✅ Événement new_order déclenché');
console.log('📋 Vérifiez l\'indicateur de notification dans le header');
console.log('🔔 Vérifiez les toasts de notification');
console.log('📦 Vérifiez l\'actualisation de la liste des commandes'); 