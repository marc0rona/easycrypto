# Cahier des charges (SRS léger) — EZ-CRYPT0
**Équipe :** Marco-Andrés Mora, Driss Laaziri

**Date :** 2026-01-22

**Version :** v0.1

---

## 1. Contexte & Objectif
- **Contexte :** Lorsqu'une personne commence a devenir un investisseur dans la crypto, ce n'est pas comme la bourse normal, qui s`ouvre a une certaine heure (9am) et ensuite ferme (4pm) jusqu'à la prochaine journée. C'est des monnaies qui roule et bouge 24 heures chaque journées. De plus, les gens ne vont pas posséder juste 1 ou 2 monnaies à la fois. Afin de diversifier leurs investissements et d’optimiser leurs opportunités de rendement, ils détiennent souvent plusieurs actif. Donc, un investisseur va posséder plusieurs adresses réparties sur différentes platformes et supports de manière très dispersé.

Pour un investisseur moyen, la gestion de cet ensemble d’informations peut représenter une tâche exigeante en temps, alors tout cela entraîne une perte de temps et même des risques d’erreurs et une mauvaise organisation. Nous voulons pouvoir les aider en gérant ces adresses publiques de manière très simple et sécurisée.

- **Objectif principal :** L'objectif de ce projet est de fournir une plateforme simple permettant aux gens de bien organiser leur crypto et retrouver facilement leurs adresses qui sont publiques sans avoir a faire a différentes clés privées ou blockchains.
- **Parties prenantes :**
  + *Utilisateurs* : Investisseurs en crypto (amateurs et experts), personne régulière qui aime investir pour le fun et aussi les addictes aux cryptomonnaies
  + *Administrateurs & développeurs* : responsables de la gestion des comptes et vérification l'état du site
  + *Client / Product Owner* : Prof
---

## 2. Portée (Scope)
### 2.1 Inclus (IN)
- IN-1 : Création du compte
- IN-2 : Validation du username & password de l'utilisateur rentré dans la Base de Données
- IN-3 : Gestion du rôle de l'utilisateur (sois client ou admin)
- IN-4 : Association des adresses à l'utilisateur connecté 
- IN-5 : Affichage de toutes les adresses du porteFeuille de l'utilisateur dans un tableau de bord
- IN-6 : Ajout des CRUD (Create, Update & Delete) pour chaques adresses d'un utilisateur 
- IN-7 : Tableau de bord qui permet la consultation et organisation des adresses. C'est-à-dire, utilisation du CRUD (Update & Delete here)
- IN-8 : L'utilisation de l'extension Google Chrome. Permet l'enregistrement & la détection des adresses crypto depuis des pages webs
- IN-9 : Association des adresses de l'utilisateur entre l'extension Chrome & la plateforme web utilisé par l'utilisateur
- IN-10 : Validation des données côté serveur API (Exemple : format de l'adresses recherché)
- IN-11 : Tableau de bord pour les administrateurs qui va gérer les comptes dans le système (CRUD)

### 2.2 Exclu (OUT)
- OUT-1 : Connection d'un compte qui n'existe pas
- OUT-2 : Faire des transactions avec des cryptos en ligne, incluant l'envoi ou la réception d'une crypto
- OUT-3 : Intégration directe directe avec des blockchains crypto en ligne
- OUT-4 : Voir l'historique et soldes d'un portefeuille d'un utilisateur
- OUT-5 : Version Mobile (Android/iOS)
- OUT-6 : Support de navigation autres que Google Chrome
- OUT-7 : Custodial Wallet, c'est-à-dire, un middle-man qui gère la crypto pour toi
- OUT-8 : Gérer des cryptos qui n'exsitent pas. Doivent exister pour de vrai, rien de fictif. 

---

## 3. Acteurs / profils utilisateurs
### Acteur A : Clients
- **Rôle :** Utilisateurs standards qui veulent organiser leurs cryptos
- **Besoins :** Création et désactivation des comptes utilisateurs avec une bonne sécurité assurée. Peux modifier son compte en changeant ses informations. Consultation des informations sur leurs crypto via la platforme web. Ajout ou suppression d'une adresse crypto de leur liste. 
- **Contraintes :** Ne peux pas se connecter comme Admin ou manipuler le site comme admin. Ne peux pas changer le design du site. Ne peux pas accéder aux données d'un autre utilisateur. N'accède aucune clé privée ou fonctionnalité de blockchain directe à un crypto. Ne peux pas utiliser l'extension Chrome en dehors de Google Chrome.
  
### Acteur B : Administrateurs 
- **Rôle :** Gestion des comptes et du site en général 
- **Besoins :** Vérifier les comptes utilisateurs ; à le pouvoir de les activer, désactiver ou supprimer. Gestion du code interne du site et vérifie que tout fonctionne bien. Assure une bonne sécurité dans le site pour lutter contre des attaques en ligne, toujours en s'adaptant et en assurant des bonnes mise-à-jour. 
- **Contraintes :** Ne peux pas changer les adresses cryptos d'un utilisateur. Ne peux pas désactiver une crypto ou accéder a un blockchain directe. Ne peux pas supprimer le site ou changer du code qui sont importants pour sa fonctionalité.

### Acteur C : Extension Google Chrome
- **Rôle :** acteur technique qui permet la détection et enregistrement de crypto depuis une Page Web
- **Besoins :** Notification à un utilisateur pour suggérer et transmettre des cryptos à enregistrer dans le compte. Se connecte avec l'API du serveur et authentifie l'utilisateur sans problème de sécurité ou connection.
- **Contraintes :** Ne stocke pas de données sensibles localement. Fonctionne seulement si le serveur est disponible. Ne peux pas changer ou supprimer automatiquement des informations ou crypto d'un utilisateur, toujours demander la persmission en premier. Ne peux pas lister des cryptos qui n'existe pas (fictif). Fonctionne seulment so Google Chrome.
  
---

## 4. Exigences fonctionnelles (FR)
### Authentification & gestion des comptes
- **FR-1** : Création de compte avec nom d’utilisateur et mot de passe et email
- **FR-2** : Connexion avec un compte existant et actif  
- **FR-3** : Vérification de l’existence du compte dans la base de données  
- **FR-4** : Refus d’accès pour les comptes désactivés ou bannis  
- **FR-5** : Accès au tableau de bord personnel après authentification  
- **FR-6** : Déconnexion de la plateforme  
- **FR-7** : Gestion des rôles (Utilisateur / Administrateur)  
- **FR-8** : Restriction des fonctionnalités selon le rôle

###  Gestion du profil utilisateur

- **FR-9** : Modification des informations du compte (ex. mot de passe)  
- **FR-10** : Désactivation du compte par l’utilisateur

###  Gestion des adresses crypto (Utilisateur)

- **FR-11** : Ajout d’une adresse de cryptomonnaie  
- **FR-12** : Association de l’adresse crypto à l’utilisateur connecté  
- **FR-13** : Modification d’une adresse crypto existante  
- **FR-14** : Suppression d’une adresse crypto  
- **FR-15** : Affichage des adresses crypto dans le tableau de bord  
- **FR-16** : Organisation des adresses (nom, type, etc.)  
- **FR-17** : Protection contre l’accès aux adresses d’autres utilisateurs

###  Validation & règles métier

- **FR-18** : Validation du format des adresses crypto  
- **FR-19** : Validation des données côté serveur via l’API  
- **FR-20** : Refus des adresses crypto invalides ou inexistantes  
- **FR-21** : Blocage des adresses crypto fictives ou non reconnues

###  Extension Google Chrome

- **FR-22** : Détection d’adresses crypto sur les pages web  
- **FR-23** : Analyse du contenu pour identifier des adresses valides  
- **FR-24** : Confirmation utilisateur avant enregistrement 
- **FR-26** : Association automatique des adresses au compte utilisateur  
- **FR-27** : limité à Google Chrome

###  Synchronisation site ↔ extension

- **FR-28** : Les adresses ajoutées via l’extension apparaissent sur le site  
- **FR-29** : Chaque utilisateur ne voit que ses propres adresses  
- **FR-30** : Le site montre si les adresses sont bien synchronisées

###  Tableau de bord Administrateur

- **FR-31** : Accès à un tableau de bord administrateur  
- **FR-32** : Consultation des utilisateurs  
- **FR-33** : Activation, désactivation ou suppression de comptes  
- **FR-34** : Interdiction de modifier les adresses crypto des utilisateurs  
- **FR-35** : Suivi de l’état global du système

###  Site public & téléchargement

- **FR-36** : Page publique de présentation du projet  
- **FR-37** : Téléchargement de l’extension Chrome depuis le site  
- **FR-38** : Instructions d’installation de l’extension Chrome
---

## 5. Exigences non fonctionnelles (NFR)
###  Performance

- **NFR-1** : Temps de réponse inférieur à 2 secondes pour les actions principales

###  Sécurité

- **NFR-2** : Accès protégé par authentification  
- **NFR-3** : Stockage sécurisé des mots de passe  
- **NFR-4** : Aucune clé privée ni transaction blockchain
- 
###  Disponibilité & compatibilité

- **NFR-6** : Accessible depuis un navigateur web moderne  
- **NFR-7** : Extension compatible uniquement avec Google Chrome (Manifest V3)

###  Expérience utilisateur (UX)

- **NFR-8** : Actions principales en 3 clics maximum  
- **NFR-9** : Interface simple et facile à comprendre

###  Maintenabilité & qualité

- **NFR-10** : Code structuré et modulaire  
- **NFR-11** : Gestion des erreurs côté client et serveur  
- **NFR-12** : Tests des fonctionnalités principales avant livraison
---

## 6. Contraintes

- **C-1** : React (frontend) + Node.js API REST (backend)  
- **C-2** : Application web + extension Chrome  
- **C-3** : Respect des délais et phases du cours  
- **C-4** : Utilisation de Git  
- **C-5** : Extension uniquement sur Google Chrome  
- **C-6** : Respect des bonnes pratiques de sécurité

---

## 7. Données & règles métier (si applicable)
### Entités
- User
- CryptoAddress
- Admin

### Règles
- Une adresse appartient à un seul utilisateur
- Chaque utilisateur gère uniquement ses adresses
- L’admin ne modifie pas les adresses crypto
- Validation obligatoire des adresses
- Aucune clé privée stockée
- Confirmation requise via l’extension
- Synchronisation sécurisée et privée

---

## 8. Hypothèses & dépendances
### 8.1 Hypothèses
- **H-1** : Compte utilisateur valide requis  
- **H-2** : Utilisation de Google Chrome  
- **H-3** : Enregistrement d’adresses publiques uniquement  
- **H-4** : Administrateurs autorisés  
- **H-5** : Connexion Internet nécessaire

### 8.2 Dépendances
- **D-1** : API backend nécessaire au fonctionnement du système  
- **D-2** : Base de données requise pour stocker utilisateurs et adresses  
- **D-3** : Extension liée à l’API du serveur  
- **D-4** : Extension compatible uniquement avec Google Chrome (Manifest V3)  
- **D-5** : Connexion Internet requise

---

## 9. Critères d’acceptation globaux (Definition of Done – mini)
- [ ] Fonctionnalités livrées et testées
- [ ] Tests unitaires présents
- [ ] Gestion d’erreurs minimale
- [ ] Documentation à jour (UML + ADR si requis)
