#!/usr/bin/env node
const https = require('https');
const http = require('http');

const API_BASE = 'http://localhost:3001/api';

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });
    
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}
let TOKEN = '';

async function login() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: '+221771842787', pin: '2468' })
  });
  const data = await res.json();
  TOKEN = data.token;
  console.log('✅ Login OK - Role:', data.seller.role);
  return data;
}

async function testEndpoint(name, url, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(`${API_BASE}${url}`, options);
    const data = await res.json().catch(() => ({}));
    
    if (res.ok) {
      console.log(`✅ ${name} - OK`);
      return data;
    } else {
      console.log(`❌ ${name} - HTTP ${res.status}:`, data.error || data);
      return null;
    }
  } catch (error) {
    console.log(`❌ ${name} - Erreur:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('\n🧪 Tests des endpoints admin...\n');
  
  await login();
  
  console.log('\n📊 Dashboard & Statistiques:');
  await testEndpoint('Dashboard admin', '/admin/dashboard');
  
  console.log('\n👥 Gestion vendeurs:');
  await testEndpoint('Liste vendeurs', '/admin/sellers?page=1&limit=5');
  await testEndpoint('Détails vendeur #1', '/admin/sellers/1');
  
  console.log('\n📦 Commandes:');
  await testEndpoint('Liste commandes admin', '/admin/orders?page=1&limit=5');
  await testEndpoint('Commandes vendeur #1', '/admin/sellers/1/orders');
  
  console.log('\n🛍️ Produits:');
  await testEndpoint('Liste produits admin', '/admin/products?page=1&limit=5');
  await testEndpoint('Produits vendeur #1', '/admin/sellers/1/products');
  
  console.log('\n💳 Crédits:');
  await testEndpoint('Transactions crédits', '/admin/transactions?page=1&limit=5');
  
  console.log('\n🔧 Actions admin:');
  // Test suspend/activate (ne modifie pas vraiment)
  console.log('⏭️  Skipping suspend/activate tests (read-only check)');
  
  console.log('\n✅ Tests terminés !\n');
}

runTests().catch(console.error);
