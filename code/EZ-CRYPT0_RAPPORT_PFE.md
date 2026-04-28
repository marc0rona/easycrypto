# Rapport de Projet de Fin d'Etudes

## Developpement d'une application web et d'une extension Chrome de gestion securisee d'adresses crypto

### EZ-CRYPT0

---

## Remerciements

Nous tenons a exprimer notre sincere gratitude a toutes les personnes qui ont contribue, de pres ou de loin, a la realisation de ce projet de fin d'etudes intitule **EZ-CRYPT0**. Nous remercions particulierement notre encadrant pour son accompagnement, sa disponibilite et la pertinence de ses conseils tout au long de cette experience. Nos remerciements s'adressent egalement a l'ensemble de l'equipe pedagogique, a nos proches et a toutes les personnes ayant partage leurs remarques et leurs retours, qui ont permis d'ameliorer la qualite fonctionnelle et technique de la solution developpee.

---

## Resume

EZ-CRYPT0 est une application web full-stack accompagnee d'une extension Chrome dont l'objectif est de permettre aux utilisateurs de stocker, organiser et reutiliser leurs adresses crypto de maniere securisee. Le projet repond a un besoin concret: centraliser des adresses souvent dispersees entre notes, messageries, captures d'ecran et historiques de navigation, tout en limitant les risques d'erreur, de doublon et de mauvaise reutilisation. La plateforme propose une authentification securisee basee sur des cookies `httpOnly`, un espace personnel de gestion des adresses, un systeme de labels, la prise en charge de plusieurs reseaux crypto, des fonctions de recherche et de filtrage, ainsi qu'un tableau de bord offrant une lecture synthetique des donnees enregistrees.

En complement de l'interface web, l'extension Chrome EZ-CRYPT0 detecte les adresses visibles sur les pages web, assiste l'utilisateur lors de la sauvegarde manuelle et facilite la reutilisation des donnees depuis le navigateur. L'application repose sur une architecture moderne fondee sur React, TypeScript, Vite et Tailwind CSS pour le frontend, Node.js et Express pour le backend, Prisma comme ORM et PostgreSQL pour la persistance des donnees. L'ensemble a ete concu avec une attention particuliere portee a la separation des roles utilisateur et administrateur, a la validation des donnees, a la prevention des doublons et a la securisation des routes.

Ce projet vise ainsi a proposer une solution coherente, ergonomique et evolutive pour la gestion securisee d'adresses crypto, sans stockage de cles privees, sans interaction blockchain directe et avec une experience unifiee entre l'application web et l'extension Chrome.

**Mots-cles :** gestion d'adresses crypto, application web securisee, extension Chrome, React, Express, Prisma, PostgreSQL, authentification, multi-reseaux, cybersecurite.

---

## Table des matieres

- Remerciements
- Resume
- Table des matieres
- Liste des figures
- Liste des abreviations
- 1. Introduction
- 1.1 Contexte general
- 1.2 Processus de developpement
- 1.3 Objectifs du projet
- 1.4 Choix techniques
- 1.4.1 Backend
- 1.4.2 Frontend
- 1.4.3 Base de donnees
- 1.5 Organisation du rapport
- Resume du chapitre
- 2. Conception et architecture fonctionnelle
- 2.1 Analyse des besoins et specifications
- 2.1.1 Objectifs de l'analyse
- 2.1.2 Acteurs et roles
- 2.1.3 Cas d'usage principaux
- 2.1.4 Processus detailles
- 2.1.5 Exigences fonctionnelles
- 2.1.6 Exigences non-fonctionnelles
- 2.1.7 Personas et scenarios d'usage
- 2.2 Conception et architecture fonctionnelle
- 2.2.1 Architecture generale
- 2.2.2 Modelisation des Donnees : MCD et MLD
- 2.2.3 Architecture de l'application
- 2.2.4 Vue visiteur publique
- 2.3 Outils de Modelisation Utilises
- Resume du chapitre
- 3. Processus fonctionnel de l'application
- 3.1 Interfaces communes aux administrateurs et utilisateurs
- 3.1.1 Page d'accueil (Landing Page)
- 3.1.2 Page d'inscription (Register)
- 3.1.3 Page de connexion (Login)
- 3.2 Parcours de l'administrateur
- 3.2.1 Tableau de bord administrateur
- 3.2.2 Gestion des administrateurs
- 3.2.3 Gestion des utilisateurs
- 3.2.4 Ajout d'un administrateur
- 3.2.5 Mise a jour d'un compte utilisateur
- 3.2.6 Controle du statut des comptes
- 3.2.7 Recherche, filtrage et pagination
- 3.2.8 Supervision de l'etat de la plateforme
- 3.2.9 Parametres du profil administrateur
- 3.2.10 Gestion du systeme (vue administrateur)
- 3.3 Parcours de l'utilisateur
- 3.3.1 Tableau de bord utilisateur
- 3.3.2 Creation d'une adresse crypto
- 3.3.3 Parametres du profil
- 3.3.4 Gestion des adresses enregistrees
- 3.4 Parcours du visiteur
- 3.4.1 Consultation de la page publique
- 3.4.2 Telechargement et decouverte de l'extension Chrome
- Resume du chapitre
- 4. Conclusion generale et perspectives
- 4.1 Bilan des realisations
- 4.1.1 Fonctions principales
- 4.2 Competences et apprentissages
- 4.3 Perspectives d'evolution
- 4.3.1 Axes techniques
- 4.3.2 Axes fonctionnels
- Mot de la fin
- Webographie

---

## Liste des figures

- Figure 1.1 - Architecture generale du backend EZ-CRYPT0
- Figure 1.2 - Interface d'accueil de l'application web
- Figure 1.3 - Schema relationnel simplifie de la base PostgreSQL
- Figure 2.1 - Diagramme de cas d'usage d'EZ-CRYPT0
- Figure 2.2 - Diagramme de sequence global
- Figure 2.3 - Architecture generale multi-couches du projet
- Figure 2.4 - Modele Conceptuel de Donnees (MCD)
- Figure 2.5 - Modele Logique de Donnees (MLD)
- Figure 2.6 - Architecture detaillee de l'application
- Figure 2.7 - Vue publique de presentation d'EZ-CRYPT0
- Figure 2.8 - Maquette du tableau de bord utilisateur
- Figure 2.9 - Maquette du popup de l'extension Chrome
- Figure 3.1 - Landing page d'EZ-CRYPT0
- Figure 3.2 - Page d'inscription utilisateur
- Figure 3.3 - Page de connexion securisee
- Figure 3.4 - Tableau de bord administrateur
- Figure 3.5 - Interface de gestion des administrateurs
- Figure 3.6 - Interface de gestion des utilisateurs
- Figure 3.7 - Formulaire d'ajout d'un administrateur
- Figure 3.8 - Interface de modification d'un compte utilisateur
- Figure 3.9 - Controle du statut des comptes
- Figure 3.10 - Ecran de supervision de la plateforme
- Figure 3.11 - Page de profil administrateur
- Figure 3.12 - Tableau de bord utilisateur
- Figure 3.13 - Formulaire d'ajout d'une adresse crypto
- Figure 3.14 - Page de gestion du profil utilisateur
- Figure 3.15 - Liste des adresses enregistrees
- Figure 3.16 - Page publique de presentation de la solution
- Figure 3.17 - Interface popup de l'extension Chrome

---

## Liste des abreviations

- **API** : Application Programming Interface
- **CRUD** : Create, Read, Update, Delete
- **JWT** : JSON Web Token
- **MV3** : Manifest Version 3
- **ORM** : Object-Relational Mapping
- **RBAC** : Role-Based Access Control
- **SQL** : Structured Query Language
- **UI** : User Interface
- **UX** : User Experience
- **UUID** : Universally Unique Identifier
- **SPA** : Single Page Application
- **CORS** : Cross-Origin Resource Sharing

---

# 1. Introduction

## 1.1 Contexte general

Dans l'ecosysteme crypto, les utilisateurs manipulent regulierement un grand nombre d'adresses correspondant a des reseaux, plateformes et usages differents. Ces adresses sont souvent conservees de maniere dispersee dans des fichiers texte, des messageries, des captures d'ecran ou des notes personnelles. Cette dispersion augmente le risque d'erreur, de confusion entre reseaux, de duplication et de perte d'information au moment de reutiliser une adresse pour un envoi ou une reception.

Dans ce contexte, le projet **EZ-CRYPT0** a ete concu comme une solution centralisee de gestion d'adresses crypto. L'objectif n'est pas de manipuler des cles privees, ni d'effectuer des transactions blockchain, mais de proposer un environnement fiable permettant de sauvegarder, organiser et retrouver rapidement des adresses publiques. L'application s'adresse aussi bien aux utilisateurs souhaitant structurer leur propre carnet d'adresses crypto qu'aux administrateurs ayant pour mission de superviser les comptes et le bon fonctionnement global de la plateforme.

La presence d'une extension Chrome renforce cette vision en rapprochant l'outil du contexte reel d'utilisation. En effet, une grande partie des adresses crypto est rencontree lors de la navigation web. Proposer un compagnon navigateur permet donc d'ameliorer l'efficacite de la detection, de la verification et de la sauvegarde manuelle.

## 1.2 Processus de developpement

Le developpement d'EZ-CRYPT0 s'est articule autour de trois grandes etapes complementaires :

1. **Analyse des besoins**  
   Cette phase a consiste a identifier les difficultes les plus frequentes liees a la gestion d'adresses crypto: dispersion des donnees, confusion entre reseaux, reutilisation hasardeuse, absence de classement, et besoin de retrouver rapidement une adresse fiable.

2. **Conception fonctionnelle et technique**  
   Les parcours utilisateur ont ete definis de maniere distincte selon les profils. Une architecture separee entre espace public, espace utilisateur et espace administrateur a ete retenue. La conception a egalement integre l'extension Chrome comme point d'entree complementaire a l'application web.

3. **Implementation, integration et validation**  
   La plateforme a ensuite ete developpee selon une architecture en couches, avec validation frontend et backend, gestion securisee des sessions, persistance en base PostgreSQL et tests de fonctionnement sur les parcours critiques: inscription, connexion, gestion des adresses, administration et extension.

## 1.3 Objectifs du projet

Le projet poursuit plusieurs objectifs principaux :

- **Centraliser les adresses crypto** dans une interface unique, claire et securisee.
- **Reduire les erreurs de reutilisation** grace a la classification par type de reseau, par direction d'usage et par label.
- **Accelerer l'acces a l'information** avec des fonctions de recherche, de filtrage et de pagination.
- **Prevenir les doublons** au niveau de l'interface et de la base de donnees.
- **Renforcer la securite** en evitant le stockage de tokens dans `localStorage`, en protegeant les routes et en validant les donnees a plusieurs niveaux.
- **Etendre l'experience au navigateur** via une extension Chrome capable de detecter des adresses visibles et d'assister leur sauvegarde manuelle.
- **Offrir une supervision administrative** permettant de gerer les utilisateurs, les administrateurs et l'etat general du systeme.

## 1.4 Choix techniques

Afin de repondre aux contraintes fonctionnelles et de securite du projet, nous avons choisi une stack moderne, typee et coherente avec une architecture full-stack evolutive.

### 1.4.1 Backend

Le backend d'EZ-CRYPT0 repose sur **Node.js** et **Express**, avec **TypeScript** pour beneficier d'un typage statique robuste et d'une meilleure maintenabilite. La logique metier est concentree dans une couche de services distincte des routes et des controleurs. L'authentification s'appuie sur des **JWT** et des cookies `httpOnly`, tandis que le chiffrement des mots de passe est assure par **bcrypt**. Les validations de donnees sont realisees avec **Zod**, et la protection applicative est renforcee par `helmet`, `cors`, le rate limiting et un gestionnaire centralise des erreurs.

**Figure 1.1 - Architecture generale du backend EZ-CRYPT0**

### 1.4.2 Frontend

Le frontend web est developpe avec **React**, **TypeScript** et **Vite**, ce qui permet d'obtenir une interface fluide, reactive et modulaire. La mise en forme s'appuie sur **Tailwind CSS**, tandis que la navigation est geree via **React Router**. Les appels reseau sont assures par **Axios** avec partage des cookies de session. La gestion des parcours authentifies s'appuie sur le **Context API**. L'extension Chrome, egalement basee sur TypeScript et Manifest V3, comprend un popup React, un service worker en arriere-plan et un content script de detection.

**Figure 1.2 - Interface d'accueil de l'application web**

### 1.4.3 Base de donnees

La persistance des donnees est assuree par **PostgreSQL**, avec **Prisma** comme ORM. Cette combinaison permet de modeliser clairement les entites du domaine, de controler les migrations et d'appliquer des contraintes d'integrite. La base stocke principalement trois entites: `User`, `CryptoAddress` et `AdminLog`. Les identifiants sont bases sur des **UUID**, et une contrainte d'unicite evite l'enregistrement de doublons pour un meme utilisateur et un meme reseau.

**Figure 1.3 - Schema relationnel simplifie de la base PostgreSQL**

## 1.5 Organisation du rapport

Apres cette introduction, le rapport est organise en trois chapitres principaux. Le deuxieme chapitre est consacre a l'analyse des besoins, a la modelisation et a l'architecture fonctionnelle de la solution. Le troisieme chapitre detaille le fonctionnement concret de l'application du point de vue des differents profils d'usage. Enfin, le quatrieme chapitre presente le bilan du travail realise, les competences consolidees et les perspectives d'evolution envisageables pour EZ-CRYPT0.

## Resume du chapitre

Ce premier chapitre a introduit le contexte general d'EZ-CRYPT0, ne d'un besoin de centralisation et de securisation des adresses crypto. Il a presente la demarche de developpement adoptee, les objectifs poursuivis ainsi que les principaux choix techniques effectues au niveau du backend, du frontend et de la base de donnees. Il pose ainsi les bases du reste du rapport en situant clairement les enjeux fonctionnels et technologiques du projet.

---

# 2. Conception et architecture fonctionnelle

## 2.1 Analyse des besoins et specifications

### 2.1.1 Objectifs de l'analyse

L'analyse des besoins vise a definir precisement les attentes auxquelles EZ-CRYPT0 doit repondre. Elle permet d'identifier les profils utilisateurs, de formaliser les cas d'usage essentiels, de preciser les contraintes de securite et de performance, puis de traduire ces besoins en exigences exploitables lors de la conception et du developpement.

Dans le cas d'EZ-CRYPT0, l'analyse a cherche a repondre a plusieurs questions fondamentales: comment enregistrer une adresse crypto de facon fiable, comment l'organiser pour la retrouver rapidement, comment eviter les erreurs de duplication ou de confusion entre reseaux, et comment etendre ces usages a la navigation web via une extension Chrome.

### 2.1.2 Acteurs et roles

L'application met en jeu trois categories d'acteurs principales :

- **Utilisateur**  
  Il cree un compte, se connecte, ajoute des adresses crypto, les modifie, les supprime, les classe par label et les retrouve grace aux fonctions de recherche et de filtrage. Il utilise egalement l'extension Chrome pour enregistrer manuellement des adresses detectees au cours de la navigation.

- **Administrateur**  
  Il supervise la plateforme, gere les comptes utilisateurs et administrateurs, met a jour les informations de compte, applique des statuts d'activation ou de desactivation et controle l'etat general du systeme.

- **Visiteur**  
  Il accede sans authentification a la page publique de presentation d'EZ-CRYPT0, decouvre les fonctionnalites de la solution et peut telecharger l'extension Chrome ou se rediriger vers les parcours d'inscription et de connexion.

### 2.1.3 Cas d'usage principaux

Les cas d'usage majeurs d'EZ-CRYPT0 peuvent etre resumes comme suit :

- **Inscription / Connexion**  
  Un utilisateur cree un compte puis accede a son espace personnel via une authentification securisee.

- **CU1 - Ajouter une adresse crypto**  
  L'utilisateur saisit ou colle une adresse, choisit un label et une direction d'usage, puis valide l'enregistrement.

- **CU2 - Modifier ou supprimer une adresse**  
  L'utilisateur met a jour une adresse existante, corrige son libelle ou la retire de sa liste si elle n'est plus pertinente.

- **CU3 - Rechercher et filtrer les adresses**  
  L'utilisateur consulte sa liste personnelle et applique des filtres par type de reseau, direction ou mot-cle.

- **CU4 - Sauvegarder depuis l'extension Chrome**  
  L'extension detecte une adresse visible sur une page web. L'utilisateur choisit ensuite manuellement de la sauvegarder dans son espace.

- **CU5 - Administrer la plateforme**  
  L'administrateur consulte les comptes, cree d'autres administrateurs, modifie les informations de profil et change le statut des utilisateurs.

**Figure 2.1 - Diagramme de cas d'usage d'EZ-CRYPT0**

### 2.1.4 Processus detailles

Le processus global du systeme suit une logique simple mais rigoureuse. Lorsqu'un utilisateur s'authentifie, une session securisee est etablie a l'aide de cookies `httpOnly` et d'un token d'acces. Les routes protegees deviennent alors accessibles selon le role du compte. Toute action de creation ou de modification d'adresse passe d'abord par des validations frontend, puis par une seconde validation cote backend avant d'etre transmise a la couche de services et a la base de donnees.

Dans le cas de l'extension Chrome, le content script detecte des motifs d'adresses visibles dans la page. Ces informations sont transmises au service worker, puis proposees dans le popup. L'utilisateur reste maitre de la decision finale de sauvegarde, ce qui garantit un enregistrement volontaire et coherent avec le contexte de navigation.

**Figure 2.2 - Diagramme de sequence global**

### 2.1.5 Exigences fonctionnelles

Les exigences fonctionnelles d'EZ-CRYPT0 s'organisent autour de quatre blocs principaux :

- **Authentification**
  - inscription et connexion securisees ;
  - recuperation de la session courante ;
  - modification du profil et du mot de passe ;
  - separation stricte entre espace utilisateur et espace administrateur.

- **Gestion des adresses crypto**
  - ajout, modification et suppression d'adresses ;
  - prise en charge de plusieurs reseaux: BTC, ETH, SOL, LTC, DOGE, XRP, ADA, TON, DOT, TRX et ATOM ;
  - association optionnelle d'un label ;
  - distinction entre adresses de reception et d'envoi ;
  - prevention des doublons pour un meme utilisateur et un meme reseau ;
  - recherche, filtres et pagination dans la liste des adresses.

- **Extension Chrome**
  - detection d'adresses visibles sur les pages web ;
  - sauvegarde manuelle uniquement ;
  - consultation rapide des adresses enregistrees ;
  - assistance lors de la saisie ou du collage d'une adresse ;
  - synchronisation avec l'API authentifiee de l'application.

- **Administration**
  - consultation des comptes ;
  - creation d'administrateurs ;
  - mise a jour d'un compte utilisateur ;
  - activation ou desactivation des comptes ;
  - suivi de l'etat general de la plateforme.

### 2.1.6 Exigences non-fonctionnelles

Les exigences non-fonctionnelles sont les suivantes :

- **Performance**
  - affichage fluide des interfaces ;
  - temps de reponse cible inferieur a deux secondes pour les actions courantes ;
  - pagination des listes pour limiter le volume de donnees chargees en une seule fois.

- **Securite**
  - aucun stockage de token dans `localStorage` ;
  - mots de passe haches avec bcrypt ;
  - validation des donnees cote frontend et backend ;
  - routes protegees selon le role ;
  - cookies `httpOnly` pour la session ;
  - aucune cle privee stockee dans le systeme ;
  - isolation stricte des adresses par utilisateur.

- **Accessibilite et ergonomie**
  - interface responsive sur le web ;
  - navigation claire entre les espaces public, utilisateur et administrateur ;
  - extension reservee a Google Chrome dans le cadre de Manifest V3.

- **Maintenabilite**
  - architecture en couches ;
  - typage TypeScript ;
  - code structure en modules ;
  - schema de donnees centralise avec Prisma ;
  - gestion centralisee des erreurs.

### 2.1.7 Personas et scenarios d'usage

Pour mieux cerner les usages, plusieurs personas ont ete definis :

- **Yassine, utilisateur regulier de portefeuilles crypto**  
  Besoin : conserver ses adresses de depot et de retrait dans un outil fiable.  
  Contrainte : utilise plusieurs reseaux et plusieurs plateformes d'echange.  
  Scenario : il se connecte a EZ-CRYPT0, ajoute ses adresses BTC et ETH, leur associe des labels explicites, puis les retrouve plus tard via un filtre par reseau.

- **Salma, utilisatrice attentive a la securite**  
  Besoin : eviter les erreurs de copie et les reutilisations hasardeuses d'adresses.  
  Contrainte : prefere des outils simples et lisibles.  
  Scenario : en preparant un envoi, elle recherche une adresse deja sauvegardee, verifie le reseau associe et la copie directement depuis le tableau de bord.

- **Imad, administrateur de la plateforme**  
  Besoin : garder le controle sur les comptes et l'acces au systeme.  
  Contrainte : doit gerer rapidement les activations et les comptes sensibles.  
  Scenario : depuis l'espace administrateur, il consulte la liste des utilisateurs, filtre les comptes inactifs, met a jour un profil et desactive un compte necessitant une suspension temporaire.

## 2.2 Conception et architecture fonctionnelle

### 2.2.1 Architecture generale

EZ-CRYPT0 suit une architecture full-stack structuree en couches. Le client web React et l'extension Chrome communiquent avec une API REST versionnee sous `/api/v1/`. Cette API, construite avec Express, applique les validations, authentifie les requetes, delegue la logique metier a des services dedies puis persiste les donnees via Prisma dans PostgreSQL.

Cette organisation assure une bonne separation des responsabilites :

- les routes gerent le routage des requetes ;
- les controleurs orchestrent la reponse HTTP ;
- les services contiennent la logique metier ;
- Prisma assure l'acces structure aux donnees ;
- PostgreSQL garantit la persistance et l'integrite.

**Figure 2.3 - Architecture generale multi-couches du projet**

### 2.2.2 Modelisation des Donnees : MCD et MLD

La modelisation des donnees d'EZ-CRYPT0 repose principalement sur trois entites :

- **User**
  - `id`
  - `email`
  - `name`
  - `username`
  - `password`
  - `role`
  - `status`
  - `createdAt`
  - `updatedAt`

- **CryptoAddress**
  - `id`
  - `address`
  - `label`
  - `type`
  - `direction`
  - `userId`
  - `createdAt`
  - `updatedAt`

- **AdminLog**
  - `id`
  - `adminId`
  - `action`
  - `createdAt`

La relation principale du modele relie un utilisateur a plusieurs adresses crypto. Chaque adresse appartient a un seul utilisateur. Une contrainte d'unicite sur le triplet `(userId, address, type)` permet d'eviter l'enregistrement en double d'une meme adresse sur un meme reseau pour un meme compte.

**Figure 2.4 - Modele Conceptuel de Donnees (MCD)**  
**Figure 2.5 - Modele Logique de Donnees (MLD)**

### 2.2.3 Architecture de l'application

L'architecture detaillee d'EZ-CRYPT0 s'articule autour des composants suivants :

- **Module d'authentification**
  - inscription, connexion, deconnexion et rafraichissement de session ;
  - cookies de session `httpOnly` ;
  - protection des routes utilisateur et administrateur.

- **Module de gestion des adresses**
  - creation, mise a jour et suppression ;
  - validation par type de reseau ;
  - detection des doublons ;
  - recherche, filtrage et pagination ;
  - statistiques de synthese dans le tableau de bord.

- **Module extension Chrome**
  - content script de detection ;
  - service worker pour les appels API ;
  - popup React pour la sauvegarde manuelle et la consultation rapide ;
  - stockage de session dans `chrome.storage.session`.

- **Module d'administration**
  - gestion des utilisateurs et des administrateurs ;
  - controle du statut des comptes ;
  - supervision du systeme ;
  - separation stricte des droits.

- **Module de presentation publique**
  - landing page de presentation ;
  - redirection vers inscription, connexion et telechargement de l'extension.

**Figure 2.6 - Architecture detaillee de l'application**

### 2.2.4 Vue visiteur publique

La vue publique d'EZ-CRYPT0 correspond a la page d'accueil accessible sans authentification. Elle expose clairement la proposition de valeur du produit, met en avant l'extension Chrome et oriente le visiteur vers les parcours d'inscription, de connexion ou de telechargement. Cette vue joue un role important dans l'onboarding, car elle constitue le premier point de contact entre l'utilisateur et la solution.

**Figure 2.7 - Vue publique de presentation d'EZ-CRYPT0**

## 2.3 Outils de Modelisation Utilises

La conception du projet s'appuie sur plusieurs outils de modelisation et de visualisation :

- **draw.io / diagrams.net** pour les schemas d'architecture, de sequences et de structure globale ;
- **Figma** pour les maquettes d'interface web et popup ;
- **Prisma Schema** comme support de modelisation logique directement exploitable dans le projet ;
- **Markdown** pour la documentation technique et la structuration du suivi de conception.

**Figure 2.8 - Maquette du tableau de bord utilisateur**  
**Figure 2.9 - Maquette du popup de l'extension Chrome**

## Resume du chapitre

Ce deuxieme chapitre a presente l'analyse des besoins et les choix de conception retenus pour EZ-CRYPT0. Il a permis d'identifier les acteurs, de formaliser les principaux cas d'usage et de definir les exigences fonctionnelles et non-fonctionnelles du systeme. Il a ensuite detaille l'architecture generale du projet, la modelisation des donnees et l'organisation applicative reliant l'interface web, l'extension Chrome, l'API Express et la base PostgreSQL. L'ensemble montre une solution coherente, modulaire et orientee securite.

---

# 3. Processus fonctionnel de l'application

## 3.1 Interfaces communes aux administrateurs et utilisateurs

### 3.1.1 Page d'accueil (Landing Page)

**Figure 3.1 - Landing page d'EZ-CRYPT0**

La page d'accueil constitue le point d'entree public de la plateforme. Elle presente le positionnement d'EZ-CRYPT0, les benefices lies a la centralisation des adresses crypto et les principales fonctionnalites disponibles. Cette interface met egalement en avant l'extension Chrome et propose des liens directs vers l'inscription, la connexion ou le telechargement de l'extension.

### 3.1.2 Page d'inscription (Register)

**Figure 3.2 - Page d'inscription utilisateur**

La page d'inscription permet a un nouvel utilisateur de creer un compte personnel sur la plateforme. Le formulaire collecte les informations essentielles telles que l'adresse e-mail, le nom d'utilisateur et le mot de passe. Les donnees sont verifiees avant transmission au backend afin de garantir la validite du format saisi et de limiter les erreurs. Dans EZ-CRYPT0, les comptes administrateurs suivent un circuit controle et sont crees depuis l'espace d'administration.

### 3.1.3 Page de connexion (Login)

**Figure 3.3 - Page de connexion securisee**

La page de connexion donne acces aux espaces securises de l'application. Une fois les identifiants verifies, l'utilisateur est redirige vers son tableau de bord personnel, tandis que l'administrateur accede a son espace de supervision. La session repose sur des cookies securises et sur une logique de routes protegees adaptee au role du compte.

## 3.2 Parcours de l'administrateur

### 3.2.1 Tableau de bord administrateur

**Figure 3.4 - Tableau de bord administrateur**

Le tableau de bord administrateur constitue le centre de pilotage du systeme. Il donne une vue d'ensemble sur les comptes presents sur la plateforme, leur statut, leur role ainsi que les principales operations de gestion disponibles. L'administrateur y retrouve aussi les points d'entree vers la creation de comptes privilegies, la mise a jour d'utilisateurs et la supervision generale.

### 3.2.2 Gestion des administrateurs

**Figure 3.5 - Interface de gestion des administrateurs**

Cette interface permet de distinguer les comptes disposant de privileges administratifs du reste des utilisateurs. Elle facilite l'identification des personnes autorisees a administrer la plateforme et contribue a la maitrise des droits sensibles. L'objectif est de maintenir une gouvernance claire et un controle strict sur les acces eleves.

### 3.2.3 Gestion des utilisateurs

**Figure 3.6 - Interface de gestion des utilisateurs**

L'administrateur peut consulter la liste des utilisateurs inscrits, avec leurs informations essentielles: nom, nom d'utilisateur, e-mail, role, date de creation et statut. Cette interface constitue le coeur de l'administration fonctionnelle, car elle regroupe l'ensemble des comptes qui doivent etre suivis, filtres et eventuellement modifies.

### 3.2.4 Ajout d'un administrateur

**Figure 3.7 - Formulaire d'ajout d'un administrateur**

L'ajout d'un administrateur s'effectue via un formulaire dedie depuis l'espace de gestion. L'administrateur principal saisit le nom, le nom d'utilisateur, l'adresse e-mail et le mot de passe initial du nouveau compte. Cette operation permet d'etendre la supervision de la plateforme tout en conservant une creation controlee des privileges eleves.

### 3.2.5 Mise a jour d'un compte utilisateur

**Figure 3.8 - Interface de modification d'un compte utilisateur**

Cette fonctionnalite permet de corriger ou mettre a jour les informations d'un utilisateur existant, par exemple son nom, son e-mail ou son nom d'utilisateur. Elle est utile pour maintenir la qualite des donnees et accompagner les evolutions du cycle de vie des comptes sans toucher aux adresses privees ou aux donnees sensibles hors perimetre.

### 3.2.6 Controle du statut des comptes

**Figure 3.9 - Controle du statut des comptes**

L'administrateur peut changer le statut d'un compte afin de l'activer ou de le desactiver. Ce mecanisme permet de suspendre temporairement un acces sans supprimer les donnees rattachees au compte. Il s'agit d'une mesure importante de gouvernance et de securite, notamment lorsqu'un compte ne doit plus pouvoir se connecter mais doit rester historise dans le systeme.

### 3.2.7 Recherche, filtrage et pagination

L'interface d'administration integre des fonctions de recherche par nom d'utilisateur ou adresse e-mail, ainsi que des filtres par role et par statut. La pagination permet de conserver une lisibilite constante meme lorsque le nombre de comptes augmente. Cette organisation favorise une navigation efficace et une supervision progressive des utilisateurs.

### 3.2.8 Supervision de l'etat de la plateforme

**Figure 3.10 - Ecran de supervision de la plateforme**

L'administrateur dispose d'une vue de supervision orientee etat systeme. Celle-ci permet de suivre la disponibilite generale de l'API, de la base de donnees et des mecanismes de synchronisation avec l'extension. Meme lorsque cette supervision reste simple dans la version actuelle, elle structure deja le futur pilotage technique de la plateforme.

### 3.2.9 Parametres du profil administrateur

**Figure 3.11 - Page de profil administrateur**

Le profil administrateur permet a l'utilisateur privilegie de mettre a jour son nom, son adresse e-mail et son mot de passe. Cette page garantit que les informations de compte restent exactes et que les bonnes pratiques de securite sont appliquees dans la duree.

### 3.2.10 Gestion du systeme (vue administrateur)

L'ensemble des ecrans precedents constitue une vue administrateur complete de gestion du systeme. Cette vue est caracterisee par une separation stricte entre les fonctionnalites de pilotage et l'espace utilisateur classique. L'administrateur gere les comptes et l'etat de la plateforme, sans intervenir sur les adresses privees des utilisateurs au-dela du perimetre autorise.

## 3.3 Parcours de l'utilisateur

### 3.3.1 Tableau de bord utilisateur

**Figure 3.12 - Tableau de bord utilisateur**

Apres connexion, l'utilisateur accede a un tableau de bord qui synthetise ses donnees personnelles. Celui-ci met en avant le nombre total d'adresses enregistrees, leur repartition par reseau, leur direction d'usage et certaines informations de contexte. L'utilisateur dispose egalement de raccourcis pour ajouter une nouvelle adresse, filtrer sa collection ou consulter son profil.

### 3.3.2 Creation d'une adresse crypto

**Figure 3.13 - Formulaire d'ajout d'une adresse crypto**

L'ajout d'une adresse est une fonctionnalite centrale d'EZ-CRYPT0. L'utilisateur saisit ou colle l'adresse, choisit un label, precise la direction d'usage et laisse le systeme verifier la compatibilite avec le reseau detecte. La validation intervient a deux niveaux, ce qui renforce la fiabilite du processus. En cas de tentative de doublon, l'utilisateur est averti avant l'enregistrement.

### 3.3.3 Parametres du profil

**Figure 3.14 - Page de gestion du profil utilisateur**

Depuis sa page de profil, l'utilisateur peut modifier son nom, son adresse e-mail et son mot de passe. Cette page contribue a la maintenance du compte tout en conservant un parcours simple. Elle complete le tableau de bord en offrant un espace dedie a la gestion des informations personnelles.

### 3.3.4 Gestion des adresses enregistrees

**Figure 3.15 - Liste des adresses enregistrees**

La page de gestion des adresses affiche l'ensemble des adresses rattachees au compte connecte. L'utilisateur peut y rechercher une adresse par mot-cle, la filtrer par reseau ou par direction, la modifier, la supprimer ou la copier rapidement. La pagination evite le chargement massif de donnees et preserve la lisibilite de l'interface. Cette page incarne la vocation principale d'EZ-CRYPT0: offrir un carnet d'adresses crypto fiable, accessible et structure.

## 3.4 Parcours du visiteur

### 3.4.1 Consultation de la page publique

**Figure 3.16 - Page publique de presentation de la solution**

Le visiteur non connecte peut consulter la page publique d'EZ-CRYPT0 pour comprendre la finalite du projet et ses principales fonctionnalites. Il y decouvre les usages couverts par la plateforme, les benefices de l'extension Chrome et les points d'entree vers l'inscription ou la connexion. Cette vue publique joue aussi un role de rassurance en mettant en avant les choix de securite et la separation entre web app et extension.

### 3.4.2 Telechargement et decouverte de l'extension Chrome

**Figure 3.17 - Interface popup de l'extension Chrome**

Le visiteur peut telecharger l'extension Chrome depuis la page publique. Une fois installee, celle-ci detecte les adresses visibles sur les pages web, propose une interface de connexion et permet ensuite la sauvegarde manuelle des adresses dans l'espace personnel. Ce parcours prolonge l'experience de l'application principale tout en restant centre sur Google Chrome et Manifest V3.

## Resume du chapitre

Ce troisieme chapitre a detaille le fonctionnement concret d'EZ-CRYPT0 a travers les interfaces partagees, le parcours administrateur, le parcours utilisateur et la decouverte publique du produit. Il a mis en evidence les mecanismes d'authentification, la gestion des adresses crypto, les fonctions d'administration des comptes ainsi que l'apport de l'extension Chrome dans le cadre d'une sauvegarde assistee et manuelle. L'ensemble montre une application centree sur l'organisation, la fiabilite et la securite.

---

# 4. Conclusion generale et perspectives

## 4.1 Bilan des realisations

Le projet EZ-CRYPT0 a permis de mettre en oeuvre une solution complete et coherente de gestion d'adresses crypto. La combinaison d'une application web full-stack et d'une extension Chrome apporte une vraie valeur d'usage, en couvrant a la fois la centralisation des donnees, leur organisation, leur reutilisation et leur collecte dans le contexte du navigateur. La separation entre espace public, espace utilisateur et espace administrateur renforce la lisibilite du systeme et la maitrise des droits.

### 4.1.1 Fonctions principales

Les realisations majeures du projet peuvent etre resumees ainsi :

- mise en place d'une authentification securisee avec cookies `httpOnly` ;
- creation d'un espace utilisateur permettant l'ajout, la modification et la suppression d'adresses crypto ;
- prise en charge de plusieurs reseaux crypto avec validation adaptee ;
- integration d'un systeme de labels et de direction d'usage ;
- prevention des doublons cote frontend et cote base de donnees ;
- mise en place d'un tableau de bord avec statistiques, recherche, filtres et pagination ;
- developpement d'une extension Chrome capable de detecter des adresses visibles et de permettre leur sauvegarde manuelle ;
- creation d'un espace administrateur pour la gestion des comptes, des roles et des statuts ;
- respect de contraintes de securite fortes, notamment l'absence de stockage de tokens dans `localStorage` et l'absence totale de gestion de cles privees.

## 4.2 Competences et apprentissages

Ce projet a constitue un cadre d'apprentissage riche sur les plans technique, methodologique et organisationnel. Il a permis de consolider la maitrise d'une architecture full-stack moderne, d'approfondir l'usage de TypeScript sur plusieurs couches applicatives et de mieux comprendre les exigences de securisation d'un systeme manipulant des donnees sensibles d'un point de vue operationnel.

Il a egalement favorise le developpement de competences transversales :

- conception d'une architecture logicielle en couches ;
- modelisation de donnees avec Prisma et PostgreSQL ;
- implementation d'une API REST securisee ;
- construction d'interfaces React structurees et reutilisables ;
- integration d'une extension Chrome Manifest V3 ;
- prise en compte de l'UX dans la gestion d'informations critiques ;
- rigueur dans la validation, la coherence et la separation des responsabilites.

## 4.3 Perspectives d'evolution

Bien que la version actuelle d'EZ-CRYPT0 couvre les besoins essentiels du projet, plusieurs pistes d'evolution peuvent etre envisagees pour renforcer encore la robustesse et l'utilite de la plateforme.

### 4.3.1 Axes techniques

- enrichir la supervision systeme avec de vraies donnees de monitoring et des indicateurs temps reel ;
- augmenter la couverture de tests unitaires, d'integration et de tests end-to-end ;
- optimiser davantage les performances sur les grands volumes d'adresses ;
- renforcer l'observabilite backend avec une journalisation et un audit plus fins ;
- affiner la synchronisation entre application web et extension pour une continuite de session plus transparente ;
- etendre le catalogue de reseaux supportes tout en conservant une validation stricte.

### 4.3.2 Axes fonctionnels

- ajouter des fonctions d'import et d'export de carnets d'adresses ;
- proposer des regroupements plus avances par dossiers, favoris ou collections ;
- enrichir la recherche avec des suggestions intelligentes de labels ;
- developper un historique plus detaille des actions effectuees depuis l'extension ;
- offrir des tableaux de bord administratifs plus riches pour l'analyse de l'usage global ;
- faciliter l'onboarding utilisateur avec des parcours guides et des aides contextuelles.

---

## Mot de la fin

Au terme de ce projet de fin d'etudes, EZ-CRYPT0 apparait comme une realisation pertinente a la croisee des enjeux de securite, d'ergonomie et d'organisation des donnees. Au-dela de sa dimension technique, ce travail a permis de confronter des choix d'architecture a des besoins concrets, de structurer une demarche de conception complete et de produire une solution credible, moderne et evolutive. Cette experience marque une etape importante dans la consolidation de competences professionnelles applicables a des projets web repondant a de fortes exigences de fiabilite.

---

## Webographie

- Documentation officielle React : https://react.dev/
- Documentation officielle TypeScript : https://www.typescriptlang.org/docs/
- Documentation officielle Vite : https://vite.dev/
- Documentation officielle Tailwind CSS : https://tailwindcss.com/docs/
- Documentation officielle Node.js : https://nodejs.org/en/docs
- Documentation officielle Express : https://expressjs.com/
- Documentation officielle Prisma : https://www.prisma.io/docs
- Documentation officielle PostgreSQL : https://www.postgresql.org/docs/
- Documentation officielle Chrome Extensions : https://developer.chrome.com/docs/extensions/
- Documentation officielle Manifest V3 : https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3
- Documentation officielle Zod : https://zod.dev/
- Documentation officielle Axios : https://axios-http.com/docs/intro
- Documentation officielle JSON Web Token : https://jwt.io/
- Documentation officielle bcrypt : https://github.com/kelektiv/node.bcrypt.js
- Documentation MDN Web Docs : https://developer.mozilla.org/
- Stack Overflow : https://stackoverflow.com/
