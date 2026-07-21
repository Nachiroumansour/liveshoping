# LiveShop Link 🚀

Plateforme de live commerce : les vendeurs gèrent produits et commandes,
les acheteurs commandent via un lien public.

## Structure (monorepo pnpm + Turborepo)

| Package | Chemin | Prod |
|---|---|---|
| `@liveshop/backend` | `apps/backend` | api.livelink.store |
| `@liveshop/web-buyer` | `apps/web-buyer` | livelink.store |
| `@liveshop/vendor-pwa` | `apps/vendor-pwa` | space.livelink.store |
| `@liveshop/shared` | `packages/shared` | constantes, formats, types partagés |
| `@liveshop/api-client` | `packages/api-client` | client REST + temps réel (web & mobile) |

## Commandes

```bash
pnpm install          # tout le workspace
pnpm dev              # tous les serveurs de dev (turbo)
pnpm --filter @liveshop/backend dev   # une seule app
pnpm build            # build de tous les packages
pnpm test             # tests (vitest pour les packages)
pnpm typecheck        # vérification TypeScript
docker compose up -d --build          # stack complète locale
```

## Documentation

| Dossier | Contenu |
|---|---|
| `docs/architecture/` | Architecture orientée domaines (base du PRD) |
| `docs/superpowers/` | Specs et plans d'implémentation (migration monorepo, push Expo) |
| `docs/legacy/` | Anciens guides pré-monorepo (référence uniquement) |
| `scripts/legacy/` | Anciens scripts de déploiement manuels (remplacés par la CI) |

## Déploiement

Push sur `main` → GitHub Actions → VPS : build des images, démarrage de la
base, **migrations** (`docker compose run --rm backend node src/scripts/migrate-push-type.js`),
puis démarrage des services. Voir `.github/workflows/deploy.yml`.
