# Expérience : « Je viens de recevoir une commande »

**Date :** 22 juillet 2026 — **Surface :** app mobile vendeur (Expo, Android d'abord) — **Statut :** en construction, jalon 1

## 1. L'intention

Awa est au marché, téléphone en poche. Une cliente commande sur sa boutique. **Trente secondes plus tard, Awa sait tout et a déjà agi — sans avoir ouvert l'app d'elle-même.** C'est le moment où le téléphone devient l'employé : il l'interrompt à bon escient, lui donne tout, et lui demande un seul geste.

## 2. Le benchmark

*Analyse sur la base des patterns établis de ces apps (connaissance à janvier 2026) — à confronter au terrain dès les premiers tests.*

| App | Ce qu'elle fait sur ce geste | Ce qu'on en retient |
|---|---|---|
| **Uber Driver** | La notification de course EST l'écran de décision : plein écran, son insistant, infos clés visibles, une action géante, compte à rebours | La notification n'est pas une alerte « va voir » — elle porte déjà la décision |
| **DoorDash Merchant** | Nouvelle commande = son distinct + écran avec code couleur d'état et temps écoulé depuis réception | Le temps écoulé crée l'urgence saine ; la couleur dit l'état sans lire |
| **Shopify POS** | Le « cha-ching » : chaque vente a un son signature, différent de toute autre notification — une récompense, pas une interruption | Le son de vente doit être reconnaissable les yeux fermés, et joyeux |
| **Square** | Résumé de vente ultra-dense : montant énorme, détail secondaire | Hiérarchie brutale : le montant d'abord, le reste ensuite |
| **Meituan Merchant** | Auto-acceptation configurable + enchaînement automatique (impression, préparation) | C'est le futur Employé Logistique en mode Autonome — pas jalon 1, mais l'architecture doit y mener |
| **WhatsApp Business** | Réponses rapides depuis la notification, regroupement par conversation | Les actions dans la notification elle-même ; le groupement quand il y a rafale |

**Les 3 idées retenues :**
1. **La notification est l'écran de décision** (Uber/DoorDash) — elle affiche produit, quantité, montant, nom du client. Toucher = ouvrir directement le détail de LA commande (deep link), jamais une liste à re-parcourir.
2. **Le son signature** (Shopify) — un son de vente propre à LiveLink, distinct de tout le reste du téléphone, + vibration. Atout existant : la PWA a déjà des fichiers audio **wolof** (`apps/vendor-pwa/public/audio/wolof/`) — cet ADN sonore se réutilise.
3. **Un geste, un retour** (Uber/Square) — une seule action principale au premier plan, exécutable en un geste (swipe ou gros bouton), avec retour haptique + visuel immédiat, et le montant en héros de l'écran.

## 3. Le déroulé (seconde par seconde)

```
T+0s   Fatou commande le sac raphia (12 500 FCFA) sur la boutique web d'Awa
T+1s   Backend : commande créée → événement order_created → push Expo
T+3s   Le téléphone d'Awa sonne — LE son LiveLink, reconnaissable, + vibration
       Notification : « 🛍️ Nouvelle commande — Sac raphia ×1 · 12 500 FCFA · Fatou »
T+5s   Awa touche la notification
T+6s   L'app s'ouvre DIRECTEMENT sur la commande (deep link) — pas le dashboard,
       pas une liste. Montant en très grand. Produit, photo, quantité, client,
       téléphone, adresse, méthode de paiement. Temps écoulé visible (« il y a 12 s »)
T+10s  Un geste : le bouton principal selon l'état de la commande
       (« Marquer payée » si preuve de paiement reçue — voir périmètre)
T+11s  Retour : haptique + confirmation visuelle + le Pouls enregistre la ligne
T+12s  Awa range son téléphone. Total : ~10 secondes d'attention.
```

**Si Awa ne touche pas la notification :** rien ne se perd — le badge reste, le Pouls affichera la commande dans « Pendant ton absence », et la cascade existante (Web Push PWA, temps réel) continue de fonctionner en parallèle.

## 4. Les cas limites

- **App fermée/tuée** : le push natif réveille — c'est tout l'intérêt du canal Expo (infra Phase 2a). À vérifier sur Android réel (économiseurs de batterie agressifs des constructeurs).
- **Rafale pendant un live** : au-delà de 3 commandes en quelques minutes, grouper (« 🛍️ 5 nouvelles commandes — 47 500 FCFA ») plutôt que 5 sons successifs. Toucher → le Pouls filtré sur les commandes.
- **Mode silencieux / nuit** : on respecte le système. Pas de contournement — le Pouls rattrape au réveil (« Pendant ton absence »).
- **Hors connexion à l'ouverture** : afficher les données de la notification (payload) + état « connexion... » ; retry simple. Pas de file offline complexe au jalon 1.
- **Token push expiré** : ré-enregistrement silencieux à chaque ouverture de l'app (la purge côté serveur existe déjà — `DeviceNotRegistered`).

## 5. Le périmètre (jalon 1)

**Dedans :** notification native avec payload riche, son + vibration (son signature v1), deep link vers le détail de commande, écran de détail (montant en héros, temps écoulé), action de changement de statut selon le cycle actuel (`pending → paid → delivered`), retour haptique, ré-enregistrement du token.

**Pas dedans (et pourquoi) :**
- « Accepter/refuser » une commande — le statut `accepted` **n'existe pas encore** dans le cycle de vie backend (extension prévue au catalogue d'événements). Le geste du jalon 1 agit sur les statuts réels d'aujourd'hui. Quand `OrderAccepted` naîtra, le geste changera de cible, pas de forme.
- Actions dans la notification elle-même (accepter sans ouvrir) — après le jalon 1, quand le geste principal aura fait ses preuves.
- Auto-acceptation à la Meituan — c'est l'Employé Logistique en état Autonome, pas une option d'app.
- Groupement de rafale — jalon 2 si les lives le réclament (à valider au terrain).

## 6. La démo (critère de réussite du jalon 1)

> Awa pose son téléphone sur la table, écran éteint. Depuis un autre téléphone, on passe une commande sur sa boutique web. **Son téléphone sonne — le son LiveLink.** Elle le prend, touche la notification : la commande est là, montant en grand, tout est lisible. Un geste — « payée ». Vibration. C'est fini. Elle n'a jamais cherché quoi que ce soit.

Si la démo commence par « voici la liste des commandes », elle est ratée. Elle commence par un téléphone qui sonne.
