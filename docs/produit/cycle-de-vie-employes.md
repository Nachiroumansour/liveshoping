# LiveLink — Le cycle de vie des employés numériques

**Date :** 21 juillet 2026
**Rôle :** décrire comment un employé numérique est recruté, formé, gagne de l'autonomie, est évalué, et peut être suspendu ou remplacé. Complète [employes-numeriques.md](employes-numeriques.md) (qui définit *qui ils sont*) en décrivant *comment ils vivent*. Un employé numérique est un salarié, pas une fonctionnalité — ce document est son contrat de travail.

**La règle de décision produit (s'applique à tout ce document et à toute la suite) :**

> *« Cette fonctionnalité permet-elle au commerçant de vendre plus, de gagner du temps ou de réduire ses coûts ? »* Si non → version ultérieure.

**Deux principes d'exécution :**
1. **La métaphore RH est dosée.** « Recruter », « former », « carrière » servent le marketing et l'onboarding — ils rendent le produit désirable. Mais l'interface quotidienne reste sobre : on *désactive* un employé (on ne le « licencie » pas à chaque clic), on voit *ce qui a été fait aujourd'hui*. Le commerçant veut avant tout que ça marche.
2. **L'IA est un moteur invisible.** Comme l'ABS d'une voiture : le conducteur dit « elle freine bien », jamais « j'ai acheté un système antiblocage ». Le commerçant dit « j'ai un commercial numérique qui répond à mes clients » — LLM, workflows, policies et bus d'événements travaillent derrière le rideau et n'apparaissent nulle part.

---

## Le cycle de vie commun — 7 phases

Toutes les phases s'appliquent aux 5 employés. Les spécificités par employé sont détaillées ensuite.

### Phase 1 — Recrutement (l'embauche)

Le commerçant ouvre l'écran **« Recruter »** et voit les profils disponibles — chaque employé se présente comme une offre d'emploi inversée : ses responsabilités, ce qu'il sait faire seul au départ (presque rien), son salaire estimé en crédits, ses prérequis (ex. l'Employé Logistique demande qu'un livreur soit renseigné).

- L'embauche se fait en un geste. **Tout employé démarre au niveau de confiance 1** (tout est supervisé), quel que soit le talent du commerçant à configurer.
- Le recrutement lui-même est gratuit — c'est le travail qui coûte (le salaire à l'usage). Pas d'abonnement mort : un employé qui ne travaille pas ne coûte rien.

### Phase 2 — Prise de poste (l'entretien d'embauche)

Pas de formulaire à quarante champs. L'employé fraîchement embauché **pose des questions**, comme un vrai premier jour :

> « À quelle heure arrêtes-tu les livraisons le soir ? » — « Tu livres dans quelles zones ? » — « Jusqu'à quel pourcentage de remise puis-je descendre ? » — « Tu préfères que je parle français ou wolof à tes clients ? »

Chaque réponse devient, techniquement, une **policy** ou un paramètre de profil. Le commerçant peut interrompre l'entretien et le reprendre — l'employé retient où il en était. Un employé peut travailler avec un entretien incomplet : il escalade simplement plus souvent.

### Phase 3 — Formation (la base de connaissances)

L'écran **« Former mon employé »**. Le commerçant donne ce qu'il a, dans le format qu'il a :

- documents (PDF, catalogues fournisseurs)
- photos (étiquettes, tableaux de prix manuscrits)
- **notes vocales** — format n°1 au Sénégal, en français ou en wolof
- FAQ, politiques internes (« pas d'échange après 48 h »)

L'employé ingère, extrait, puis **rend compte** :

> « J'ai appris 12 nouvelles informations. En voici le résumé. »
> « Je ne suis pas certain d'une règle : *livraison gratuite dès 25 000 FCFA* — c'est bien ça ? »

**Trois catégories qui ne se mélangent jamais :**

| Catégorie | Exemple | Appartient à | Alimentée par |
|---|---|---|---|
| **Connaissance métier** | « Livraison à Dakar : 2 000 FCFA » | La **boutique** — tous les employés y puisent | La formation et les corrections |
| **Préférence** | « Sois toujours très poli », langue de réponse | **Un employé** — le Commercial peut être formel, le SAV chaleureux | L'entretien d'embauche et les ajustements |
| **Compétence** | Créer une vidéo, rédiger une description | La **plateforme** — identique pour toutes les boutiques | Les mises à jour du moteur — jamais la formation |

Mélanger ces trois catégories rendrait la mémoire ingérable : un commerçant qui « forme » ne touche que les deux premières, et sait toujours laquelle.

**Règles de la connaissance métier :**
- Toute connaissance a un statut : `proposée → confirmée → active` (et `contestée` si une contradiction est détectée). Seules les connaissances actives servent aux réponses.
- Toute connaissance garde sa **source** (quel document, quelle note vocale, quelle date) — le commerçant peut toujours demander « d'où tiens-tu ça ? ».
- Le commerçant peut consulter la mémoire (« Que sais-tu ? »), corriger, supprimer.
- **La mémoire appartient à la boutique, pas à un employé** : un seul cerveau de boutique, plusieurs rôles qui y puisent. Former une fois, tous en profitent. Rien n'est jamais partagé entre boutiques.

C'est cette phase qui rend chaque employé **unique** — deux Employés Commerciaux de deux boutiques n'ont pas les mêmes réponses, parce qu'ils n'ont pas eu la même formation.

### Phase 4 — Apprentissage continu

La formation n'est pas un événement unique ; l'employé apprend de la supervision :

- Chaque **correction** du commerçant sur une réponse proposée devient une connaissance ou une policy (« Non, la livraison à Pikine c'est 2 000, pas 1 500 » → mémoire mise à jour, source : correction du 21/07).
- Chaque **validation** est un signal de confiance comptabilisé (voir Phase 5).
- Des **refus répétés** du même type d'action déclenchent une question, pas de l'entêtement : « Tu refuses souvent mes propositions de relance — tu préfères que j'arrête, ou que je change de ton ? »

L'apprentissage est **local et traçable** : pas de boîte noire qui « s'améliore » mystérieusement — le commerçant peut lister ce que l'employé a appris et quand.

### Phase 5 — Autonomie progressive (les niveaux de confiance)

Le remplacement de l'interrupteur « Activer l'IA » par une **carrière**.

**Mécanique :**
- La confiance se mesure **par type d'action**, pas globalement (un employé peut être excellent en relances et médiocre en négociation).
- Le système calcule le **taux de validation** sur les dernières décisions de chaque type (ex. : 47 des 50 dernières réponses proposées ont été envoyées sans modification → 94 %).
- Quand un seuil est atteint (ordre de grandeur : ≥ 95 % sur un volume suffisant), le système **propose la promotion — il ne l'impose jamais** :

> « Ton Employé Commercial a eu 97 % de ses réponses validées ce mois-ci. Veux-tu l'autoriser à répondre directement aux questions sur les tailles et couleurs ? »

- La confiance peut **redescendre** : une erreur grave ou une chute du taux de validation rétrograde automatiquement l'état, avec notification et explication.
- **Plafond absolu :** les interdits de policy (rembourser, modifier les prix, supprimer) ne sont **jamais** débloqués par la confiance. Expert n'est pas l'omnipotence — c'est l'autonomie dans le périmètre.

**Trois états — c'est tout :**

| État | Principe | Analogie |
|---|---|---|
| **Assistant** | Tout est proposé, tout est validé | Le premier mois |
| **Autonome** | Les actions courantes du métier passent seules | Le titulaire du poste |
| **Expert** | Les actions à jugement passent seules, dans les bornes | Le bras droit |

Trois mots compréhensibles, pas une échelle numérique. Une gradation plus fine pourra raffiner ces états plus tard si l'usage le demande — la mécanique (par type d'action, promotion proposée, rétrogradation) ne changera pas.

### Phase 6 — Évaluation (la fiche de performance)

Chaque employé a sa fiche, en **métriques métier** — jamais techniques. La question à laquelle la fiche répond : *« qu'est-ce que cet employé me rapporte ? »*

- **Colonne coût :** salaire consommé (crédits) sur la période.
- **Colonne valeur :** ses résultats métier (voir les métriques par employé plus bas).
- **La phrase de synthèse :** « Ce mois-ci, cet employé t'a coûté 2 400 crédits et a contribué à 34 ventes. »

Le résumé mensuel de chaque employé est son **entretien d'évaluation** — rédigé par l'Employé Comptable & Analyste (qui évalue aussi ses collègues, en lecture seule, comme tout le reste).

### Phase 7 — Suspension, rétrogradation, désactivation

- **Suspension** : un bouton, effet immédiat. Tout ce qui est en file d'attente est gelé, rien ne s'exécute. L'employé indique « suspendu » partout où il apparaissait.
- **Rétrogradation** : retour manuel ou automatique à un état de confiance inférieur, sans perte de mémoire.
- **Désactivation** : arrêt complet. **La formation est conservée** — réactiver ne coûte pas une nouvelle formation (la mémoire appartient à la boutique). *(« Licencier » reste un mot d'onboarding et de marketing — l'interface dit « désactiver ».)*
- **Remise à zéro** : effacement explicite de la mémoire concernée. Action irréversible, doublement confirmée.

---

## La demande d'aide — la signature du produit

Un bon employé ne répond jamais au hasard : **il reconnaît les limites de son autonomie et sollicite**. C'est le comportement qui distingue un employé numérique d'un chatbot :

> « J'ai reçu une question sur un produit sans prix. »
> « Je ne connais pas cette politique de retour — que dois-je répondre ? »
> « Je pense que ce client souhaite une remise exceptionnelle. Veux-tu intervenir ? »

**Règles :**
- Une demande d'aide n'est jamais un échec silencieux : elle notifie, avec le contexte complet (la question du client, ce que l'employé sait, ce qui lui manque).
- **Chaque réponse du commerçant forme** : elle devient une connaissance métier (ou une policy), et la même situation ne redéclenchera plus de demande. La boutique s'améliore en travaillant.
- Le volume de demandes d'aide est une métrique de santé : il doit **décroître naturellement** avec la formation et l'ancienneté — s'il ne décroît pas, c'est un signal (formation insuffisante, ou responsabilité mal calibrée).
- Les demandes d'aide en attente sont visibles au premier regard sur le tableau de bord de l'équipe.

---

## Les carrières par employé (échelles d'autonomie concrètes)

### Employé Commercial
| État | Ce qui passe seul |
|---|---|
| Assistant | Rien — chaque réponse est validée avant envoi |
| Autonome | Réponses factuelles (prix, dispo, variantes), relances impayés, accusés de réception |
| Expert | Réponses rédigées, conseils produit, négociation dans la fourchette autorisée |

**Formation clé :** catalogue à jour, politiques de remise, ton de la boutique, FAQ clients.
**Métriques d'évaluation :** temps de première réponse, taux questions→ventes, ventes assistées, taux de validation, escalades.

### Employé Marketing
| État | Ce qui passe seul |
|---|---|
| Assistant | Rien — tout est brouillon soumis à validation |
| Autonome | Publication des formats déjà validés une fois (posts récurrents, visuels sur gabarits approuvés) |
| Expert | Campagnes « stock bas » et calendrier de publication autonomes |

**Formation clé :** identité visuelle, produits phares, exemples de posts qui ont marché.
**Métriques :** contenus produits, publications, clics sur les liens partagés, ventes attribuées aux campagnes.

### Employé Logistique
| État | Ce qui passe seul |
|---|---|
| Assistant | Rien — chaque action est proposée |
| Autonome | Tickets, notifications de suivi, affectation du livreur selon la règle définie |
| Expert | Orchestration complète, relances livreur incluses — seuls les litiges remontent |

**Formation clé :** zones et tarifs de livraison, livreurs et leurs disponibilités, horaires limites.
**Métriques :** délai commande→livraison, % livraisons sans incident, litiges.

### Employé SAV
| État | Ce qui passe seul |
|---|---|
| Assistant | Rien — tout en brouillon |
| Autonome | Demandes d'avis, réponses de premier niveau |
| Expert | Gestes commerciaux ≤ seuil, clôture des réclamations simples |

**Formation clé :** politique de retour, cas types et leurs résolutions, ton en situation de conflit.
**Métriques :** temps de première réponse, réclamations résolues sans escalade, avis récoltés, note moyenne.

### Employé Comptable & Analyste
Cas particulier : il est **en lecture seule par conception** — sa carrière ne porte pas sur « agir seul » mais sur la **pertinence** : au fil des recommandations suivies (ou pas) par le commerçant, il apprend ce qui intéresse cette boutique. D'Assistant à Expert = du rapport brut standard au conseil personnalisé qui connaît les priorités du commerçant.

**Métriques :** recommandations suivies et leur effet mesuré, régularité de lecture des rapports.

---

## L'équipe — comment les employés travaillent ensemble

Pas de « communication » magique entre employés : ils collaborent **par les événements**, comme des collègues autour d'un tableau partagé — et par la **mémoire commune de la boutique**.

Le scénario de référence :

```
Marketing crée une promotion            → événement CampaignPublished
Commercial la voit dans la mémoire      → la met en avant dans ses réponses
Comptable mesure les ventes attribuées  → WeeklySummaryReady
Marketing (et le commerçant) lisent le  → la prochaine campagne s'ajuste
résultat
```

Deux mécanismes suffisent, et ils existent déjà dans l'architecture :
1. **Le bus d'événements** (Automation Engine) — un employé émet, les autres écoutent.
2. **La mémoire de boutique** (Formation) — connaissances partagées : les promos actives, les politiques, le catalogue sont lisibles par tous les employés.

Aucun mécanisme nouveau n'est nécessaire : « l'équipe » est une propriété émergente du bus + de la mémoire commune. C'est ce qui la rend fiable.

---

## Le canal entrant — décision actée

**Le chat intégré à la page boutique d'abord. WhatsApp ensuite.**

Le parcours reste celui qui existe : lien partagé → page web du produit → et là, **un chat dans la page**, tenu par l'Employé Commercial.

Pourquoi ce choix (et pas WhatsApp entrant en premier) :
- **Contrôle total** : pas de dépendance à l'API WhatsApp Business (coûts par conversation, validation Meta, risques de bannissement de numéro).
- **Mesurable** : chaque conversation est rattachée à la page, au produit, à la session — l'attribution question→vente est native.
- **Cohérent avec l'existant** : le lien public est déjà le cœur du produit ; le chat s'y greffe sans nouveau canal à installer côté client.
- WhatsApp reste la **suite naturelle** (les clients y sont), comme extension du même Employé Commercial — même mémoire, même policies, canal en plus.

Conséquence produit : l'entité **Client** (identifiée au minimum par téléphone) naît naturellement du chat — le trou « le client n'est pas une entité » se comble par ce chemin.

---

## Impact sur l'architecture (renvois)

Ce document ajoute au système :
- **Un domaine nouveau : Formation & Mémoire** — ingestion multi-format (dont audio wolof), extraction, statuts de connaissance, traçabilité des sources. Ajouté au doc d'architecture (domaine n°12).
- **Une extension du Policy Engine : la confiance** — les niveaux d'autonomie sont des policies dynamiques, recalculées à partir des taux de validation ; le Policy Engine reste l'unique point de décision.
- **Rien de nouveau pour l'équipe** — bus d'événements + mémoire commune suffisent.
- **Le chat intégré** — nouveau point d'entrée du domaine Commerce (page publique), génère `CustomerQuestionReceived` et fait naître l'entité Client.

## Cadrage MVP (application de la règle)

Les 7 phases et les 3 états (Assistant/Autonome/Expert) sont la **cible de conception — et le MVP les implémente tels quels** (trois états, c'est déjà la version simple). Le MVP peut par ailleurs vivre avec :
- Formation par texte et FAQ d'abord ; **les notes vocales suivent vite** (réalité terrain sénégalaise) ; PDF/images ensuite
- La fiche d'évaluation réduite à : coût, actions réalisées, taux de validation, ventes assistées
- Les demandes d'aide dès le premier jour — elles coûtent peu et sont la signature du produit

Chaque élément coupé passe le filtre : il fait gagner du temps *plus tard*, mais ne bloque ni la vente, ni le gain de temps initial.
