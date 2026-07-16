const { io } = require('socket.io-client');

// Test du temps réel pour le web-client
async function testRealtimeWebClient() {
  console.log('🧪 Test du temps réel web-client...');
  
  // Connexion au serveur
  const socket = io('http://localhost:3001', {
    transports: ['websocket', 'polling']
  });
  
  socket.on('connect', () => {
    console.log('✅ Web-client connecté au serveur');
    console.log('🆔 Socket ID:', socket.id);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('❌ Web-client déconnecté:', reason);
  });
  
  socket.on('error', (error) => {
    console.error('❌ Erreur WebSocket:', error);
  });
  
  // Écouter les événements de produits
  socket.on('product_created', (data) => {
    console.log('🆕 Événement product_created reçu:', data);
  });
  
  socket.on('product_updated', (data) => {
    console.log('✏️ Événement product_updated reçu:', data);
  });
  
  socket.on('product_deleted', (data) => {
    console.log('🗑️ Événement product_deleted reçu:', data);
  });
  
  // Écouter tous les événements
  socket.onAny((eventName, ...args) => {
    console.log('📡 Événement reçu:', eventName, args);
  });
  
  // Attendre 5 secondes puis se déconnecter
  setTimeout(() => {
    console.log('🔌 Déconnexion du test...');
    socket.disconnect();
    process.exit(0);
  }, 5000);
}

// Lancer le test
testRealtimeWebClient().catch(console.error); 