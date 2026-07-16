# Configuration de l'URL Backend (développement)

Pour forcer l'URL du backend pour les websockets et l'API, créez un fichier `.env.local` à la racine de `liveshop-vendor/` avec:

```
VITE_BACKEND_URL=http://192.168.1.10:3001
# ou
# VITE_BACKEND_PORT=3001
```

Par défaut, l'app détecte automatiquement les IP privées (`localhost`, `127.0.0.1`, `10.*`, `172.16-31.*`, `192.168.*`) et utilise le port 3001. 