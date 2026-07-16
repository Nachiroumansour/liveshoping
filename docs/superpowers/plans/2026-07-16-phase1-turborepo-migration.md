# Phase 1 — Migration Turborepo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructurer le dépôt en monorepo pnpm workspaces + Turborepo (`apps/backend`, `apps/web-buyer`, `apps/vendor-pwa`) sans aucun changement fonctionnel, avec Docker et CI/CD opérationnels.

**Architecture:** Les 3 apps existantes sont déplacées via `git mv` sous `apps/`, un workspace pnpm unique remplace les lockfiles npm/pnpm mélangés, Turborepo orchestre `build`/`dev`/`lint`. Les Dockerfiles passent en contexte racine (le lockfile est à la racine) avec `pnpm install --filter`. Le workflow GitHub Actions reste inchangé (il fait `docker compose up -d --build`).

**Tech Stack:** pnpm 10, Turborepo 2.x, Node 18 (images Docker existantes), Docker Compose, nginx-proxy externe.

## Global Constraints

- **Zéro changement de code applicatif** : uniquement déplacements, renommages de packages et fichiers de config/infra.
- Noms de packages : `@liveshop/backend`, `@liveshop/web-buyer`, `@liveshop/vendor-pwa` (spec).
- `git mv` obligatoire pour préserver l'historique (spec).
- Noms de services/containers docker-compose inchangés (`backend`/`livelink-backend`, `dashboard`/`livelink-dashboard`, `mobile`/`livelink-mobile`, `db`/`livelink-db`) — nginx-proxy s'appuie dessus.
- Travailler sur la branche `feat/turborepo-migration` — **un push sur `main` déclenche le déploiement prod**.
- pnpm 10 bloque les scripts postinstall par défaut : `bcrypt`, `sqlite3`, `esbuild` doivent être approuvés via `onlyBuiltDependencies`.
- Le fichier `.env` racine (présent sur le VPS, non versionné) reste la source des variables d'env des conteneurs (`env_file: .env`) — ne pas le déplacer ni le renommer.

---

### Task 1: Scaffolding du workspace racine

**Files:**
- Create: `package.json` (racine)
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `.dockerignore` (racine)
- Create: `packages/.gitkeep`
- Modify: `.gitignore`

**Interfaces:**
- Produces: workspace pnpm `apps/*` + `packages/*` ; scripts racine `pnpm build|dev|lint` (turbo) ; `onlyBuiltDependencies` pour bcrypt/sqlite3/esbuild. Les Tasks 2–5 supposent ces fichiers exactement tels quels.

- [ ] **Step 1: Créer la branche de travail**

```bash
git checkout -b feat/turborepo-migration
```

- [ ] **Step 2: Créer `package.json` racine**

```json
{
  "name": "liveshop-link",
  "private": true,
  "packageManager": "pnpm@10.4.1",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.5.0"
  }
}
```

- [ ] **Step 3: Créer `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"

onlyBuiltDependencies:
  - bcrypt
  - sqlite3
  - esbuild
```

- [ ] **Step 4: Créer `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {}
  }
}
```

- [ ] **Step 5: Créer `.dockerignore` racine**

Avec le contexte de build à la racine, ce fichier est critique (sinon tous les `node_modules` partent dans le contexte Docker) :

```
**/node_modules
**/.git
.git
**/dist
**/.turbo
.turbo
.npm-cache
.claude
docs
support
**/*.log
**/logs
.DS_Store
```

- [ ] **Step 6: Ajouter `.turbo/` au `.gitignore`**

Ajouter à la fin de `.gitignore` :

```
# Turborepo
.turbo/
```

- [ ] **Step 7: Créer `packages/.gitkeep`**

```bash
mkdir -p packages && touch packages/.gitkeep
```

- [ ] **Step 8: Vérifier que le workspace est reconnu (vide pour l'instant)**

Run: `pnpm install`
Expected: succès, création de `pnpm-lock.yaml` racine, installation de `turbo`. (Aucune app encore dans `apps/` — normal.)

Run: `pnpm exec turbo --version`
Expected: `2.5.x` (ou supérieur)

- [ ] **Step 9: Commit**

```bash
git add package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json .dockerignore .gitignore packages/.gitkeep
git commit -m "chore: scaffolding workspace pnpm + turborepo (phase 1)"
```

---

### Task 2: Déplacement des 3 apps et unification pnpm

**Files:**
- Move: `liveshop-backend/` → `apps/backend/`
- Move: `web-client/liveshop-client/` → `apps/web-buyer/`
- Move: `mobile-app/liveshop-vendor/` → `apps/vendor-pwa/`
- Modify: `apps/backend/package.json`, `apps/web-buyer/package.json`, `apps/vendor-pwa/package.json` (champ `name`)
- Delete: `apps/*/package-lock.json`, `apps/web-buyer/pnpm-lock.yaml`, `apps/vendor-pwa/pnpm-lock.yaml`

**Interfaces:**
- Consumes: workspace de la Task 1.
- Produces: packages workspace `@liveshop/backend`, `@liveshop/web-buyer`, `@liveshop/vendor-pwa` aux chemins `apps/backend`, `apps/web-buyer`, `apps/vendor-pwa`. Les Dockerfiles (Tasks 3–4) et le compose (Task 5) utilisent ces chemins et noms exacts.

- [ ] **Step 1: Déplacer les apps avec `git mv`**

`git mv` renomme le répertoire sur le disque : les fichiers non versionnés qu'il contient (`.env`, `.env.local`, `node_modules`…) suivent automatiquement.

```bash
mkdir -p apps
git mv liveshop-backend apps/backend
git mv web-client/liveshop-client apps/web-buyer
git mv mobile-app/liveshop-vendor apps/vendor-pwa
rmdir web-client mobile-app 2>/dev/null; rm -rf web-client mobile-app
```

- [ ] **Step 2: Vérifier que les fichiers `.env` non versionnés ont bien suivi**

Run: `ls apps/backend/.env apps/backend/.env.local apps/vendor-pwa/.env.production 2>&1`
Expected: les fichiers existent (au minimum ceux présents avant : `.env`, `.env.development`, `.env.example`, `.env.local`, `.env.production`, `.env.sqlite.dev` côté backend).

- [ ] **Step 3: Renommer les packages**

Dans `apps/backend/package.json` : `"name": "liveshop-backend"` → `"name": "@liveshop/backend"`.
Dans `apps/web-buyer/package.json` : `"name": "liveshop-client"` → `"name": "@liveshop/web-buyer"`.
Dans `apps/vendor-pwa/package.json` : `"name": "liveshop-vendor"` → `"name": "@liveshop/vendor-pwa"`.

Supprimer le champ `"packageManager"` dans `apps/web-buyer/package.json` et `apps/vendor-pwa/package.json` (il vit désormais à la racine uniquement).

- [ ] **Step 4: Purger les anciens lockfiles et node_modules**

```bash
rm -f apps/backend/package-lock.json apps/web-buyer/package-lock.json apps/vendor-pwa/package-lock.json
rm -f apps/web-buyer/pnpm-lock.yaml apps/vendor-pwa/pnpm-lock.yaml
git rm --cached apps/backend/package-lock.json apps/web-buyer/package-lock.json apps/vendor-pwa/package-lock.json apps/web-buyer/pnpm-lock.yaml apps/vendor-pwa/pnpm-lock.yaml 2>/dev/null || true
rm -rf apps/backend/node_modules apps/web-buyer/node_modules apps/vendor-pwa/node_modules
```

- [ ] **Step 5: Installer tout le workspace**

Run: `pnpm install`
Expected: succès, `pnpm-lock.yaml` racine mis à jour avec les 3 apps. Si un avertissement « Ignored build scripts » mentionne un paquet **autre** que ceux approuvés, l'ajouter à `onlyBuiltDependencies` dans `pnpm-workspace.yaml` et relancer `pnpm install`.

- [ ] **Step 6: Vérifier les modules natifs du backend**

Run: `(cd apps/backend && node -e "require('bcrypt'); require('sqlite3'); console.log('natifs OK')")`
Expected: `natifs OK`. Si erreur « invalid ELF header » ou « module not found », vérifier `onlyBuiltDependencies` puis `pnpm rebuild bcrypt sqlite3`.

- [ ] **Step 7: Vérifier le build Turborepo**

Run: `pnpm build`
Expected: `Tasks: 2 successful, 2 total` (web-buyer et vendor-pwa buildent ; backend n'a pas de script `build`, il est ignoré). Les dossiers `apps/web-buyer/dist/` et `apps/vendor-pwa/dist/` existent.

- [ ] **Step 8: Vérifier le démarrage local du backend**

Run: `(cd apps/backend && timeout 15 node src/app.js) 2>&1 | head -30`
Expected: logs de démarrage (« Démarrage de LiveShop Link API… ») sans erreur de module. Une erreur de connexion PostgreSQL est acceptable ici (pas de DB locale démarrée) — seul le chargement du code compte.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "refactor: déplacement des 3 apps vers apps/ + workspace pnpm unifié"
```

---

### Task 3: Dockerfile backend en contexte racine

**Files:**
- Modify: `apps/backend/Dockerfile` (réécriture complète)
- Modify: `docker-compose.yml` (service `backend` uniquement)

**Interfaces:**
- Consumes: workspace et chemins des Tasks 1–2.
- Produces: image backend buildable via `docker compose build backend` avec `context: .`.

- [ ] **Step 1: Réécrire `apps/backend/Dockerfile`**

```dockerfile
FROM node:18
WORKDIR /workspace

RUN npm install -g pnpm@10

# Manifests du workspace d'abord (cache Docker)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/backend/package.json apps/backend/

RUN pnpm install --filter @liveshop/backend... --prod --no-frozen-lockfile

# Code de l'app
COPY apps/backend apps/backend

WORKDIR /workspace/apps/backend
EXPOSE 3001
CMD ["node", "src/app.js"]
```

- [ ] **Step 2: Mettre à jour le service `backend` dans `docker-compose.yml`**

Remplacer :

```yaml
  backend:
    build: ./liveshop-backend
```

par :

```yaml
  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
```

(Tout le reste du service — container_name, mem_limit, networks, environment, env_file, volumes, depends_on — inchangé.)

- [ ] **Step 3: Builder l'image**

Run: `docker compose build backend`
Expected: build réussi. Si Docker n'est pas lancé localement, démarrer Docker Desktop d'abord.

- [ ] **Step 4: Smoke test du conteneur**

```bash
docker run --rm -e NODE_ENV=production -e DATABASE_URL=postgresql://x:x@localhost:5432/x $(docker compose config --images backend | head -1) timeout 10 node -e "require('/workspace/apps/backend/src/models'); console.log('boot OK')" || true
```

Expected: `boot OK` (le chargement des modèles valide bcrypt/sequelize/pg dans l'image). Une erreur de connexion DB après ce log est acceptable.

- [ ] **Step 5: Commit**

```bash
git add apps/backend/Dockerfile docker-compose.yml
git commit -m "build: Dockerfile backend en contexte racine monorepo (pnpm filter)"
```

---

### Task 4: Dockerfiles des deux fronts en contexte racine

**Files:**
- Modify: `apps/web-buyer/Dockerfile` (réécriture complète)
- Modify: `apps/vendor-pwa/Dockerfile` (réécriture complète)
- Modify: `docker-compose.yml` (services `dashboard` et `mobile`)

**Interfaces:**
- Consumes: workspace et chemins des Tasks 1–2.
- Produces: images `dashboard` (web-buyer) et `mobile` (vendor-pwa) buildables via `docker compose build`.

- [ ] **Step 1: Réécrire `apps/web-buyer/Dockerfile`**

```dockerfile
FROM node:18 AS build
WORKDIR /workspace

RUN npm install -g pnpm@10

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web-buyer/package.json apps/web-buyer/

RUN pnpm install --filter @liveshop/web-buyer... --no-frozen-lockfile

COPY apps/web-buyer apps/web-buyer

RUN pnpm --filter @liveshop/web-buyer build

FROM nginx:alpine
COPY --from=build /workspace/apps/web-buyer/dist /usr/share/nginx/html
COPY apps/web-buyer/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 2: Réécrire `apps/vendor-pwa/Dockerfile`**

Identique au web-buyer, plus `NODE_ENV=production` **après** l'install (les devDependencies — vite — sont nécessaires au build) pour que Vite charge `.env.production`, comme aujourd'hui :

```dockerfile
FROM node:18 AS build
WORKDIR /workspace

RUN npm install -g pnpm@10

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/vendor-pwa/package.json apps/vendor-pwa/

RUN pnpm install --filter @liveshop/vendor-pwa... --no-frozen-lockfile

COPY apps/vendor-pwa apps/vendor-pwa

ENV NODE_ENV=production
RUN pnpm --filter @liveshop/vendor-pwa build

FROM nginx:alpine
COPY --from=build /workspace/apps/vendor-pwa/dist /usr/share/nginx/html
COPY apps/vendor-pwa/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 3: Mettre à jour `docker-compose.yml`**

Service `dashboard` : remplacer `build: ./web-client/liveshop-client` par :

```yaml
    build:
      context: .
      dockerfile: apps/web-buyer/Dockerfile
```

Service `mobile` : remplacer `build: ./mobile-app/liveshop-vendor` par :

```yaml
    build:
      context: .
      dockerfile: apps/vendor-pwa/Dockerfile
```

- [ ] **Step 4: Builder les deux images**

Run: `docker compose build dashboard mobile`
Expected: les deux builds passent. Vérifier dans les logs du build `mobile` que `vite build` s'exécute en mode production.

- [ ] **Step 5: Vérifier l'absence d'URL localhost dans le build vendor-pwa**

(Remplace les étapes de debug de l'ancien Dockerfile.)

```bash
docker run --rm $(docker compose config --images mobile | head -1) sh -c "grep -r 'localhost:3001' /usr/share/nginx/html && echo 'ATTENTION localhost trouvé' || echo 'OK pas de localhost'"
```

Expected: `OK pas de localhost`

- [ ] **Step 6: Commit**

```bash
git add apps/web-buyer/Dockerfile apps/vendor-pwa/Dockerfile docker-compose.yml
git commit -m "build: Dockerfiles fronts en contexte racine monorepo"
```

---

### Task 5: Stack complète en local (docker compose up)

**Files:**
- Aucun nouveau fichier (vérification d'intégration). Éventuellement création locale d'un `.env` racine non versionné.

**Interfaces:**
- Consumes: images des Tasks 3–4.
- Produces: validation que la stack complète tourne — prérequis au déploiement (Task 7).

- [ ] **Step 1: S'assurer qu'un `.env` racine existe (requis par `env_file: .env`)**

```bash
[ -f .env ] || cp apps/backend/.env .env
```

(`.env` est dans `.gitignore` — il ne sera pas commité.)

- [ ] **Step 2: Créer le réseau externe si absent (local uniquement)**

```bash
docker network inspect nginx-proxy >/dev/null 2>&1 || docker network create nginx-proxy
```

- [ ] **Step 3: Démarrer la stack**

Run: `docker compose up -d && sleep 20 && docker compose ps`
Expected: 4 conteneurs `Up` (livelink-backend, livelink-dashboard, livelink-mobile, livelink-db), db `healthy`.

- [ ] **Step 4: Vérifier le backend**

Run: `docker exec livelink-backend node -e "require('http').get('http://localhost:3001/api/health', r => { console.log('status', r.statusCode); process.exit(0) })"`
Expected: `status 200`

- [ ] **Step 5: Vérifier les fronts (nginx sert bien les builds)**

```bash
docker exec livelink-dashboard sh -c "ls /usr/share/nginx/html/index.html && echo dashboard OK"
docker exec livelink-mobile sh -c "ls /usr/share/nginx/html/index.html && echo mobile OK"
```

Expected: `dashboard OK` puis `mobile OK`

- [ ] **Step 6: Consulter les logs backend pour toute erreur de démarrage**

Run: `docker compose logs backend | tail -30`
Expected: pas de stack trace fatale (une erreur Redis est tolérée si Redis n'est pas activé — le service est optionnel dans le compose).

- [ ] **Step 7: Arrêter la stack locale**

```bash
docker compose down
```

---

### Task 6: Scripts legacy et documentation racine

**Files:**
- Move: `deploy*.sh`, `prepare-pr.sh`, `seed-manual.sh`, `show-system.sh`, `check-ci-cd.sh`, `create-env-file.sh` → `scripts/legacy/`
- Create: `scripts/legacy/README.md`
- Modify: `README.md` (racine)

**Interfaces:**
- Consumes: rien (indépendant).
- Produces: racine du repo propre ; scripts obsolètes identifiés.

- [ ] **Step 1: Déplacer les scripts obsolètes**

Ces scripts référencent les anciens chemins (`liveshop-backend/`, `web-client/`…) ; le déploiement prod passe par GitHub Actions et n'en dépend pas :

```bash
mkdir -p scripts/legacy
git mv deploy.sh deploy-backend.sh deploy-final.sh deploy-local.sh deploy-mobile.sh deploy-production-with-comments.sh deploy-smart.sh deploy-urgent-fix.sh deploy-watch.sh deploy-web-client.sh deploy-web.sh prepare-pr.sh seed-manual.sh show-system.sh check-ci-cd.sh create-env-file.sh scripts/legacy/
```

- [ ] **Step 2: Créer `scripts/legacy/README.md`**

```markdown
# Scripts legacy (pré-monorepo)

Ces scripts datent d'avant la migration Turborepo (juillet 2026) et référencent
les anciens chemins (`liveshop-backend/`, `web-client/liveshop-client/`,
`mobile-app/liveshop-vendor/`). Ils sont conservés pour référence mais **ne
fonctionnent plus tels quels**.

Équivalents actuels :
- Développement : `pnpm dev` (turbo) ou `pnpm --filter @liveshop/<app> dev`
- Build : `pnpm build`
- Déploiement prod : automatique via GitHub Actions au push sur `main`
- Stack locale : `docker compose up -d --build`
```

- [ ] **Step 3: Réécrire `README.md` racine**

```markdown
# LiveShop Link 🚀

Plateforme de live commerce : les vendeurs gèrent produits et commandes,
les acheteurs commandent via un lien public.

## Structure (monorepo pnpm + Turborepo)

| Package | Chemin | Prod |
|---|---|---|
| `@liveshop/backend` | `apps/backend` | api.livelink.store |
| `@liveshop/web-buyer` | `apps/web-buyer` | livelink.store |
| `@liveshop/vendor-pwa` | `apps/vendor-pwa` | space.livelink.store |
| (partagés, à venir) | `packages/*` | — |

## Commandes

```bash
pnpm install          # tout le workspace
pnpm dev              # tous les serveurs de dev (turbo)
pnpm --filter @liveshop/backend dev   # une seule app
pnpm build            # build de tous les packages
docker compose up -d --build          # stack complète locale
```

## Déploiement

Push sur `main` → GitHub Actions → VPS (`docker compose up -d --build`).
Voir `.github/workflows/deploy.yml`.
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scripts pré-monorepo déplacés vers scripts/legacy + README à jour"
```

---

### Task 7: Déploiement production et vérification

**Files:**
- Aucun (merge + vérification). Le workflow `.github/workflows/deploy.yml` ne nécessite aucun changement : il clone le repo et lance `docker compose up -d --build` — les nouveaux chemins sont portés par `docker-compose.yml`.

**Interfaces:**
- Consumes: branche `feat/turborepo-migration` complète et vérifiée (Tasks 1–6).
- Produces: monorepo en production, critère de succès Phase 1 atteint.

- [ ] **Step 1: Vérification finale avant merge**

```bash
pnpm install && pnpm build && docker compose build
git status
```

Expected: builds verts, arbre de travail propre.

- [ ] **Step 2: ⚠️ CHECKPOINT UTILISATEUR — obtenir l'accord explicite avant le merge**

Le merge sur `main` déclenche le déploiement prod immédiat (`git reset --hard` + rebuild sur le VPS). Ne pas merger sans le feu vert de l'utilisateur.

- [ ] **Step 3: Merger et pousser**

```bash
git checkout main
git merge --no-ff feat/turborepo-migration -m "feat: migration monorepo pnpm + turborepo (phase 1)"
git push origin main
```

- [ ] **Step 4: Surveiller le déploiement GitHub Actions**

Run: `gh run watch $(gh run list --workflow=deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId')`
Expected: workflow vert. En cas d'échec, lire les logs : `gh run view --log-failed`.

- [ ] **Step 5: Vérifier les 3 domaines en production**

```bash
curl -s -o /dev/null -w "api: %{http_code}\n" https://api.livelink.store/api/health
curl -s -o /dev/null -w "buyer: %{http_code}\n" https://livelink.store
curl -s -o /dev/null -w "vendor: %{http_code}\n" https://space.livelink.store
```

Expected: `api: 200`, `buyer: 200`, `vendor: 200`

- [ ] **Step 6: Vérifier le WebSocket prod**

```bash
curl -s "https://api.livelink.store/socket.io/?EIO=4&transport=polling" | head -c 100
```

Expected: réponse commençant par `0{"sid":...` (handshake Engine.IO).

- [ ] **Step 7: Rollback si nécessaire (ne pas exécuter si tout est vert)**

```bash
# Uniquement en cas d'échec irrécupérable :
git revert -m 1 HEAD && git push origin main
# Le CI redéploie l'ancienne structure automatiquement.
```
