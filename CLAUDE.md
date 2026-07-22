# LiveLink — instructions projet

**Communication : en français.**

## À lire en premier

Avant tout travail produit ou fonctionnalité : **`docs/manifesto.md`** — le document maître (identité, principes immuables, décisions irrévocables, carte de la documentation). Toute proposition se confronte à ses principes ; une fonctionnalité qui en viole un n'entre pas dans le produit.

Les fondations produit (`docs/produit/`) sont **gelées v1** : on ne les modifie pas hors découverte terrain. Les catalogues (événements, workflows, policies) se dérivent des scénarios réels (`docs/produit/une-journee-avec-livelink.md`), pas de la théorie.

**Toute UI vendeur se construit dans l'app Expo, jamais dans la PWA (gelée — décision n°11).** Avant de concevoir une interface mobile : lire `docs/ux/README.md` — on construit des **expériences** (notification → son → ouverture → action → retour), pas des écrans, et chaque expérience commence par un **benchmark UX** des meilleures apps du geste concerné. Démos sur Android via Expo Go.

## Repères techniques

- Monorepo pnpm + Turborepo : `apps/` (backend CommonJS Express/Sequelize, web-buyer, vendor-pwa) + `packages/` (shared, api-client — TypeScript sans build, `"main": "./src/index.ts"`)
- Commandes : `pnpm install` / `pnpm dev` / `pnpm test` / `pnpm typecheck` / `pnpm build`
- Déploiement : push sur `main` → GitHub Actions → VPS (build → db → **migrations** → services). Ne jamais merger sur `main` sans accord explicite : ça déploie en production.
- Le backend reste CommonJS. Les règles critiques (`business_logic`) vivent côté backend, jamais côté client.
