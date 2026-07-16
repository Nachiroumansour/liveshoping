const { io } = require('socket.io-client');

console.log('🧪 Test simple WebSocket...');

// Connexion au serveur
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('✅ Connecté au serveur WebSocket');
  console.log('🆔 Socket ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Déconnecté:', reason);
});

socket.on('error', (error) => {
  console.error('❌ Erreur:', error);
});

// Écouter les événements de produits
socket.on('product_created', (data) => {
  console.log('🆕 Produit créé:', data);
});

socket.on('product_updated', (data) => {
  console.log('✏️ Produit mis à jour:', data);
});

socket.on('product_deleted', (data) => {
  console.log('🗑️ Produit supprimé:', data);
});

// Attendre 10 secondes
setTimeout(() => {
  console.log('🔌 Déconnexion...');
  socket.disconnect();
  process.exit(0);
}, 10000); 