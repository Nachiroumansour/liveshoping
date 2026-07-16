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
