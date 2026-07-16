# Design — Migration Turborepo + App mobile native vendeur

**Date** : 16 juillet 2026
**Statut** : validé (approche A, sections 1–6 approuvées)

## Contexte

LiveShop Link est une plateforme de live commerce (marché sénégalais) : les vendeurs
gèrent produits/commandes/lives via une PWA (`space.livelink.store`), les acheteurs
commandent via un lien public (`livelink.store/:linkId`). Backend Express + Sequelize
+ Socket.IO + PostgreSQL, notifications temps réel (Socket.IO) et Web Push (VAPID +
BullMQ), OTP WhatsApp, paiements Wave/Orange Money/PayDunya, images Cloudinary.

Le dépôt actuel contient 3 projets indépendants sans workspace (lockfiles npm/pnpm
mélangés, aucun code partagé). Déploiement : push sur `main` → GitHub Actions → SSH
VPS → `git reset --hard` + `docker compose up -d --build` (4 conteneurs derrière
nginx-proxy externe).

## Objectif

1. Migrer le dépôt vers un monorepo **pnpm workspaces + Turborepo**.
2. Créer une **app mobile native vendeur** (React Native + Expo), Android d'abord,
   en **coexistence** avec la PWA vendeur.

## Décisions de cadrage

| Sujet | Décision |
|---|---|
| App mobile | Vendeur uniquement (les acheteurs restent sur le web) |
| Techno | React Native + Expo, TypeScript |
| Sort de la PWA vendeur | Coexistence, maintenue en parallèle |
| Scope V1 | MVP cœur métier : login PIN/OTP, dashboard, produits, commandes temps réel, push natif, paramètres paiement. Lives, stats avancées, crédits, wallet, panel admin : V2+. Inscription : reste sur la PWA en V1 (lien depuis l'app). |
| Distribution | Android d'abord (EAS Build : APK preview, puis AAB Play Store). iOS ensuite. |
| Stratégie | Approche A : deux phases séquentielles, chacune déployable et vérifiable |

## Phase 1 — Migration Turborepo (zéro changement fonctionnel)

### Structure cible

```
liveshop-link/
├─ package.json              # racine : scripts turbo, devDeps communes
├─ pnpm-workspace.yaml       # packages: apps/*, packages/*
├─ turbo.json                # pipeline : build, dev, lint
├─ .npmrc                    # config pnpm (node-linker=hoisted si Metro l'exige)
├─ apps/
│  ├─ backend/               # ← liveshop-backend/           (git mv)
│  ├─ web-buyer/             # ← web-client/liveshop-client/ (git mv)
│  └─ vendor-pwa/            # ← mobile-app/liveshop-vendor/ (git mv)
├─ packages/                 # vide en Phase 1
├─ docker-compose.yml        # contexts mis à jour
└─ .github/workflows/deploy.yml
```

### Règles

- `git mv` pour préserver l'historique.
- pnpm partout : suppression des `package-lock.json`, un seul `pnpm-lock.yaml` racine.
  Le backend passe de npm à pnpm.
- Noms normalisés : `@liveshop/backend`, `@liveshop/web-buyer`, `@liveshop/vendor-pwa`.
- Aucun changement de code applicatif. Les scripts `deploy-*.sh` racine sont mis à
  jour ou marqués obsolètes.
- `turbo.json` minimal : `build` (dependsOn `^build`), `dev` (persistent), `lint`.
  Pas de cache distant.

### Docker et CI/CD (point critique)

- Contexte de build = **racine du repo** : dans `docker-compose.yml`,
  `build: { context: ., dockerfile: apps/<app>/Dockerfile }`.
- Dockerfiles multi-stage : `corepack enable` → copie `pnpm-lock.yaml`,
  `pnpm-workspace.yaml` et les `package.json` du sous-arbre → `pnpm install
  --filter <app>...` → build.
  - Backend : `pnpm install --filter @liveshop/backend... --prod` (le backend n'a
    aucune dépendance workspace en Phase 1 ; passage à `pnpm deploy` en Phase 2
    si des packages partagés entrent dans l'image).
  - Fronts : inchangés après build — nginx sert `dist/`.
- Workflow GitHub Actions quasi inchangé (il clone et fait `docker compose up -d
  --build`) ; seuls les chemins dans `docker-compose.yml` changent.

### Critère de succès Phase 1

`pnpm install` + `turbo build` verts ; `docker compose build && up` local : 3
conteneurs sains ; déploiement prod : les 3 domaines répondent (HTTP + WebSocket).
Rollback : revert du commit, le CI redéploie l'ancienne structure.

## Phase 2 — Packages partagés + app Expo + push natif

### `packages/shared` (`@liveshop/shared`, TypeScript)

Constantes et logique pure extraites de la PWA vendeur : statuts de commande,
catégories produits, formatage FCFA, validation téléphone SN, types des entités
(Seller, Product, Order…).

### `packages/api-client` (`@liveshop/api-client`, TypeScript)

Client REST + Socket.IO, **agnostique de la plateforme** — config par injection :

```ts
createApiClient({
  baseUrl,            // import.meta.env (PWA) / process.env.EXPO_PUBLIC_* (Expo)
  getToken, setToken, // localStorage (web) / expo-secure-store (mobile)
})
```

Endpoints : auth, products, orders, upload, push. `createRealtimeClient`
(Socket.IO) avec les mêmes événements que la PWA (`new_order`, …).

Pattern **internal packages** : les packages exportent leur source (pas de build) ;
Vite et Metro transpilent.

**Limite volontaire** : la PWA n'est pas refactorisée pour consommer ces packages en
Phase 2 (l'extraction copie/adapte). Bascule de la PWA = Phase 3 optionnelle.

### App Expo `apps/vendor-mobile` (`@liveshop/vendor-mobile`)

- Stack : Expo SDK récent, TypeScript, expo-router, NativeWind, React Query,
  expo-secure-store (JWT).
- Écrans V1 :
  - **Connexion** : téléphone + PIN, reset PIN par OTP. Lien « Créer un compte » →
    ouvre la PWA dans le navigateur.
  - **Dashboard** : stats du jour, dernières commandes.
  - **Produits** : liste, création/édition, photos via expo-image-picker/camera →
    upload Cloudinary via l'endpoint backend existant.
  - **Commandes** : liste, détail, changement de statut, mise à jour temps réel.
  - **Paramètres** : profil boutique, Wave/Orange Money, déconnexion.
- Temps réel : socket connecté app ouverte ; push natif app fermée.
- Metro configuré pour le workspace pnpm ; fallback `.npmrc node-linker=hoisted`
  si problème de symlinks.
- Build : EAS — profil `preview` (APK distribution directe), puis `production`
  (AAB Play Store).

### Backend : troisième canal de notification (seule modif backend)

- Modèle `PushSubscription` étendu : champ `type` (`'webpush'` | `'expo'`) + token
  Expo. Pas de nouvelle table.
- Enregistrement du token : nouvel endpoint dédié `POST /api/push/expo-token`
  (authentifié vendeur), l'endpoint Web Push existant reste inchangé.
- Envoi via `expo-server-sdk` (Expo route vers FCM/APNs ; clé FCM gérée dans la
  config EAS, pas de credentials Firebase côté serveur en V1).
- Fan-out de `sendRealtimeNotification()` : Socket.IO + Web Push + Expo Push.
  Retry BullMQ réutilisé tel quel.

### Vérification Phase 2

- Typecheck + lint via turbo sur packages et app mobile.
- Tests unitaires (vitest) sur la logique pure des packages partagés.
- Tests manuels sur Android réel (APK preview EAS) du flux critique :
  login → création produit → commande côté acheteur web → notification push reçue
  app fermée → changement de statut.

## Hors scope

- Refactoring de la PWA vendeur et du web acheteur vers les packages partagés (Phase 3).
- iOS (après la V1 Android).
- Inscription vendeur dans l'app native (V2).
- Lives, stats avancées, crédits/wallet, panel admin dans l'app native (V2+).
- Cache distant Turborepo, suite de tests sur le code existant.

## Risques identifiés

| Risque | Mitigation |
|---|---|
| Build Docker casse en prod (structure monorepo) | Phase 1 isolée, testée en local (`docker compose build`) avant merge ; rollback = revert |
| Metro/pnpm symlinks | Expo gère les monorepos nativement ; fallback `node-linker=hoisted` |
| Scripts shell racine obsolètes | Mis à jour ou marqués obsolètes en Phase 1 |
| Backend npm → pnpm (deps natives : bcrypt, sqlite3) | Vérification du démarrage conteneur en local avant déploiement |
