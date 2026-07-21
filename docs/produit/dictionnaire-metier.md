# LiveLink — Dictionnaire métier

**Date :** 21 juillet 2026
**Rôle :** vocabulaire commun et unique du produit. Tout document (PRD, catalogues, specs) et tout code utilisent ces termes, avec ce sens exact. Fondation n°1 de la séquence : dictionnaire → employés numériques → catalogue d'événements → catalogue de workflows → catalogue de policies → PRD.

**Règle de langage produit :** le mot « IA » est **banni du vocabulaire produit** (interfaces, marketing, communication commerçant). On dit *employé numérique*, *équipe numérique*. « IA » ne subsiste que comme terme technique interne (type d'action `ai`, domaine AI Services).

---

## Les personnes

| Terme | Définition | Dans le code aujourd'hui |
|---|---|---|
| **Commerçant** (ou Vendeur) | La personne qui possède une boutique sur LiveLink. C'est le client de la plateforme. | Entité `Seller` |
| **Client** | La personne qui achète auprès d'un commerçant. | ⚠️ Pas encore une entité — juste `customer_name`/`customer_phone` sur la commande. Prérequis marketplace, recommandations, statut VIP |
| **Livreur** | La personne qui livre les commandes d'un commerçant. | ⚠️ Pas encore une entité — juste un message WhatsApp formaté |
| **Employé numérique** | Un rôle que le commerçant *embauche* : un assemblage nommé de responsabilités, de workflows, de permissions et de capacités, qui travaille 24h/24 pour sa boutique. Ce n'est **pas** « une IA » : la majorité de son travail est de l'automatisation fiable ; l'intelligence n'intervient que là où il faut comprendre, créer ou conseiller. | À créer |
| **Équipe numérique** | L'ensemble des employés numériques activés par une boutique. | À créer |

## La boutique et le commerce

| Terme | Définition | Dans le code aujourd'hui |
|---|---|---|
| **Boutique** | L'espace de vente d'un commerçant : identité, catalogue, paramètres de paiement, lien public. | Porté par `Seller` (`public_link_id`, `payment_settings`, logo…) |
| **Lien public** | L'URL unique d'une boutique, partagée sur TikTok/Instagram/Facebook/WhatsApp. C'est le canal d'acquisition principal — la marketplace ne le remplace jamais. | `public_link_id`, routes `/api/public/:linkId/…` |
| **Produit** | Un article en vente : nom, description, prix, images, catégorie, stock. | Entité `Product` |
| **Variante** | Une déclinaison d'un produit (taille, couleur…) avec son propre prix et stock. | Entité `ProductVariant` |
| **Stock** | La quantité disponible d'un produit ou d'une variante. Passe par les états *disponible*, *bas* (seuil), *épuisé*. | `stock_quantity` |
| **Commande** | L'engagement d'achat d'un client : produit, quantité, coordonnées, montant, méthode de paiement. | Entité `Order` |
| **Cycle de vie de commande** | Les états successifs d'une commande. Actuel : `pending → paid → delivered`. Cible : ajout de *acceptée*, *refusée*, *annulée*, *remboursement demandé*. | ⚠️ Statuts actuels trop pauvres pour les employés numériques — extension prérequise |
| **Live** | Une session de vente en direct (TikTok/Instagram) adossée à une sélection de produits de la boutique. | Entités `Live`, `LiveProduct` |
| **Commentaire** | Question ou avis laissé par un client sur une boutique. | Entité `Comment` |

## La monnaie interne

| Terme | Définition | Dans le code aujourd'hui |
|---|---|---|
| **Crédit** | La monnaie interne de la plateforme. Les actions facturables (ajouter un produit, traiter une commande, faire travailler un employé numérique) consomment des crédits. | `Seller.credit_balance`, `CreditTransaction`, `creditService` |
| **Pack** | Une offre d'achat de crédits (BASIC → UNLIMITED), payée via Wave ou Orange Money. | Config en base (`AdminSetting`), `paymentIntegrationService` |
| **Salaire** *(langage produit)* | Le coût en crédits du travail d'un employé numérique. Chaque responsabilité activée a un coût connu d'avance. | À créer — s'appuie sur le système de crédits existant |

## Le système nerveux

| Terme | Définition | Dans le code aujourd'hui |
|---|---|---|
| **Événement** | Un fait métier daté et immuable : « une commande a été créée », « le stock est passé sous le seuil ». Les événements sont la seule chose qui déclenche du travail automatique. Liste fermée (catalogue d'événements). | À créer (journal `Event`) — aujourd'hui : appels de fonctions directs |
| **Événement temporel** | Un événement déclenché par le calendrier, pas par une action : « fin de semaine », « commande impayée depuis 24 h ». Nécessaire aux relances et aux rapports. | À créer (planificateur — BullMQ le permet) |
| **Workflow** | La réaction automatique à un événement : une suite ordonnée d'actions, éventuellement conditionnée. Un workflow appartient soit à la plateforme (workflow système), soit à une boutique (règle du commerçant). | À créer — embryon : cascade de notifications codée en dur |
| **Action** | L'unité de travail exécutable d'un workflow. Chaque action est **typée dès sa conception** : voir les trois types ci-dessous. | À créer (catalogue d'actions) |
| **Action `business_logic`** | Action critique aux règles déterministes : réserver du stock, créer une facture, encaisser. Jamais confiée à l'intelligence. | Existe en dur dans les services |
| **Action `automation`** | Action mécanique sans décision : envoyer une notification, générer un ticket de livraison, programmer une relance. | Existe en dur dans les services |
| **Action `ai`** | Action nécessitant de comprendre, créer, conseiller ou communiquer : rédiger une réponse, générer une affiche, résumer les ventes. Toujours soumise aux policies. | À créer |
| **Automatisation** | Terme produit générique pour « ce que la boutique fait toute seule » — recouvre workflows + actions, sans exposer ces mots techniques au commerçant. | — |

## Les garde-fous

| Terme | Définition | Dans le code aujourd'hui |
|---|---|---|
| **Policy** (règle de boutique) | Une règle évaluée **avant** l'exécution de toute action : elle autorise, interdit, ou exige une validation humaine. Ex. : « pas de livraison jour-même après 18 h », « validation humaine au-delà de 100 000 FCFA ». | À créer (Policy Engine) |
| **Permission** | Une policy portant sur ce qu'un employé numérique a le droit de faire seul, jamais, ou avec accord. Définie par le commerçant, avec des valeurs par défaut prudentes. | À créer |
| **Validation humaine** | Le mécanisme par lequel une action en attente est soumise au commerçant (notification + accepter/refuser). Rien d'irréversible ne se fait sans elle quand une policy l'exige. | À créer (`ApprovalRequest`) |
| **Escalade** | Le passage de relais d'un employé numérique vers le commerçant quand il ne sait pas ou n'a pas le droit. Une escalade n'est jamais un échec silencieux : elle notifie. | À créer |

## Les canaux

| Terme | Définition | Dans le code aujourd'hui |
|---|---|---|
| **Canal** | Un moyen de joindre quelqu'un : temps réel (app ouverte), notification push (web ou native), WhatsApp. | Socket.IO, `webPushService`, `expoPushService`, `whatsappNotificationService` |
| **Notification** | Un message persisté adressé au commerçant via la cascade de canaux (temps réel → push → file de relance). | Entité `Notification`, `notificationService` |

---

## Anti-glossaire — mots qu'on n'emploie pas

| Mot proscrit | On dit à la place | Pourquoi |
|---|---|---|
| IA, intelligence artificielle *(produit)* | Employé numérique, équipe numérique | Le produit vend du travail accompli, pas une technologie |
| Bot, chatbot | Employé commercial | Un bot subit, un employé a des responsabilités et des limites |
| Event Bus, Aggregate, Engine *(produit)* | Automatisation, règle de boutique | Vocabulaire d'architecte, pas de commerçant |
| Marketplace *(comme promesse principale)* | « Vos clients découvrent aussi les autres boutiques » | La marketplace est une conséquence, pas le produit |
