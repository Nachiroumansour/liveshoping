# Manifeste LiveLink

**Le document maître. À lire en premier, avant tout travail sur le produit. Tout le reste est documentation de référence.**
*Version 1 — 21 juillet 2026. Ce document ne change que sur décision explicite du fondateur.*

---

## Ce que nous sommes

LiveLink donne aux commerçants d'Afrique de l'Ouest une **équipe numérique** : des employés qui répondent aux clients, préparent les livraisons, créent les publications et tiennent les comptes — 24 h/24, en français et en wolof.

Nous ne sommes pas une marketplace. Pas un chatbot. Pas « une IA ». Nous vendons du **travail accompli**.

## Pourquoi nous existons

Le commerce social explose — TikTok, WhatsApp, Instagram, les lives. Mais le commerçant fait tout à la main : il répond aux mêmes questions quinze fois par jour, perd les ventes de la nuit, note les commandes dans trois conversations, et personne ne prend les commandes pendant qu'il est en direct.

LiveLink existe pour qu'**aucune vente ne se perde** par manque de réponse, de suivi ou de temps — et pour rendre au commerçant les heures que ces tâches lui volent.

## Notre client

Awa, vendeuse de sacs et de wax à Dakar. Elle vend en live sur TikTok, prend les commandes sur WhatsApp, envoie Moussa livrer à Dakar-centre. Elle ne connaît ni « workflow » ni « policy » — elle connaît *répondre, préparer, livrer, publier, encaisser*.

**Si Awa ne comprend pas une fonctionnalité en dix secondes, la fonctionnalité est mal conçue — pas Awa.**

## La promesse

> « Embauche ton premier employé numérique. »

Et sa preuve, chaque lundi matin : *« Cette semaine, ton équipe t'a fait économiser 6 h 20 et a contribué à 18 ventes. Coût : 1 500 FCFA. »*

---

## Les principes immuables

Toute décision produit, technique ou commerciale se confronte à ces règles. Une fonctionnalité qui en viole une n'entre pas dans le produit — quelle que soit sa popularité du moment.

1. **Le commerçant garde toujours le contrôle des décisions critiques.** Rembourser, changer un prix, supprimer : jamais sans lui.
2. **Un employé numérique demande de l'aide plutôt que d'inventer.** C'est la signature du produit — et la réponse du commerçant le forme.
3. **Les workflows sont déterministes ; l'intelligence n'intervient que là où elle est utile.** Réserver un stock, créer une facture : des règles fiables, jamais de l'improvisation.
4. **Toute automatisation doit pouvoir être expliquée au commerçant.** « Pourquoi as-tu fait ça ? » a toujours une réponse simple.
5. **Chaque action a un coût visible avant, et une valeur mesurable après.** Le barème de temps est consultable ; l'attribution est prudente (« a contribué à », jamais « a généré »).
6. **Aucune intégration externe ne devient le cœur du produit.** WhatsApp, réseaux sociaux, paiement : des extensions. Le cœur — la boutique, l'équipe, la mémoire — nous appartient.
7. **Chaque fonctionnalité doit vendre plus, faire gagner du temps ou réduire les erreurs.** Sinon elle attend — sans exception « stratégique ».
8. **La mémoire est une conséquence invisible, jamais l'argument de vente.** Le commerçant paie parce que son commercial répond mieux qu'avant — pas « pour une mémoire ». Elle travaille en silence.
9. **Le mot « IA » n'existe pas dans le produit.** Ni dans l'interface, ni dans le discours. Un moteur invisible, comme l'ABS d'une voiture.
10. **La confiance se gagne, elle ne se coche pas.** Tout employé démarre supervisé ; l'autonomie se mérite par le taux de validation, se propose, et peut se retirer.

## Ce que nous ne ferons jamais

- **Verrouiller les données du commerçant.** Sa rétention vient de la connaissance accumulée par son équipe, pas de barrières à la sortie.
- **Exécuter une action irréversible sans validation** quand une règle l'exige — aucun niveau de confiance ne débloque les interdits.
- **Placer la marketplace entre le commerçant et ses clients.** Son lien direct est sacré ; la marketplace ajoute des clients, elle n'en confisque pas.
- **Publier au nom du commerçant sans son accord explicite** — canal par canal, format par format.
- **Promettre que « l'IA s'occupe de tout ».** Nous promettons une équipe qui doute à bon escient — c'est pour ça qu'on peut lui faire confiance.

## Les décisions irrévocables

Actées, datées, on ne les rouvre pas :

| Décision | Date |
|---|---|
| Faire évoluer LiveLink existant — jamais de réécriture à zéro | 21/07/2026 |
| Chaîne d'exécution : Événement → Workflow → Policy Engine → Action | 21/07/2026 |
| Toute action est typée : `business_logic` \| `automation` \| `ai` | 21/07/2026 |
| La mémoire appartient à la boutique ; jamais partagée entre boutiques | 21/07/2026 |
| Trois catégories de mémoire jamais mélangées : connaissance métier / préférence / compétence | 21/07/2026 |
| Canal entrant : chat boutique d'abord, WhatsApp ensuite | 21/07/2026 |
| Paiement à l'usage (crédits) — pas d'abonnement mort | 21/07/2026 |
| Trois états d'autonomie : Assistant / Autonome / Expert | 21/07/2026 |
| Le produit s'organise par employés (jobs), pas par modules techniques | 21/07/2026 |
| **Les surfaces du produit** — Vendeur → application mobile (Android/iOS), outil de travail quotidien ; Client → web en priorité (aucune installation requise), invitation à installer l'app pour une meilleure expérience ; Administrateur → web ; Back-office → web. Toute nouvelle fonctionnalité précise sa surface. | 22/07/2026 |

---

## La carte de la documentation

Ce manifeste d'abord. Ensuite, selon le besoin :

| Besoin | Document |
|---|---|
| Le sens d'un mot | [produit/dictionnaire-metier.md](produit/dictionnaire-metier.md) |
| Ce que fait un employé, missions, tableau de bord | [produit/employes-numeriques.md](produit/employes-numeriques.md) |
| Formation, autonomie, évaluation, demande d'aide | [produit/cycle-de-vie-employes.md](produit/cycle-de-vie-employes.md) |
| Le produit vécu (et ses incohérences trouvées) | [produit/une-journee-avec-livelink.md](produit/une-journee-avec-livelink.md) |
| Les raisons de fond, zéro technique | [produit/pourquoi-livelink-gagne.md](produit/pourquoi-livelink-gagne.md) |
| Comment on prouve le ROI | [produit/mesure-de-la-valeur.md](produit/mesure-de-la-valeur.md) |
| Domaines, entités, événements, ordre de construction | [architecture/2026-07-21-domaines-metier.md](architecture/2026-07-21-domaines-metier.md) |

## Le test final

Chaque décision, chaque écran, chaque ligne de code répond à une seule question :

> **« Est-ce que ça fait gagner à Awa plus d'argent ou plus de temps que sa façon actuelle de travailler ? »**

Si la réponse demande plus d'une phrase, la réponse est non.
