# Cahier des charges (SRS léger) — EZ-CRYPT0
**Équipe :** Marco-Andrés Mora, Driss Laaziri

**Date :** 2026-01-22

**Version :** v0.1

---

## 1. Contexte & Objectif
- **Contexte :** Quand une personne commence a devenir un investisseur dans la crypto, ce n'est pas comme la bourse normal, qui s`ouvre a une certaine heure (9am) et ensuite ferme (4pm) jusqu'à la prochaine journée. C'est des monnaies qui roule et bouge 24 heures chaque journées. De plus, les gens ne vont pas posséder juste 1 ou 2 monnaies à la fois, non, ils vont vouloir maximiser leur chance de faire de l'argent en investissant dans plusieurs crypto différente. Donc, un investisseur va posséder plusieurs adresses réparties sur différentes platformes et supports de manière très dispersé.

  La personne average ne va pas avoir le temps de gérer tout ce brouhaha, alors tout cela entraîne une perte de temps et même des risques d’erreurs et une mauvaise organisation. Nous voulons pouvoir les aider en gérant ces adresses publiques de manière très simple et sécurisée.

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
> Forme recommandée : “Le système doit…”
- **FR-1 :** Le système doit permettre à une personne de créer un compte avec un Username et un mot de passe.
- **FR-2 :** Le système doit permettre à un Utilisateur de se connecter au site avec un compte déjà créer qui ne sois pas banis du site.
- **FR-3 :** Le système doit authentifier le compte qui se connecte pour voir s'il existe dans la Base de Données.
- **FR-4 :** Le système doit permettre à un Utilisateur d'accéder à son dashboard quand la connection est établie.
- **FR-5 :** Le système doit permettre à un Utilisateur de se déconnecter de la plateforme.
- **FR-6 :** Le système doit restreindre l’accès aux fonctionnalités selon le rôle (User or Admin)

---

## 5. Exigences non fonctionnelles (NFR)
> Performance / sécurité / disponibilité / UX / maintenabilité…
- **NFR-1 (Performance) :** <ex. temps de réponse < 2s>
- **NFR-2 (Sécurité) :** <ex. authentification requise>
- **NFR-3 (UX) :** <ex. parcours en ≤ 3 clics>
- **NFR-4 (Qualité) :** <ex. couverture minimale de tests>

---

## 6. Contraintes
- **C-1 (Technologie) :** <langage / framework imposé>
- **C-2 (Plateforme) :** <web / mobile / desktop>
- **C-3 (Délai) :** <dates de phases>
- **C-4 (Outils) :** <Git, CI, etc.>

---

## 7. Données & règles métier (si applicable)
- **Entités principales :** <User, Order, ...>
- **Règles métier :** <validation, calculs, permissions, etc.>

---

## 8. Hypothèses & dépendances
### 8.1 Hypothèses
- H-1 : <ex. utilisateurs ont un compte>
- H-2 : <...>

### 8.2 Dépendances
- D-1 : <API externe / BD / service>
- D-2 : <...>

---

## 9. Critères d’acceptation globaux (Definition of Done – mini)
- [ ] Fonctionnalités livrées et testées
- [ ] Tests unitaires présents
- [ ] Gestion d’erreurs minimale
- [ ] Documentation à jour (UML + ADR si requis)
