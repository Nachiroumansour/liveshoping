const { io } = require('socket.io-client');

console.log('🧪 Test WebSocket avec debug...');

// Connexion au serveur avec plus d'options
const socket = io('http://127.0.0.1:3001', {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true
});

console.log('🔌 Tentative de connexion...');

socket.on('connect', () => {
  console.log('✅ Connecté au serveur WebSocket');
  console.log('🆔 Socket ID:', socket.id);
  console.log('🔗 URL de connexion:', socket.io.uri);
  console.log('📡 Transport utilisé:', socket.io.engine.transport.name);
});

socket.on('connect_error', (error) => {
  console.error('❌ Erreur de connexion:', error.message);
  console.error('🔍 Détails:', error);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Déconnecté:', reason);
});

socket.on('error', (error) => {
  console.error('❌ Erreur WebSocket:', error);
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

// Écouter tous les événements
socket.onAny((eventName, ...args) => {
  console.log('📡 Événement reçu:', eventName, args);
});

// Attendre 15 secondes
setTimeout(() => {
  console.log('🔌 Déconnexion...');
  socket.disconnect();
  process.exit(0);
}, 15000); 