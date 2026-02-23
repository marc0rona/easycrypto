# Rapport pout la Partie 2 
## Correction effectués suites aux commentaires
### 1. Liens bien réglés & fonctionnels 
Dans le README.md, les liens qui mènent vers ‘SRS.md’ et ‘ADR.md’ ont été réglés et mènent bien vers le dossier de /documentation maintenant. 

### 2. Ajout et finalisation des FR & NFR qui manquaient
À la remise, nous n’avions que 6 FR. 

On a rajouté 30 autres FR pour le terminer, et aussi toutes les NFR (12 en total) 

### 3. Ajout des Contraintes + Hypothèses + Dépendances 
À la remise, on n’avait pas encore faite ces 3 section dans le SRS.md, mais nous avons rajoutés 6 contraintes, 5 hypothèses, 5 dépendances et des critères d’acceptation 

### 4. Mis-a-jour du Contexte pour qui paraisse plus professionel (qualité de redaction)
On a enlevé des mots trop communs et de rue pour rendre le texte plus neutre de tonalité. Enlever les mots comme ‘brouhaha’ , ‘bourse normal’, ‘personne average’ et toute répétitions inutiles. 


## Liste des diagrammes + explications (Titre + texte explicatif + diagramme)
### 1. [Diagramme des cas d’utilisations](/documentation/Diagrams/crypto-usecase-drawio.png)
Ce diagramme montre les principales interactions entres les acteurs  et le système EZ-Crypto. 
Il y a 3 acteurs :
- L'Utilisateur (Client) a gauche en haut
- L'Administrateur a gacuhe en bas
- L'Extension Chrome a droite

  
L'utilisateur peut gérer son compte (inscription, connexion, modifications et désactivation), consulter son tableau de bord (Dashboard) pour gérer ses adresses et synchroniser ses données avec l'extension. Il a aussi des fonctions d'authentifications pour la protection du site et la gestion des adresses qui doit être avoir un format valide toujours afin de garantir l'intégrité des données fournis.

L'administrateur dispose de privilèges qui lui permettent de gérer les comptes du site (activation, désactivation et suppression), consulter les utilisateurs et surveiller le système en général. 

L'extension Chrome agit comme un acteur externe capable de détecter des adresses crypto sur des pages web et les transmettres au serveur, en respectant les limites liées a Manifest V3 Google Chrome. 

### 2. [Diagramme de composants](/documentation/Diagrams/crypto-component-simple.png)
Ce diagramme montre l'architecture logicielle du système en séparant le front-end, back-end et la couche des données. 

Le front-end est composée du site version web et l'extension Chrome, qui communiquent avec le backend via REST API. Le back-end a plusieurs composants :
- Module authentification pour la validation des id
- Gestionnaire d'adresses qui traite les opérations liées aux portefeuilles crypto
- Un validator pour assurer des bons formats d'adresses

Toutes les requêtes passent par l'API REST, qui centralise toute le route du système et applique les contrôles nécessaires. La couche DATA ACCESS agit comme connecteur entre le back-end et la Base de données. 


### 3. [Diagramme des classes pour composant implémenté](/documentation/Diagrams/Class-Diagram.drawio.png)
Il y a trois entités principales : **User**, **CryptoAdress** et **AdminLog** et suit une séparation : les contrôleurs (qui gèrent les requêtes API), les services qui contiennent la logique métier. Le diagramme montre également l’intégration de l’extension Chrome via la classe ChromeExtension et le module AddressDetector, responsables de la détection d’adresses sur les pages web et de leur transmission au serveur. Les relations entre classes montrent la gestion des rôles (user/admin), l’association entre utilisateurs et adresses crypto.


## Implémentation du patron Singleton
Le patron de conception **Singleton** a été implémenté dans la classe “AuthManager" pour le cette partie du projet, ce qui est responsable de la gestion d’authentification pour la connection au site. Elle oblige le système qu’une seule instance de cette classe est créée et utilisée pendant tout le cycle de vie du programme (comme l’exemple qu’un seul guarde doit être dans la salle du président. Si un autre rentre et voir le guarde, il sort)

L’instance est stockée en version statique et initialisée avec un **Lazy initialization** lors du premier accès via le getter Instance. Je n’ai utiliser aucun lock car JavaScript côté navigateur fonctionne selon un modèle single-threaded, qui évite les risques de redondances quand l’instance est créé. 

