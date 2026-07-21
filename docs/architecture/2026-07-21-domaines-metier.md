# LiveLink — Architecture orientée domaines

**Date :** 21 juillet 2026
**Objectif :** cartographier les domaines métier existants et à créer pour atteindre la vision « système d'exploitation du commerce social africain ». Ce document sert de base au futur PRD. Aucun code — uniquement l'architecture.

**Méthode :** chaque domaine est ancré dans le code réel (`apps/backend/src/`) : modèles Sequelize, routes Express, services. Statut = **Existant** (solide), **Partiel** (embryon dans le code), **À créer** (rien n'existe).

---

## Vue d'ensemble

| # | Domaine | Statut | Ancrage dans le code actuel |
|---|---------|--------|------------------------------|
| 1 | Commerce | **Existant** | Seller, Product, ProductVariant, Order, Comment, OTP |
| 2 | Live Commerce | **Existant** | Live, LiveProduct |
| 3 | Communication & Notifications | **Existant** | Notification, PushSubscription, webPush/expoPush/whatsapp, Socket.IO |
| 4 | Monétisation (Crédits) | **Existant** | CreditTransaction, creditService, paymentIntegrationService |
| 5 | Logistics | **Partiel** | delivery-info/delivery-ticket (routes publiques), messages WhatsApp livreur |
| 6 | Plateforme & Admin | **Existant** | AdminSetting, routes admin, rôle superadmin |
| 7 | Automation Engine | **À créer** | Embryon : notificationQueue (BullMQ) — mais aucun bus d'événements |
| 8 | Policy Engine | **À créer** | Rien |
| 9 | AI Services | **À créer** | Rien |
| 10 | Marketplace | **À créer** | Rien de cross-boutique (public.js est strictement mono-boutique via linkId) |
| 11 | Growth & Marketing | **Partiel** | og.js (aperçus réseaux sociaux), stats commandes |
| 12 | Formation & Mémoire | **À créer** | Rien — ajouté le 21/07 (cycle de vie des employés) |

> **Écart avec la liste des 6 domaines proposée :** la vision omettait **Monétisation** (le modèle économique actuel de la plateforme — les vendeurs consomment des crédits pour agir), **Communication** (déjà un vrai sous-système à 3 canaux : Web Push, Expo Push, WhatsApp) et **Plateforme & Admin**. Inversement, « Live Commerce » existe déjà dans le code alors que la vision n'en parlait pas — à décider : le conserver comme domaine ou le fondre dans Growth & Marketing.

---

## 1. Commerce — *Existant*

**Objectif :** le cœur transactionnel — un vendeur crée sa boutique, publie des produits, reçoit des commandes via son lien public.

**Entités principales :**
- `Seller` — boutique + identité (téléphone/PIN, `public_link_id`, `payment_settings` Wave/OM, logo, description, rôle)
- `Product` / `ProductVariant` — catalogue avec images, catégories, épinglage, stock par variante
- `Order` — commande client (nom, téléphone, adresse, quantité, `total_price`, statut `pending|paid|delivered`, méthode de paiement, preuve de paiement)
- `Comment` — questions/avis clients sur la boutique
- `OTP` — vérification téléphone (avec rate-limiting dédié)

**Événements émis (à formaliser — aujourd'hui ce sont des appels directs) :**
`OrderCreated`, `OrderPaid`, `OrderDelivered`, `OrderCancelled`, `ProductCreated`, `ProductUpdated`, `ProductDeleted`, `StockLow`, `StockOut`, `CommentAdded`, `SellerRegistered`, `PaymentProofUploaded`

**Événements consommés :** aucun (domaine source — il est en amont de tout).

**Dépendances :** Monétisation (certaines actions consomment des crédits) ; Communication (notifie à chaque transition de commande).

**Note importante :** le statut de commande actuel (`pending|paid|delivered`) est plus pauvre que la taxonomie cible (`OrderAccepted`, `OrderRejected`, `RefundRequested`…). Étendre ce cycle de vie est un prérequis du moteur de workflows — on ne peut pas déclencher des automatisations sur des états qui n'existent pas.

---

## 2. Live Commerce — *Existant*

**Objectif :** vendre en direct — un live (TikTok/Instagram) est adossé à une sélection de produits accessible via un lien dédié.

**Entités :** `Live` (titre, slug, date), `LiveProduct` (association live ↔ produits).

**Événements émis :** `LiveScheduled`, `LiveStarted`, `LiveEnded`, `ProductPinnedToLive`.

**Événements consommés :** potentiellement `OrderCreated` (compteur de ventes pendant un live).

**Dépendances :** Commerce (produits), Growth (un live est un événement marketing).

**Décision à trancher au PRD :** domaine autonome ou capacité du domaine Growth ?

---

## 3. Communication & Notifications — *Existant*

**Objectif :** faire parvenir la bonne information à la bonne personne sur le bon canal : temps réel (Socket.IO), Web Push, Expo Push (natif, ajouté en Phase 2a), WhatsApp (API Nextéranga).

**Entités :** `Notification` (persistée, avec type et statut lu/envoyé), `PushSubscription` (multi-canal `webpush|expo`).

**Événements consommés :** presque tous — `OrderCreated`, `OrderPaid`, `StockLow`, `CreditsUpdated`, `AppUpdate`…

**Événements émis :** `NotificationDelivered`, `NotificationFailed`, `PushTokenExpired` (purge automatique déjà implémentée côté Expo).

**Dépendances :** aucune vers les domaines métier (il est en aval). C'est la couche « Services » de la vision.

**État réel du fan-out actuel :** temps réel d'abord ; si vendeur hors ligne → Web Push + Expo Push ; si échec → queue de retry BullMQ. Cette cascade est aujourd'hui codée en dur dans `notificationService` — c'est exactement le genre de logique qui doit migrer vers l'Automation Engine.

---

## 4. Monétisation (Crédits) — *Existant — absent de la vision, à réintégrer*

**Objectif :** le modèle économique de la plateforme. Les vendeurs consomment des crédits par action (`ADD_PRODUCT`, `PROCESS_ORDER`, `PIN_PRODUCT`…), achetables par packs (BASIC → UNLIMITED) via Wave/Orange Money.

**Entités :** `CreditTransaction`, solde sur `Seller.credit_balance`, configuration des packs en base (`AdminSetting`).

**Événements émis :** `CreditsConsumed`, `CreditsPurchased`, `CreditsLow`, `PaymentFailed`, `BonusCreditsGranted`.

**Événements consommés :** `OrderCreated`, `ProductCreated`… (chaque action facturable).

**Dépendances :** intégrations de paiement (Wave/OM — **encore en simulation dans le code**, TODO explicites dans `paymentIntegrationService`).

**Enjeu pour la vision :** c'est ici que se joue la tarification de « l'employé numérique ». Chaque action IA aura un coût réel (tokens) — le système de crédits existant est l'endroit naturel pour le refacturer. Ce domaine est stratégique, pas annexe.

---

## 5. Logistics — *Partiel*

**Ce qui existe :** adresse de livraison sur la commande, fiche/ticket de livraison générés (routes publiques `delivery-info`, `delivery-ticket`), message WhatsApp formaté pour le livreur.

**Ce qui manque (tout le reste) :** entité `Courier` (livreur), affectation commande ↔ livreur, statuts de course (`DeliveryStarted`, `DeliveryCompleted`, `DeliveryFailed`), suivi client, zones/tarifs de livraison.

**Événements émis (cible) :** `DeliveryAssigned`, `DeliveryStarted`, `DeliveryCompleted`, `DeliveryFailed`.

**Événements consommés :** `OrderPaid` (ou `OrderAccepted` quand ce statut existera).

**Dépendances :** Commerce (commandes), Communication (notifier livreur/client).

---

## 6. Plateforme & Admin — *Existant*

**Objectif :** exploitation de la plateforme elle-même : superadmin, activation/désactivation de vendeurs, configuration des packs de crédits, statistiques globales.

**Entités :** `AdminSetting`, rôle `superadmin` sur `Seller`.

**Événements émis :** `SellerActivated`, `SellerDeactivated`, `PlatformSettingChanged`.

**Dépendances :** transverses (lecture sur tous les domaines).

---

## 7. Automation Engine — *À créer (le chantier central)*

**Objectif :** transformer les enchaînements codés en dur en workflows déclaratifs : *événement → conditions → actions*. C'est la brique qui fait passer LiveLink de « app » à « système d'exploitation ».

**Ce qui existe comme fondation :** BullMQ + Redis (queue de retry des notifications) — l'infrastructure d'exécution asynchrone est déjà en production. Il manque : le bus d'événements, le registre des définitions de workflows, l'exécuteur générique.

**Entités à créer :**
- `Event` — journal des événements émis (type, payload, source, horodatage) : la source de vérité auditable
- `WorkflowDefinition` — règle d'une boutique : déclencheur + conditions + suite d'actions. Deux types de déclencheur : un **événement** (mode réaction) ou une **demande directe du commerçant** (mode *mission* — « fais une campagne pour les sacs ») ; mêmes policies, même exécuteur, une mission rend toujours compte de son résultat
- `WorkflowRun` — exécution tracée (statut, étapes, erreurs, reprise)
- `ActionDefinition` — catalogue des actions réutilisables, **chacune typée** : `business_logic` | `automation` | `ai` (décision n°4 de la vision — cette classification est structurante et doit être un champ du modèle, pas une convention)

**Événements consommés :** tous (c'est le hub).
**Événements émis :** `WorkflowStarted`, `WorkflowCompleted`, `WorkflowFailed`, `ActionExecuted`.

**Dépendances :** Policy Engine (chaque action passe par lui avant exécution), tous les domaines (comme émetteurs et comme exécutants d'actions).

**Contrainte de migration :** les workflows câblés actuels (ex. cascade de notification) doivent devenir les *premiers workflows système* du moteur — même mécanique pour les règles fournies par la plateforme et celles créées par le vendeur. Un seul chemin d'exécution, pas deux.

---

## 8. Policy Engine — *À créer*

**Objectif :** les garde-fous. Ni workflow, ni IA : la *politique* de la boutique, évaluée avant chaque action.

Trois familles de règles :
1. **Permissions de l'employé numérique** (décision n°5) — ce que l'IA peut faire seule, jamais, ou avec validation humaine (ex. accepter une commande ✔, rembourser ❌)
2. **Règles de gestion** — seuils et horaires (pas de livraison jour-même après 18 h ; validation humaine au-delà de 100 000 FCFA)
3. **Limites plateforme** — plafonds anti-abus, quotas de crédits

**Entités à créer :** `Policy` (portée boutique ou plateforme, condition, effet : `allow` | `deny` | `require_human_approval`), `ApprovalRequest` (file d'attente de validation humaine + notification au vendeur).

**Position dans la chaîne :** `Événement → Workflow → **Policy Engine** → Action`. Aucune action — surtout initiée par l'IA — ne s'exécute sans passer par lui.

**Dépendances :** aucune vers l'amont (il est consulté, il ne consomme pas d'événements métier). Communication pour les demandes d'approbation.

---

## 9. AI Services — *À créer*

**Objectif :** l'employé numérique — uniquement là où il faut comprendre, créer, conseiller ou communiquer. Jamais dans les règles critiques.

**Capacités (chacune = une `ActionDefinition` de type `ai` invocable par les workflows) :**
- *Commerce :* réponse aux questions clients, conseil produit, négociation bornée
- *Marketing :* fiche produit, description, affiche, vidéo promo, publication sociale
- *Assistance :* réponses clients, retours, relances
- *Analyse :* résumés de ventes, tendances, recommandations de promos

**Entités à créer :** `AIConversation` (historique par client/boutique), `AITask` (génération tracée : prompt, résultat, coût en tokens, statut de validation), `AIProfile` (ton, langue — français/wolof —, limites de négociation par boutique).

**Événements consommés :** `CustomerQuestionReceived`, `ProductCreated` (génération de contenu), `WorkflowRequestedAI`.
**Événements émis :** `AIResponseDrafted`, `AIContentGenerated`, `AIEscalatedToHuman`.

**Dépendances fortes :** Policy Engine (obligatoire — jamais d'action IA directe), Monétisation (chaque tâche IA consomme des crédits), Automation Engine (l'IA est *invoquée par* les workflows, elle ne s'auto-déclenche pas).

---

## 10. Marketplace — *À créer*

**Objectif :** la découverte cross-boutique qui émerge de l'accumulation des boutiques — sans jamais remplacer le lien direct du vendeur.

**Constat code :** `public.js` est strictement mono-boutique (tout passe par `/:linkId/…`). Il n'existe ni recherche globale, ni catégories partagées, ni page d'accueil marketplace. Les catégories produits sont des chaînes libres par vendeur — **une taxonomie commune est un prérequis**.

**Entités à créer :** `Category` (taxonomie plateforme), index de recherche global, `CustomerAccount` (aujourd'hui le client n'est pas une entité — juste nom/téléphone sur la commande ; la marketplace, les recommandations et le statut VIP du Policy Engine exigent un client identifiable), `Recommendation`.

**Événements consommés :** `ProductCreated/Updated`, `OrderCreated` (signaux de reco).
**Événements émis :** `CustomerAccountCreated`, `ProductViewedInMarketplace`.

**Dépendances :** Commerce (catalogue), Growth (le funnel « 1ʳᵉ commande → installer l'app » du parcours client cible).

---

## 11. Growth & Marketing — *Partiel*

**Ce qui existe :** `og.js` (aperçus riches des liens partagés sur les réseaux — c'est déjà l'ADN viral du produit), stats de commandes par vendeur.

**Ce qui manque :** campagnes, planification de publications, analytics consolidées, relances clients, funnel d'installation de l'app.

**Événements consommés :** `AIContentGenerated` (publier le contenu créé), `StockLow` (campagne « derniers exemplaaires »), `OrderDelivered` (demande d'avis, relance).
**Événements émis :** `CampaignPublished`, `PostScheduled`.

**Dépendances :** AI Services (production de contenu), Automation Engine (déclenchement), Communication (envoi).

---

## 12. Formation & Mémoire — *À créer (ajouté le 21/07 — cycle de vie des employés)*

**Objectif :** ce qui rend chaque employé numérique unique — la mémoire de la boutique et son alimentation. Voir [le cycle de vie des employés](../produit/cycle-de-vie-employes.md), phases 3 et 4.

**Trois catégories de mémoire, jamais mélangées :** la **connaissance métier** (fait de la boutique, partagée entre employés — ce domaine), la **préférence** (manière de faire propre à un employé — profil d'employé, pas la base de connaissances), la **compétence** (savoir-faire de la plateforme — catalogue d'actions `ai`, hors de ce domaine).

**Entités à créer :**
- `Knowledge` — une connaissance métier : contenu, source (document, note vocale, correction du commerçant), date, statut `proposée | confirmée | active | contestée`
- `EmployeePreference` — les préférences d'un employé (ton, langue, style) — issues de l'entretien d'embauche
- `TrainingSession` — un dépôt de formation (fichiers ingérés, informations extraites, questions de confirmation posées)
- `TrustScore` — le taux de validation par employé **et par type d'action** (alimente les promotions d'état d'autonomie : Assistant → Autonome → Expert)

**Événements consommés :** `TrainingMaterialUploaded`, `KnowledgeConfirmed`, `ProposalValidated`/`ProposalRejected` (signaux de confiance), corrections du commerçant.
**Événements émis :** `KnowledgeLearned`, `KnowledgeConflictDetected`, `TrustLevelPromotionProposed`, `TrustLevelDemoted`.

**Dépendances :** AI Services (extraction depuis PDF/images/audio — dont wolof), Policy Engine (les niveaux de confiance sont des policies dynamiques recalculées depuis `TrustScore` ; le Policy Engine reste l'unique point de décision).

**Frontières :** la mémoire appartient à la **boutique** (partagée entre ses employés), jamais partagée entre boutiques. La collaboration inter-employés ne passe **pas** par ce domaine : elle passe par le bus d'événements + la lecture de cette mémoire commune — aucun mécanisme dédié.

---

## Taxonomie d'événements v1 (liste fermée de départ)

Consolidation : la liste proposée dans la vision **+** les événements imposés par l'existant (crédits, lives, OTP) :

**Commerce :** `OrderCreated`, `OrderAccepted`*, `OrderRejected`*, `OrderPaid`, `OrderCancelled`, `RefundRequested`*, `ProductCreated`, `ProductUpdated`, `ProductDeleted`, `StockLow`, `StockOut`, `CommentAdded`, `CustomerQuestionReceived`*, `SellerRegistered`
**Logistics :** `DeliveryAssigned`*, `DeliveryStarted`*, `DeliveryCompleted`*, `DeliveryFailed`*
**Monétisation :** `CreditsConsumed`, `CreditsPurchased`, `CreditsLow`, `PaymentFailed`
**Live :** `LiveScheduled`, `LiveStarted`, `LiveEnded`
**IA :** `AIResponseDrafted`*, `AIContentGenerated`*, `AIEscalatedToHuman`*
**Formation & confiance :** `TrainingMaterialUploaded`*, `KnowledgeLearned`*, `KnowledgeConflictDetected`*, `TrustLevelPromotionProposed`*, `TrustLevelDemoted`*
**Temporels (planificateur) :** `WeeklySummaryDue`*, `OrderUnpaidReminderDue`*, `DeliveryStalledReminderDue`*
**Missions :** `MissionCreated`*, `MissionCompleted`*, `MissionFailed`*
**Système :** `WorkflowCompleted`, `WorkflowFailed`, `ApprovalRequested`*, `ApprovalGranted`*

\* = suppose des capacités qui n'existent pas encore (statuts de commande étendus, entité livreur, IA, approbations, formation, événements temporels).

---

## Ordre de construction recommandé

Chaque étape livre de la valeur seule et prépare la suivante :

1. **Vocabulaire métier + taxonomie d'événements** (décisions n°1 et n°2) — document, zéro code
2. **Journal d'événements** — les domaines existants émettent dans `Event` *sans rien changer aux comportements* (double écriture : le code actuel continue de fonctionner à l'identique)
3. **Automation Engine** — exécute d'abord les workflows système existants (cascade de notifications), preuve que le moteur tient la production
4. **Policy Engine** — d'abord sur les règles de gestion simples (seuils, horaires), avant toute IA
5. **Cycle de vie commande étendu + Logistics** — débloque les événements marqués *
6. **AI Services** — arrivent en dernier, sur des rails déjà sûrs (workflows + policies + crédits)
7. **Marketplace & Growth** — en parallèle progressif, quand la densité de boutiques le justifie

Ce séquencement inverse la tentation naturelle (commencer par l'IA, qui est la partie visible) : ici l'IA arrive quand les garde-fous existent — exactement l'esprit de la vision.
