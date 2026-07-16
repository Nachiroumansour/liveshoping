FROM node:20 AS build
WORKDIR /workspace

RUN npm install -g pnpm@10.4.1

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/web-buyer/package.json apps/web-buyer/
COPY apps/vendor-pwa/package.json apps/vendor-pwa/

RUN pnpm install --filter @liveshop/web-buyer... --frozen-lockfile

COPY apps/web-buyer apps/web-buyer

RUN pnpm --filter @liveshop/web-buyer build

FROM nginx:alpine
COPY --from=build /workspace/apps/web-buyer/dist /usr/share/nginx/html
COPY apps/web-buyer/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
