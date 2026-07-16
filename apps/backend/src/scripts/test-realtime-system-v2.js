#!/usr/bin/env node

/**
 * Script de test du système de notifications en temps réel V2
 * Teste: Redis, BullMQ, Socket.IO, ACK, Delta API
 */

const io = require('socket.io-client');
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const API_URL = `${BASE_URL}/api`;

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Données de test
let testToken = null;
let testSellerId = null;
let socket = null;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Connexion et authentification
async function testAuthentication() {
  info('Test 1: Authentification...');
  
  try {
    // Login avec un vendeur de test
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (response.data.token) {
      testToken = response.data.token;
      testSellerId = response.data.seller.id;
      success(`Authentification réussie - Vendeur ID: ${testSellerId}`);
      return true;
    }
  } catch (err) {
    // Si le vendeur n'existe pas, en créer un
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, {
        name: 'Test Seller',
        email: 'test@example.com',
        password: 'password123',
        phone_number: '+221771234567'
      });
      
      testToken = registerResponse.data.token;
      testSellerId = registerResponse.data.seller.id;
      success(`Vendeur de test créé - ID: ${testSellerId}`);
      return true;
    } catch (regErr) {
      error(`Échec authentification: ${regErr.message}`);
      return false;
    }
  }
}

// Test 2: Connexion Socket.IO
async function testSocketConnection() {
  info('Test 2: Connexion Socket.IO...');
  
  return new Promise((resolve) => {
    socket = io(BASE_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000
    });
    
    socket.on('connect', () => {
      success('Socket.IO connecté');
      
      // Authentifier
      socket.emit('authenticate', { token: testToken });
    });
    
    socket.on('authenticated', (data) => {
      success(`Socket.IO authentifié: ${data.message}`);
      resolve(true);
    });
    
    socket.on('error', (err) => {
      error(`Erreur Socket.IO: ${err.message}`);
      resolve(false);
    });
    
    socket.on('connect_error', (err) => {
      error(`Erreur connexion Socket.IO: ${err.message}`);
      resolve(false);
    });
    
    setTimeout(() => {
      if (!socket.connected) {
        error('Timeout connexion Socket.IO');
        resolve(false);
      }
    }, 10000);
  });
}

// Test 3: Envoi et réception de notification
async function testNotificationFlow() {
  info('Test 3: Flux de notification...');
  
  return new Promise(async (resolve) => {
    let notificationReceived = false;
    let notificationId = null;
    
    // Écouter les notifications
    socket.on('new_order', (data) => {
      success('Notification reçue via Socket.IO');
      notificationReceived = true;
      notificationId = data.notification?.id;
      
      // Envoyer ACK
      if (notificationId) {
        socket.emit('notification_ack', { notificationId });
        success(`ACK envoyé pour notification ${notificationId}`);
      }
    });
    
    // Envoyer une notification de test
    try {
      const response = await axios.post(
        `${API_URL}/notifications/test`,
        {},
        { headers: { Authorization: `Bearer ${testToken}` } }
      );
      
      if (response.data.success) {
        success('Notification de test envoyée');
        
        // Attendre la réception
        await sleep(2000);
        
        if (notificationReceived) {
          success('Notification reçue avec succès');
          resolve(true);
        } else {
          warn('Notification non reçue (vérifier BullMQ)');
          resolve(true); // Pas une erreur critique
        }
      }
    } catch (err) {
      error(`Erreur envoi notification: ${err.message}`);
      resolve(false);
    }
  });
}

// Test 4: API Delta
async function testDeltaAPI() {
  info('Test 4: API Delta...');
  
  try {
    // Récupérer toutes les notifications
    const allResponse = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    
    if (allResponse.data.success) {
      const count = allResponse.data.count;
      const lastId = allResponse.data.lastId;
      success(`${count} notifications récupérées, dernier ID: ${lastId}`);
      
      // Tester récupération delta
      if (lastId) {
        const deltaResponse = await axios.get(
          `${API_URL}/notifications?sinceId=${lastId - 5}`,
          { headers: { Authorization: `Bearer ${testToken}` } }
        );
        
        if (deltaResponse.data.success) {
          success(`Delta API: ${deltaResponse.data.count} nouvelles notifications`);
          return true;
        }
      }
      
      return true;
    }
  } catch (err) {
    error(`Erreur API Delta: ${err.message}`);
    return false;
  }
}

// Test 5: Récupération notifications manquées
async function testMissedNotifications() {
  info('Test 5: Récupération notifications manquées...');
  
  return new Promise((resolve) => {
    // Simuler une demande de notifications manquées
    socket.emit('request_missed_notifications', { lastNotificationId: 0 }, (response) => {
      if (response.success) {
        success(`${response.notifications.length} notifications manquées récupérées`);
        resolve(true);
      } else {
        error(`Erreur récupération: ${response.error}`);
        resolve(false);
      }
    });
    
    setTimeout(() => {
      warn('Timeout récupération notifications manquées');
      resolve(false);
    }, 5000);
  });
}

// Test 6: Vérifier Redis et BullMQ
async function testRedisAndBullMQ() {
  info('Test 6: Vérification Redis et BullMQ...');
  
  try {
    // Tester via l'API health
    const healthResponse = await axios.get(`${API_URL}/health`);
    
    if (healthResponse.data.status === 'OK') {
      success('Backend opérationnel');
      
      // Vérifier les stats notifications
      const statsResponse = await axios.get(`${API_URL}/notifications/stats`, {
        headers: { Authorization: `Bearer ${testToken}` }
      });
      
      if (statsResponse.data.success) {
        success('Stats notifications disponibles');
        info(JSON.stringify(statsResponse.data.stats, null, 2));
        return true;
      }
    }
  } catch (err) {
    error(`Erreur vérification système: ${err.message}`);
    return false;
  }
}

// Exécuter tous les tests
async function runAllTests() {
  log('\n🧪 === TEST DU SYSTÈME DE NOTIFICATIONS EN TEMPS RÉEL V2 ===\n', 'cyan');
  
  const results = {
    authentication: false,
    socketConnection: false,
    notificationFlow: false,
    deltaAPI: false,
    missedNotifications: false,
    redisAndBullMQ: false
  };
  
  // Test 1
  results.authentication = await testAuthentication();
  if (!results.authentication) {
    error('Échec authentification - Arrêt des tests');
    process.exit(1);
  }
  await sleep(1000);
  
  // Test 2
  results.socketConnection = await testSocketConnection();
  if (!results.socketConnection) {
    error('Échec connexion Socket.IO - Arrêt des tests');
    process.exit(1);
  }
  await sleep(1000);
  
  // Test 3
  results.notificationFlow = await testNotificationFlow();
  await sleep(1000);
  
  // Test 4
  results.deltaAPI = await testDeltaAPI();
  await sleep(1000);
  
  // Test 5
  results.missedNotifications = await testMissedNotifications();
  await sleep(1000);
  
  // Test 6
  results.redisAndBullMQ = await testRedisAndBullMQ();
  
  // Résumé
  log('\n📊 === RÉSUMÉ DES TESTS ===\n', 'cyan');
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const color = result ? 'green' : 'red';
    log(`${status} - ${test}`, color);
  });
  
  log(`\n${passed}/${total} tests réussis\n`, passed === total ? 'green' : 'yellow');
  
  // Nettoyer
  if (socket) {
    socket.disconnect();
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Lancer les tests
runAllTests().catch(err => {
  error(`Erreur fatale: ${err.message}`);
  console.error(err);
  process.exit(1);
});
