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
