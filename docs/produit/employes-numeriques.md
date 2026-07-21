# LiveLink — Les employés numériques

**Date :** 21 juillet 2026
**Rôle :** définir les emplois que le commerçant peut confier à sa boutique. C'est le document d'organisation du produit : le commerçant n'achète pas un workflow engine, il embauche quelqu'un qui travaille pour lui. Fondation n°2 (après le [dictionnaire métier](dictionnaire-metier.md), avant les catalogues d'événements/workflows/policies et le PRD).

**Principe fondateur :** un employé numérique n'est **pas** « une IA ». C'est un rôle assemblé à partir de quatre briques techniques (voir [l'architecture domaines](../architecture/2026-07-21-domaines-metier.md)) :

```
Événement  →  Workflow  →  Policy Engine  →  Action (business_logic | automation | ai)
                                                    ↓
                                              Communication
```

La majorité du travail de chaque employé est de l'**automatisation fiable** (répondre « prix : 15 000 FCFA » ne demande aucune intelligence — c'est une lecture du catalogue). L'intelligence n'intervient que là où il faut comprendre, créer, conseiller ou négocier — et toujours sous permissions.

**Règles communes à tous les employés :**
- Chaque **responsabilité s'active individuellement** (le commerçant compose son équipe à la carte)
- Les **permissions par défaut sont prudentes** : tout ce qui est irréversible ou engage de l'argent exige une validation humaine tant que le commerçant n'a pas explicitement élargi
- Toute **escalade notifie** le commerçant — jamais d'échec silencieux
- Chaque action a un **coût en crédits connu d'avance** (le « salaire ») ; échelle relative ici, calibrage tarifaire au PRD

---

## 1. Employé Commercial — « il répond et il vend »

**Objectif :** convertir les questions en ventes. Aucun client ne reste sans réponse, aucune commande impayée n'est oubliée.

**Responsabilités :**
1. Répondre aux questions produit (prix, disponibilité, tailles, livraison)
2. Conseiller un produit selon le besoin exprimé
3. Négocier dans les limites fixées par le commerçant
4. Relancer les commandes non payées et les clients inactifs

**Événements écoutés :** `CustomerQuestionReceived`, `CommentAdded`, `OrderCreated` (impayée), `OrderUnpaidReminderDue`*, `LiveStarted` (affluence de questions)
**Événements émis :** `AIResponseDrafted`, `AIEscalatedToHuman`, `NegotiationProposed`

**Automatisations (sans intelligence) :**
- Prix, disponibilité, variantes → lecture directe du catalogue (`business_logic`)
- Accusé de réception immédiat de toute question (`automation`)
- Relance J+1 des commandes impayées, message standard (`automation`)

**Décisions intelligentes (`ai`) :** formulation des réponses non triviales, conseil produit, contre-proposition de négociation dans la fourchette autorisée.

**Décisions humaines (via policy) :** remise au-delà du pourcentage autorisé, question sans réponse possible depuis le catalogue, client signalé sensible.

**Permissions par défaut :**
| Peut seul | Avec validation | Jamais |
|---|---|---|
| ✔ Répondre aux questions factuelles | ⚠ Accorder une remise (dans la fourchette) | ❌ Modifier un prix catalogue |
| ✔ Relancer un client | ⚠ Répondre quand il n'est pas sûr | ❌ Annuler une commande |
| ✔ Conseiller un produit du catalogue | | ❌ Créer une promotion |

**Salaire estimé :** 🟡 moyen — volume élevé de sollicitations, mais la majorité résolue en `business_logic`/`automation` (coût quasi nul) ; seules les réponses rédigées coûtent.

**Dépendances techniques :** cycle de vie de commande étendu, entité Client (pour l'historique de conversation), canal de réception des questions (WhatsApp entrant — n'existe pas encore : aujourd'hui seul le commentaire boutique est capté).

---

## 2. Employé Marketing — « il fait connaître »

**Objectif :** chaque produit a une belle vitrine et la boutique reste visible sur les réseaux, sans que le commerçant y passe ses soirées.

**Responsabilités :**
1. Rédiger fiches et descriptions produit
2. Créer affiches et visuels
3. Produire des vidéos promotionnelles courtes
4. Préparer les publications réseaux sociaux (y compris « derniers exemplaires » sur stock bas)
5. Annoncer les lives programmés

**Événements écoutés :** `ProductCreated` (proposer fiche + visuel), `StockLow` (campagne urgence), `LiveScheduled` (annonce), `WeeklyPlanDue`* (calendrier de publication)
**Événements émis :** `AIContentGenerated`, `PostScheduled`, `CampaignPublished`

**Automatisations (sans intelligence) :** aperçus riches des liens partagés (existe déjà — `og.js`), publication à l'heure programmée, recyclage des visuels existants.

**Décisions intelligentes (`ai`) :** génération de textes, d'affiches, de vidéos, de posts ; choix de l'angle (« urgence stock » vs « nouveauté »).

**Décisions humaines (via policy) :** **par défaut, tout contenu est un brouillon soumis à validation avant publication.** Le commerçant peut passer en publication directe par type de contenu (opt-in explicite).

**Permissions par défaut :**
| Peut seul | Avec validation | Jamais |
|---|---|---|
| ✔ Créer des brouillons | ⚠ Publier (opt-in possible) | ❌ Modifier un prix pour une promo |
| ✔ Programmer un brouillon validé | ⚠ Lancer une campagne multi-posts | ❌ Publier sur un compte non connecté |

**Salaire estimé :** 🔴 élevé à l'unité (génération de médias) mais ponctuel — quelques dizaines de générations/mois, pas des milliers.

**Dépendances techniques :** AI Services (génération multi-modale), connexion aux comptes sociaux du commerçant (n'existe pas — aujourd'hui le partage est manuel), événements temporels.

---

## 3. Employé Logistique — « il fait arriver les commandes »

**Objectif :** chaque commande payée arrive chez le client, et tout le monde sait où elle en est.

**Responsabilités :**
1. Préparer la fiche et le ticket de livraison
2. Contacter le livreur avec les informations de course
3. Suivre l'avancement et relancer si la course traîne
4. Tenir le client informé (confirmation, départ, arrivée)

**Événements écoutés :** `OrderPaid` (ou `OrderAccepted` quand il existera), `DeliveryStarted`, `DeliveryCompleted`, `DeliveryFailed`, `DeliveryStalledReminderDue`*
**Événements émis :** `DeliveryAssigned`, notifications de suivi

**Automatisations (sans intelligence) :** ticket de livraison (**existe déjà** — routes `delivery-ticket`), message WhatsApp livreur (**existe déjà**), notifications de suivi client. **Cet employé est ~100 % `business_logic`/`automation` — c'est voulu et c'est sa force : fiabilité totale.**

**Décisions intelligentes (`ai`) :** marginales — formulation des messages de suivi, rien de plus.

**Décisions humaines (via policy) :** choix du livreur quand plusieurs sont disponibles (sauf règle d'affectation définie), gestion d'un échec de livraison, tout litige.

**Permissions par défaut :**
| Peut seul | Avec validation | Jamais |
|---|---|---|
| ✔ Générer tickets et fiches | ⚠ Affecter un livreur (si règle définie : seul) | ❌ Annuler une commande |
| ✔ Notifier livreur et client | ⚠ Marquer une livraison échouée | ❌ Rembourser |
| ✔ Relancer un livreur en retard | | |

**Salaire estimé :** 🟢 faible — presque tout est de l'automatisation.

**Dépendances techniques :** entité Livreur + statuts de course (domaine Logistics, aujourd'hui partiel), cycle de vie de commande étendu.

---

## 4. Employé SAV — « il transforme les problèmes en fidélité »

**Objectif :** aucune réclamation sans réponse, aucun client déçu sans tentative de rattrapage, et des avis récoltés systématiquement.

**Responsabilités :**
1. Répondre aux réclamations (premier niveau)
2. Instruire les demandes de retour/remboursement (préparer le dossier, jamais décider)
3. Demander un avis après livraison
4. Relancer un client resté silencieux après un problème

**Événements écoutés :** `DeliveryCompleted` (J+2 → demande d'avis), `RefundRequested`*, `CustomerQuestionReceived` (post-vente), `DeliveryFailed`
**Événements émis :** `CustomerReviewRequested`, `AIEscalatedToHuman`, `ApprovalRequested` (dossier de remboursement)

**Automatisations (sans intelligence) :** demande d'avis programmée, accusé de réception de réclamation, constitution du dossier (commande + livraison + échanges).

**Décisions intelligentes (`ai`) :** rédaction des réponses de premier niveau, tri et priorisation des réclamations, détection du ton (client très mécontent → escalade immédiate).

**Décisions humaines (via policy) :** **tout remboursement, sans exception** (interdit absolu côté employé), tout geste commercial au-delà du seuil défini.

**Permissions par défaut :**
| Peut seul | Avec validation | Jamais |
|---|---|---|
| ✔ Répondre au premier niveau | ⚠ Geste commercial (bon, remise) | ❌ Rembourser |
| ✔ Demander un avis | ⚠ Clore une réclamation | ❌ Modifier une commande |
| ✔ Préparer un dossier de retour | | ❌ Supprimer un avis |

**Salaire estimé :** 🟢→🟡 faible à moyen — proportionnel au volume de commandes.

**Dépendances techniques :** `RefundRequested` dans le cycle de vie de commande, entité Client, `ApprovalRequest` (Policy Engine).

---

## 5. Employé Comptable & Analyste — « il dit où on en est »

**Objectif :** le commerçant sait ce qu'il gagne, ce qui se vend et quoi faire ensuite — sans ouvrir un tableur.

**Responsabilités :**
1. Générer les factures
2. Tenir le journal des ventes
3. Produire le résumé hebdomadaire (chiffre, meilleures ventes, tendance)
4. Détecter les tendances et recommander des actions (« ce produit part vite, remonte le stock »)
5. Alerter sur les crédits bas et les anomalies

**Événements écoutés :** `OrderPaid`, `OrderDelivered`, `CreditsLow`, `WeeklySummaryDue`*, `StockOut`
**Événements émis :** `InvoiceGenerated`, `WeeklySummaryReady`, `RecommendationIssued`

**Automatisations (sans intelligence) :** facture (`business_logic` pur), journal des ventes, rapports chiffrés, alertes de seuil.

**Décisions intelligentes (`ai`) :** rédaction du résumé en langage naturel (français/wolof), détection de tendances, recommandations de promotions.

**Décisions humaines :** toutes — **cet employé est le seul en lecture seule vers l'extérieur** : il ne parle qu'au commerçant, ne contacte jamais un client, n'exécute jamais ses propres recommandations. Ses recommandations peuvent devenir des actions d'un autre employé, sur décision du commerçant.

**Permissions par défaut :**
| Peut seul | Avec validation | Jamais |
|---|---|---|
| ✔ Générer factures et rapports | — | ❌ Toute action vers un client |
| ✔ Recommander au commerçant | | ❌ Exécuter ses recommandations |

**Salaire estimé :** 🟢 faible — travail par lots, hebdomadaire.

**Dépendances techniques :** événements temporels, historique de ventes (existe), modèle de facture (n'existe pas encore formellement).

---

## Correspondance employés ↔ briques techniques

| Employé | Automation Engine | Policy Engine | AI Services | Communication | Domaines métier sollicités |
|---|---|---|---|---|---|
| Commercial | ●●● | ●●● (négociation, remises) | ●●● (conversation) | ●●● | Commerce, Monétisation |
| Marketing | ●●○ | ●●○ (brouillon par défaut) | ●●● (génération) | ●●○ | Commerce, Growth, Live |
| Logistique | ●●● | ●○○ | ○○○ (quasi nul) | ●●● | Commerce, Logistics |
| SAV | ●●○ | ●●● (remboursement interdit) | ●●○ | ●●● | Commerce, Logistics |
| Comptable & Analyste | ●●○ | ●○○ (lecture seule) | ●●○ (rédaction, tendances) | ●○○ (commerçant seul) | Commerce, Monétisation |

## Les missions — le travail à la demande

Les employés travaillent selon **deux modes** :

1. **En réaction** — un événement survient (commande, question, stock bas), le workflow de l'employé s'exécute. C'est le quotidien automatique.
2. **En mission** — le commerçant demande un travail : « Fais une campagne pour les sacs. » L'employé décompose, exécute, et **rend son résultat**.

```
Le commerçant : « Fais une campagne pour les sacs »
        ↓
Mission (Employé Marketing)
        ↓  créer l'affiche
        ↓  créer le texte
        ↓  créer la vidéo
        ↓  publier (selon l'état d'autonomie — brouillon si Assistant)
        ↓
Rapport : « Voici ce que j'ai fait, voici les premiers résultats »
```

**Règles des missions :**
- Une mission **rend toujours compte** — le commerçant voit ce qui a été fait, jamais de travail invisible.
- Les policies et l'état d'autonomie s'appliquent **exactement pareil** en mission qu'en réaction : une mission ne contourne aucun garde-fou.
- Techniquement : une mission est un workflow dont le déclencheur est le commerçant plutôt qu'un événement — même moteur (Automation Engine), aucune machinerie nouvelle.
- Le commerçant pense en **travaux à réaliser**, pas en états d'employés : la mission est l'unité de langage naturelle (« fais », « prépare », « relance ») ; l'autonomie ne fait que déterminer ce qui part sans validation.

## Le tableau de bord de l'équipe

L'écran d'accueil du commerçant : **qu'a fait mon équipe aujourd'hui ?**

```
Aujourd'hui
─────────────────────────────
Commercial
  ✓ 43 questions répondues
  ✓ 18 ventes assistées
  ✓ 95 % approuvées
  ⚠ 2 demandes d'aide en attente
─────────────────────────────
Marketing
  ✓ 3 affiches · 2 vidéos · 4 posts
  ◷ Mission « campagne sacs » en cours
─────────────────────────────
Logistique
  ✓ 17 commandes traitées
  ✓ 17 livreurs prévenus
─────────────────────────────
Comptable
  ✓ Rapport de la semaine prêt
```

Quatre zones, par priorité : **demandes d'aide en attente** (l'équipe a besoin du commerçant), **validations en attente** (travaux prêts à partir), **missions en cours**, **le fait du jour** par employé. C'est la preuve quotidienne de valeur — l'écran qui fait dire « mon équipe a travaillé pendant que je vendais en live ».

## Ordre d'embauche recommandé

Aligné sur l'ordre de construction de l'architecture (l'intelligence arrive en dernier, sur des rails sûrs) :

1. **Logistique** — presque zéro `ai`, s'appuie sur l'existant (tickets, WhatsApp livreur), valeur immédiate et fiabilité démontrable. C'est l'employé qui prouve le concept.
2. **Comptable & Analyste** (version chiffrée sans rédaction) — lecture seule, zéro risque, crée l'habitude du « rapport du lundi ».
3. **Marketing** (brouillons uniquement) — première capacité de génération, mais rien ne part sans validation.
4. **SAV** — demande d'avis d'abord (automation pure), réponses rédigées ensuite.
5. **Commercial** — le plus puissant et le plus risqué : conversation client en autonomie. Il arrive quand le Policy Engine et l'escalade ont fait leurs preuves sur les quatre autres.

## Trous découverts en écrivant ce document (à reporter aux catalogues)

- **Événements temporels** (marqués \* ci-dessus : `WeeklySummaryDue`, `OrderUnpaidReminderDue`, `DeliveryStalledReminderDue`…) — absents de la taxonomie v1 du doc d'architecture ; indispensables aux relances et rapports. BullMQ (déjà en prod) sait les porter.
- **Canal entrant client** : aujourd'hui la plateforme *envoie* du WhatsApp mais ne *reçoit* rien. L'Employé Commercial suppose un canal de questions entrantes (WhatsApp entrant ou chat boutique) — décision produit majeure à trancher au PRD.
- **Connexion aux comptes sociaux** du commerçant (publication directe par l'Employé Marketing) — n'existe pas ; le partage est manuel aujourd'hui.
- **Modèle de facture** — mentionné partout dans la vision, formalisé nulle part dans le code.
