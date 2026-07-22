# Sprint 1 — « Le pouls de ma boutique » — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Le commerçant ouvre son app et comprend en cinq secondes ce qui s'est passé pendant son absence — un journal d'événements en double écriture alimente une page « Le pouls de ma boutique » (résumé + fil en phrases, temps réel).

**Architecture:** Une table `events` (journal append-only par vendeur) + un service d'émission best-effort appelé en double écriture depuis les flux Commerce existants (zéro changement de comportement). Une route `GET /api/activity` sert le fil + le résumé. La PWA vendeur affiche la page Pouls : salutation, bloc « Pendant ton absence » (repère local `lastPulseSeenAt`), fil de phrases en français, mise à jour temps réel via le canal Socket.IO existant (`global.notifySeller` → room `seller_{id}`).

**Tech Stack:** Backend Express/Sequelize CommonJS (existant), Socket.IO (existant), PWA React (vendor-pwa, JS).

## Global Constraints

- **Zéro changement de comportement existant.** Chaque émission d'événement est enveloppée dans son propre try/catch : un échec d'émission ne doit JAMAIS faire échouer la commande/le produit/le commentaire. L'émission se fait TOUJOURS hors transaction (après commit).
- **Jamais d'événement brut dans l'UI.** L'interface n'affiche jamais `order_created` — toujours une phrase française : « Fatou a commandé Sac raphia — 12 500 FCFA ». (Principe du manifeste : si Awa ne comprend pas en 10 s, c'est mal conçu.)
- **Types d'événements exacts (v1, liste fermée) :** `order_created`, `order_paid`, `order_delivered`, `product_created`, `stock_low`, `stock_out`, `comment_added`.
- **Seuil stock faible : `stock_quantity <= 5 && > 0` → `stock_low` ; `== 0` (après décrément) → `stock_out`.** Émis uniquement quand le décrément fait franchir le seuil (pas à chaque commande sous le seuil).
- Backend reste **CommonJS**. Table `events`, modèle `Event`, service `eventService`.
- Branche : `feat/sprint1-pouls-boutique`. **Jamais de merge sur `main` sans accord explicite (checkpoint Task 5) — le merge déploie en production.**
- Le canal temps réel réutilise `global.notifySeller(sellerId, 'shop_activity', {...})` — pas de nouveau mécanisme socket.
- Pas de compteur « minutes économisées » dans ce sprint (décision produit : « X tâches » viendra au Sprint 3, les minutes plus tard).
- La démo de fin de sprint se raconte du point de vue d'Awa, jamais de l'architecture.

---

### Task 1: Modèle `Event` + `eventService` + migration

**Files:**
- Create: `apps/backend/src/models/Event.js`
- Create: `apps/backend/src/services/eventService.js`
- Create: `apps/backend/src/scripts/migrate-events.js`
- Test: `apps/backend/src/scripts/test-events.js`

**Interfaces:**
- Produces: `eventService.emit(sellerId, type, payload)` → `Promise<Event|null>` (null si échec, ne jette JAMAIS). Émet aussi en best-effort `global.notifySeller(sellerId, 'shop_activity', { id, type, payload, created_at })`.
- Produces: modèle `Event` (`seller_id`, `type` STRING(30), `payload` JSON, `created_at`), index `(seller_id, created_at)` et `(seller_id, type)`.

- [ ] **Step 1: Créer `apps/backend/src/models/Event.js`**

```js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Journal d'événements de boutique (append-only).
// Source de vérité de la page "Le pouls de ma boutique" et,
// plus tard, des workflows et de la mesure de valeur.
const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sellers',
      key: 'id'
    }
  },
  // Liste fermée v1 : order_created, order_paid, order_delivered,
  // product_created, stock_low, stock_out, comment_added
  type: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  payload: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  }
}, {
  tableName: 'events',
  updatedAt: false,
  indexes: [
    { fields: ['seller_id', 'created_at'] },
    { fields: ['seller_id', 'type'] }
  ]
});

module.exports = Event;
```

- [ ] **Step 2: Créer `apps/backend/src/services/eventService.js`**

```js
const Event = require('../models/Event');

/**
 * Émission d'un événement de boutique — double écriture best-effort.
 * NE JETTE JAMAIS : un échec d'émission ne doit pas casser le flux métier
 * appelant (commande, produit, commentaire).
 */
async function emit(sellerId, type, payload = {}) {
  try {
    const event = await Event.create({ seller_id: sellerId, type, payload });

    // Temps réel best-effort vers la PWA (room seller_{id} via app.js)
    try {
      if (global.notifySeller) {
        global.notifySeller(sellerId, 'shop_activity', {
          id: event.id,
          type: event.type,
          payload: event.payload,
          created_at: event.created_at
        });
      }
    } catch (socketError) {
      console.error(`⚠️ Event ${type} enregistré mais push temps réel échoué:`, socketError.message);
    }

    return event;
  } catch (error) {
    console.error(`❌ Émission événement ${type} échouée (seller ${sellerId}):`, error.message);
    return null;
  }
}

module.exports = { emit };
```

- [ ] **Step 3: Créer `apps/backend/src/scripts/migrate-events.js`** (même style idempotent que `migrate-push-type.js`)

```js
// Migration : table events (journal d'événements de boutique)
// Usage : node src/scripts/migrate-events.js (depuis apps/backend)
require('dotenv').config();
const { sequelize } = require('../config/database');

async function migrate() {
  const qi = sequelize.getQueryInterface();
  const tables = await qi.showAllTables();
  const names = tables.map((t) => (typeof t === 'string' ? t : t.tableName));

  if (!names.includes('events')) {
    const Event = require('../models/Event');
    await Event.sync();
    console.log('✅ Table events créée (avec index)');
  } else {
    console.log('ℹ️ Table events déjà présente');
  }

  await sequelize.close();
  console.log('✅ Migration events terminée');
}

migrate().catch((err) => {
  console.error('❌ Migration échouée:', err);
  process.exit(1);
});
```

- [ ] **Step 4: Écrire le script de test `apps/backend/src/scripts/test-events.js`**

```js
// Test du journal d'événements : modèle, émission best-effort, lecture.
// Usage : NODE_ENV=development node src/scripts/test-events.js (depuis apps/backend)
require('dotenv').config();
const assert = require('assert');
const { sequelize } = require('../config/database');
const { Seller } = require('../models');
const Event = require('../models/Event');
const eventService = require('../services/eventService');

async function run() {
  await sequelize.sync();
  const seller = await Seller.findOne();
  assert.ok(seller, 'base dev non seedée : aucun vendeur');
  const SELLER_ID = seller.id;

  // 0. Nettoyage des événements de test
  await Event.destroy({ where: { seller_id: SELLER_ID, type: 'order_created' } });

  // 1. emit crée une ligne et la retourne
  const ev = await eventService.emit(SELLER_ID, 'order_created', {
    order_id: 999901, customer_name: 'Test Awa', product_name: 'Sac test', total_price: 12500
  });
  assert.ok(ev, 'emit a retourné null');
  assert.strictEqual(ev.type, 'order_created');
  assert.strictEqual(ev.payload.customer_name, 'Test Awa');

  // 2. La ligne est en base, ordonnée par date
  const rows = await Event.findAll({
    where: { seller_id: SELLER_ID },
    order: [['created_at', 'DESC']],
    limit: 5
  });
  assert.ok(rows.length >= 1);
  assert.strictEqual(rows[0].payload.order_id, 999901);

  // 3. emit ne jette JAMAIS (type null → erreur DB avalée, retour null)
  const bad = await eventService.emit(SELLER_ID, null, {});
  assert.strictEqual(bad, null, 'emit aurait dû retourner null sans jeter');

  // 4. Nettoyage
  await Event.destroy({ where: { seller_id: SELLER_ID, payload: { order_id: 999901 } } });

  await sequelize.close();
  console.log('✅ test-events : 4/4 assertions OK');
}

run().catch((err) => {
  console.error('❌ test-events échoué:', err);
  process.exit(1);
});
```

- [ ] **Step 5: Exécuter migration (2x, idempotence) puis test**

Run: `(cd apps/backend && NODE_ENV=development node src/scripts/migrate-events.js)` — Expected: `✅ Table events créée`
Run à nouveau — Expected: `ℹ️ Table events déjà présente`
Run: `(cd apps/backend && NODE_ENV=development node src/scripts/test-events.js)` — Expected: `✅ test-events : 4/4 assertions OK`
Note : ce script peut ne pas rendre la main (connexions Redis via models/index) — si les assertions sont OK et le processus pend, le tuer est acceptable (précédent connu : test-expo-push).

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/models/Event.js apps/backend/src/services/eventService.js apps/backend/src/scripts/migrate-events.js apps/backend/src/scripts/test-events.js
git commit -m "feat(backend): journal d'événements de boutique (table events + eventService)"
```

---

### Task 2: Double écriture aux points Commerce

**Files:**
- Modify: `apps/backend/src/routes/public.js` (création commande ~l.283 après transaction ; commentaire ~l.411 après création)
- Modify: `apps/backend/src/routes/orders.js` (PUT /:id/status, après `order.update({ status })` ~l.133)
- Modify: `apps/backend/src/routes/products.js` (POST /, après `Product.create` ~l.142)

**Interfaces:**
- Consumes: `eventService.emit(sellerId, type, payload)` (Task 1).
- Produces: les 7 types d'événements émis en production de données réelles. Payloads exacts (consommés par Task 3/4) :
  - `order_created`: `{ order_id, customer_name, product_name, quantity, total_price }`
  - `order_paid` / `order_delivered`: `{ order_id, customer_name, total_price }`
  - `product_created`: `{ product_id, product_name, price }`
  - `stock_low`: `{ product_id, product_name, stock_quantity }`
  - `stock_out`: `{ product_id, product_name }`
  - `comment_added`: `{ comment_id, author_name }`

- [ ] **Step 1: `public.js` — après la transaction de création de commande** (juste après `return newOrder; });` et avant le bloc notifications), ajouter — avec le require `const eventService = require('../services/eventService');` en tête de fichier :

```js
    // Journal d'événements (double écriture, best-effort — jamais bloquant)
    await eventService.emit(seller.id, 'order_created', {
      order_id: order.id,
      customer_name: order.customer_name,
      product_name: product.name,
      quantity: order.quantity,
      total_price: order.total_price
    });

    const remainingStock = product.stock_quantity > 0
      ? product.stock_quantity - order.quantity
      : product.stock_quantity;
    if (product.stock_quantity > 0 && remainingStock === 0) {
      await eventService.emit(seller.id, 'stock_out', {
        product_id: product.id,
        product_name: product.name
      });
    } else if (product.stock_quantity > 5 && remainingStock <= 5 && remainingStock > 0) {
      await eventService.emit(seller.id, 'stock_low', {
        product_id: product.id,
        product_name: product.name,
        stock_quantity: remainingStock
      });
    }
```

(Note : `product.stock_quantity` est la valeur AVANT décrément — le franchissement de seuil se calcule avant/après, conformément à la contrainte globale « émis uniquement au franchissement ».)

- [ ] **Step 2: `orders.js` — dans PUT /:id/status, après `await order.update({ status });`** (require en tête de fichier) :

```js
    if (status === 'paid' || status === 'delivered') {
      await eventService.emit(order.seller_id, status === 'paid' ? 'order_paid' : 'order_delivered', {
        order_id: order.id,
        customer_name: order.customer_name,
        total_price: order.total_price
      });
    }
```

- [ ] **Step 3: `products.js` — après `const product = await Product.create(productData);`** (require en tête de fichier) :

```js
    await eventService.emit(req.seller.id, 'product_created', {
      product_id: product.id,
      product_name: product.name,
      price: product.price
    });
```

- [ ] **Step 4: `public.js` — après `Comment.create` (~l.411)** :

```js
    await eventService.emit(seller.id, 'comment_added', {
      comment_id: newComment.id,
      author_name: newComment.author_name || 'Un client'
    });
```

Vérifier le vrai nom du champ auteur sur le modèle `Comment` (lire `apps/backend/src/models/Comment.js`) et adapter (`author_name`, `name` ou équivalent).

- [ ] **Step 5: Vérifier en local**

Run: `(cd apps/backend && NODE_ENV=development nohup node src/app.js > /tmp/pouls-boot.log 2>&1 & echo $! > /tmp/pouls-boot.pid)` puis attendre `/api/health` 200.
Créer une commande de test via l'API publique (utiliser un vendeur seedé, ex. linkId de « Boutique Test Local ») :
`curl -s -X POST http://localhost:3001/api/public/<linkId>/orders -H 'Content-Type: application/json' -d '{"product_id":<id>,"customer_name":"Fatou Test","customer_phone":"771234567","customer_address":"Dakar","quantity":1,"payment_method":"cash"}'`
Puis vérifier : `NODE_ENV=development node -e "const E=require('./src/models/Event');E.findAll({order:[['created_at','DESC']],limit:3}).then(r=>{console.log(r.map(e=>e.type));process.exit(0)})"` — Expected: `[ 'order_created', ... ]`.
Tuer le serveur (`kill $(cat /tmp/pouls-boot.pid)`).

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/routes/public.js apps/backend/src/routes/orders.js apps/backend/src/routes/products.js
git commit -m "feat(backend): double écriture des événements Commerce (commandes, stock, produits, commentaires)"
```

---

### Task 3: Route `GET /api/activity`

**Files:**
- Create: `apps/backend/src/routes/activity.js`
- Modify: `apps/backend/src/app.js` (montage `app.use('/api/activity', activityRoutes);` à côté des autres montages ~l.468-481)

**Interfaces:**
- Consumes: modèle `Event` (Task 1).
- Produces: `GET /api/activity?since=<ISO>&limit=<n>` (auth `authenticateToken`) →
  `{ success: true, events: [{ id, type, payload, created_at }...], summary: { orders, paid, delivered, comments, stock_alerts, products } }`
  - `events` : les `limit` (défaut 30, max 100) plus récents du vendeur, ordre décroissant.
  - `summary` : compte les événements DEPUIS `since` (si fourni) — `orders` = order_created, `paid` = order_paid, `delivered` = order_delivered, `comments` = comment_added, `stock_alerts` = stock_low + stock_out, `products` = product_created. Sans `since` : tous à 0.

- [ ] **Step 1: Créer `apps/backend/src/routes/activity.js`**

```js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');
const Event = require('../models/Event');

// GET /api/activity — fil d'événements + résumé "pendant ton absence"
router.get('/', authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const since = req.query.since ? new Date(req.query.since) : null;

    const events = await Event.findAll({
      where: { seller_id: req.seller.id },
      order: [['created_at', 'DESC']],
      limit
    });

    const summary = { orders: 0, paid: 0, delivered: 0, comments: 0, stock_alerts: 0, products: 0 };
    if (since && !isNaN(since.getTime())) {
      const rows = await Event.findAll({
        where: { seller_id: req.seller.id, created_at: { [Op.gt]: since } },
        attributes: ['type']
      });
      for (const row of rows) {
        if (row.type === 'order_created') summary.orders++;
        else if (row.type === 'order_paid') summary.paid++;
        else if (row.type === 'order_delivered') summary.delivered++;
        else if (row.type === 'comment_added') summary.comments++;
        else if (row.type === 'stock_low' || row.type === 'stock_out') summary.stock_alerts++;
        else if (row.type === 'product_created') summary.products++;
      }
    }

    res.json({ success: true, events, summary });
  } catch (error) {
    console.error('❌ Erreur /api/activity:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération de l\'activité' });
  }
});

module.exports = router;
```

- [ ] **Step 2: Monter la route dans `app.js`** — à côté des autres : `const activityRoutes = require('./routes/activity');` puis `app.use('/api/activity', activityRoutes);`

- [ ] **Step 3: Vérifier**

Démarrer le backend local (comme Task 2 Step 5). Sans token : `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/activity` — Expected: `401`.
Avec token (login PIN vendeur test via `POST /api/auth/login {phone_number, pin}` — vendeur seedé PIN 1234) : Expected: JSON `{ success: true, events: [...], summary: {...} }` contenant les événements de la Task 2.

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/routes/activity.js apps/backend/src/app.js
git commit -m "feat(backend): route GET /api/activity (fil + résumé pendant ton absence)"
```

---

### Task 4: PWA — page « Le pouls de ma boutique »

**Files:**
- Create: `apps/vendor-pwa/src/utils/activityMessages.js`
- Create: `apps/vendor-pwa/src/pages/PulsePage.jsx`
- Modify: `apps/vendor-pwa/src/App.jsx` (route `pulse`)
- Modify: le composant de navigation principal (localiser la nav — probablement `apps/vendor-pwa/src/components/` — et ajouter l'entrée « Pouls » ; lire d'abord comment Dashboard/Orders y sont déclarés et suivre exactement le même motif)

**Interfaces:**
- Consumes: `GET /api/activity` (Task 3, via le service `api.js` existant — suivre le motif des autres méthodes du service), événement socket `shop_activity` (Task 1, via le service temps réel existant — lire `realtimeService.js`/`websocket.js` et suivre le motif d'abonnement existant).
- Produces: `formatActivityEvent(event)` → `{ emoji, sentence, timeLabel }`.

- [ ] **Step 1: Créer `apps/vendor-pwa/src/utils/activityMessages.js`** — le traducteur événement → phrase (JAMAIS de type brut à l'écran) :

```js
// Traduit un événement de boutique en phrase française lisible.
// Règle produit : l'interface n'affiche jamais un type d'événement brut.
const FCFA = (n) => `${Number(n || 0).toLocaleString('fr-FR').replace(/ | /g, ' ')} FCFA`;

const RENDERERS = {
  order_created: (p) => ({
    emoji: '🛍️',
    sentence: `${p.customer_name || 'Un client'} a commandé ${p.product_name || 'un produit'}${p.quantity > 1 ? ` (x${p.quantity})` : ''} — ${FCFA(p.total_price)}`
  }),
  order_paid: (p) => ({
    emoji: '💰',
    sentence: `Commande #${p.order_id} payée — ${FCFA(p.total_price)}`
  }),
  order_delivered: (p) => ({
    emoji: '🚚',
    sentence: `Commande #${p.order_id} livrée à ${p.customer_name || 'un client'}`
  }),
  product_created: (p) => ({
    emoji: '📦',
    sentence: `Nouveau produit en boutique : ${p.product_name} — ${FCFA(p.price)}`
  }),
  stock_low: (p) => ({
    emoji: '⚠️',
    sentence: `Stock faible : ${p.product_name} (${p.stock_quantity} restant${p.stock_quantity > 1 ? 's' : ''})`
  }),
  stock_out: (p) => ({
    emoji: '🔴',
    sentence: `Stock épuisé : ${p.product_name}`
  }),
  comment_added: (p) => ({
    emoji: '💬',
    sentence: `${p.author_name || 'Un client'} a laissé un commentaire`
  })
};

export function formatActivityEvent(event) {
  const render = RENDERERS[event.type];
  if (!render) return null; // type inconnu : on n'affiche rien plutôt qu'un type brut
  const { emoji, sentence } = render(event.payload || {});
  const d = new Date(event.created_at);
  const timeLabel = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return { emoji, sentence, timeLabel, date: d };
}
```

- [ ] **Step 2: Créer `apps/vendor-pwa/src/pages/PulsePage.jsx`**

Structure imposée (adapter le style aux composants/classes du design system existant de la PWA — lire `DashboardPage.jsx` d'abord et réutiliser ses motifs de layout, header et cartes) :

```jsx
import { useEffect, useState, useCallback } from 'react';
import { formatActivityEvent } from '../utils/activityMessages';
// + imports du service api et du service temps réel selon les motifs existants

const LAST_SEEN_KEY = 'pulse_last_seen_at';

export default function PulsePage() {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  // sellerName : récupérer depuis le contexte/store d'auth existant (lire comment DashboardPage obtient le vendeur)

  useEffect(() => {
    const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
    // Appel API : GET /api/activity?since=<lastSeen>&limit=30 via le service api existant
    // → setEvents(res.events), setSummary(res.summary), setLoading(false)
    // Puis marquer la visite : localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString())
    // (le résumé affiché reste celui calculé avec l'ancien lastSeen)
  }, []);

  // Temps réel : s'abonner à l'événement socket 'shop_activity' (motif du service existant),
  // prepend : setEvents((prev) => [newEvent, ...prev]);
  // se désabonner au démontage.

  // Rendu :
  // 1. Header : "Bonjour {sellerName} 👋"
  // 2. Bloc "Pendant ton absence" (si summary a au moins un compteur > 0) :
  //    🛍️ {summary.orders} commandes · 💰 {summary.paid} payées · 🚚 {summary.delivered} livraisons
  //    💬 {summary.comments} commentaires · ⚠️ {summary.stock_alerts} alertes stock
  //    (n'afficher que les lignes > 0 ; si tout est à 0 ou pas de lastSeen : "Tout est calme — rien de nouveau depuis ta dernière visite")
  // 3. Fil "Activité" : liste des events via formatActivityEvent
  //    (heure à gauche, emoji + phrase ; les events dont formatActivityEvent retourne null sont ignorés)
  // 4. État vide : "Ta boutique n'a pas encore d'activité. Partage ton lien pour recevoir tes premières commandes !"
}
```

Les commentaires ci-dessus sont le cahier des charges du composant — l'implémenteur écrit le vrai code en suivant les motifs de la PWA (service api, service temps réel, contexte d'auth, composants UI existants).

- [ ] **Step 3: Ajouter la route et la navigation**

Dans `App.jsx`, ajouter la route protégée vendeur `pulse` → `<PulsePage />` en suivant exactement le motif des routes existantes (`SellerRoute`). Localiser le composant de navigation utilisé par les pages vendeur (bottom nav ou menu — le trouver depuis `DashboardPage.jsx`/le layout) et ajouter l'entrée « Pouls » avec une icône cohérente avec les autres entrées.

- [ ] **Step 4: Vérifier en local**

Run: `pnpm --filter @liveshop/vendor-pwa build` — Expected: build vert.
Run: stack dev locale (backend + `pnpm --filter @liveshop/vendor-pwa dev`), se connecter avec le vendeur test (PIN 1234), ouvrir `/pulse` : le fil affiche les événements de la Task 2 en phrases françaises. Créer une commande via curl (Task 2 Step 5) → la ligne apparaît dans le fil sans recharger (temps réel). Recharger après avoir posé `pulse_last_seen_at` dans le passé → le bloc « Pendant ton absence » affiche les compteurs.

- [ ] **Step 5: Commit**

```bash
git add apps/vendor-pwa/src/utils/activityMessages.js apps/vendor-pwa/src/pages/PulsePage.jsx apps/vendor-pwa/src/App.jsx <fichier nav modifié>
git commit -m "feat(pwa): page Le pouls de ma boutique (résumé absence + fil temps réel)"
```

---

### Task 5: Intégration, déploiement (migration incluse), CHECKPOINT

**Files:**
- Modify: `.github/workflows/deploy.yml` (ajouter la migration events à l'étape migrations)
- Aucun autre nouveau fichier (vérification + déploiement).

- [ ] **Step 1: Ajouter la migration au pipeline** — dans `deploy.yml`, après la ligne `docker compose run --rm backend node src/scripts/migrate-push-type.js`, ajouter :

```
            docker compose run --rm backend node src/scripts/migrate-events.js
```

- [ ] **Step 2: Vérification workspace complète**

Run: `pnpm install && pnpm typecheck && pnpm test && pnpm build` — Expected: tout vert.

- [ ] **Step 3: Build Docker + stack locale + séquence deploy**

Run: `docker compose build backend` puis la séquence du pipeline en local : `docker compose up -d db` → attendre healthy → `docker compose run --rm backend node src/scripts/migrate-push-type.js` → `docker compose run --rm backend node src/scripts/migrate-events.js` → `docker compose up -d` → health 200 → `docker compose down`.
Expected: migrations idempotentes OK, backend démarre sain (le `sequelize.sync` créera aussi la table en dev, la migration la garantit en prod AVANT le boot).

- [ ] **Step 4: La démo (point de vue d'Awa)**

Scénario à dérouler et documenter dans le rapport : « Awa ouvre son application. En haut : “Bonjour Awa 👋”. Le bloc lui dit : 2 commandes, 1 alerte stock pendant son absence. Elle lit le fil : “Fatou a commandé Sac raphia — 12 500 FCFA”. Pendant qu'elle regarde, une nouvelle commande de test arrive — la ligne apparaît toute seule. » Si la démo commence par « nous avons ajouté une table Event », elle est ratée.

- [ ] **Step 5: ⚠️ CHECKPOINT UTILISATEUR — accord explicite avant merge**

Le merge sur `main` déclenche le déploiement production. Ne pas merger sans le feu vert.

- [ ] **Step 6: Merge + déploiement + vérification prod** (après accord)

```bash
git checkout main && git merge --no-ff feat/sprint1-pouls-boutique -m "feat: le pouls de ma boutique (journal d'événements + page activité temps réel)"
git push origin main
gh run watch $(gh run list --workflow=deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
curl -s -o /dev/null -w "api: %{http_code}\n" https://api.livelink.store/api/health
curl -s -o /dev/null -w "activity: %{http_code}\n" https://api.livelink.store/api/activity
```

Expected: workflow vert, `api: 200`, `activity: 401` (endpoint déployé, protégé).
