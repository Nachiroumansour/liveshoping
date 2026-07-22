# LiveLink — Les moments

**Le standard de conception des expériences (établi le 22 juillet 2026, avec la Décision n°11 du manifeste — élargi le même jour aux moments client).**

## Le produit a deux faces

LiveLink se joue sur deux expériences qui se nourrissent : celle du **vendeur** (Awa) et celle du **client** (Fatou). **Le client est le véritable juge du produit** — si acheter n'est pas plus simple que WhatsApp, il n'y a rien à automatiser côté vendeur. Toute fonctionnalité future doit améliorer un des moments listés ici ; si elle n'en améliore aucun, elle attend.

## On ne construit pas des écrans. On construit des moments.

Un écran est un rectangle. Un moment commence avant l'ouverture (un lien, une notification) et finit après (une confirmation, un souvenir) :

```
déclencheur → son/arrivée → ouverture → lecture → action → retour → confirmation
```

On ne dit plus « construisons l'écran Commandes ». On dit « construisons le moment *Je viens de recevoir une commande* ».

## Les règles

1. **Benchmark UX obligatoire avant toute conception.** Chaque moment commence par l'analyse des meilleures apps du monde sur ce geste précis — côté vendeur : Shopify POS, Square, Meituan Merchant, Uber Driver, DoorDash Merchant, WhatsApp Business ; côté client : Shein, Temu, Jumia, WhatsApp, Wave (liste extensible) — et en extrait **les trois meilleures idées**. Ensuite seulement on conçoit.
2. **La question de conception** (manifeste) : *« Si LiveLink naissait aujourd'hui uniquement sur smartphone, comment concevrait-on ce moment ? »* Côté vendeur : app native, notifications, gestes. Côté client : **web d'abord, zéro installation, zéro compte obligatoire** (Décision n°10).
3. **L'intelligence est invisible des deux côtés — mais différemment.** Le vendeur voit une *équipe* (jamais « une IA »). Le client, lui, ne voit **rien du tout** : il ne doit jamais se demander s'il parle à une machine. Il doit juste être bien servi, vite, et bien suivi. Le jour où un client pense « tiens, c'est une IA », la magie est perdue.
4. **Des scénarios, pas des wireframes.** Intention, benchmark, déroulé vécu, cas limites, critère de démo — l'interface en découle.
5. **Écrits juste-à-temps** : un document naît quand son moment entre en construction — ou quand il audite une expérience déjà en production (les moments client jugent le web-buyer existant).

## Structure d'un document de moment

1. **L'intention** — ce que vit la personne, en une phrase
2. **Le benchmark** — apps analysées, 3 idées retenues
3. **Le déroulé** — seconde par seconde, du déclencheur à la confirmation
4. **Les cas limites** — offline, silencieux, rafale, erreur
5. **Le périmètre** — dans le jalon courant / plus tard (règle MVP)
6. **La démo** — le critère de réussite, filmable en 30-60 s

## Les moments vendeur

| Moment | Statut |
|---|---|
| [Je viens de recevoir une commande](je-viens-de-recevoir-une-commande.md) | **En construction — jalon 1 app mobile** |
| Je lance un live | À écrire |
| Je publie un produit | À écrire |
| Je prépare une livraison | À écrire |
| Je forme mon commercial | À écrire |
| Une mission se termine | À écrire |

## Les moments client

| Moment | Statut |
|---|---|
| Je clique sur un lien TikTok — les 10 premières secondes | À écrire en premier — audite le web-buyer déjà en production |
| Je pose une question (et le commercial numérique répond) | À écrire — inclut : quand passe-t-il la main au vendeur ? |
| Je commande — est-ce plus simple que WhatsApp ? | À écrire — audite le parcours existant |
| Je paie | À écrire |
| J'attends mon colis — comment suis-je rassuré ? | À écrire |
| Je reviens acheter — pourquoi chez cette boutique ? | À écrire |
| Je recommande à un ami | À écrire |

## Les moments « waouh » (candidats — à valider au terrain)

Un moment waouh vaut dix fonctionnalités. Candidats identifiés, à confirmer ou infirmer en filmant de vrais usages :

**Vendeur — « je ne peux plus revenir en arrière » :**
- Le téléphone qui sonne d'une vente pendant qu'il fait autre chose — la première fois qu'une vente le *trouve*, lui.
- Le Pouls du matin : « pendant que tu dormais, 3 commandes » — la première preuve que la boutique travaille seule.
- La première réponse d'une demande d'aide qui *forme* : la question ne revient plus jamais.

**Client — « c'était étonnamment simple » :**
- Du clic TikTok à la page produit en moins de 3 secondes, sans installation, sans compte, sans mur.
- Une réponse à sa question à 23 h, en quelques secondes, dans sa langue.
- Savoir où en est sa commande sans avoir rien installé — quand WhatsApp seul ne lui a jamais offert ça.

## Les démos filmées

**Chaque jalon se termine par une vidéo de 30 à 60 secondes** : téléphone en main, commande réelle, notification réelle, parcours réel. Le critère de démo du document de moment est le scénario du film. Pourquoi filmer : on voit immédiatement si l'expérience est fluide ou laborieuse ; on montre l'avancement à des commerçants et partenaires sans rien leur faire installer ; et dans un an, l'historique vidéo du produit vaudra de l'or. Les vidéos sont conservées hors repo (trop lourdes), référencées par date et jalon.
