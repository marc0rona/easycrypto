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
### 1. [Diagramme des cas d’utilisations](/Diagrams/crypto-usecase-drawio.png)

### 2. [Diagramme de composants](/Diagrams/crypto-component-simple.png)

### 3. [Diagramme des classes pour composant implémenté](/Diagrams/Class-Diagram.drawio.png)



## Implémentation du patron Singleton
Le patron de conception **Singleton** a été implémenté dans la classe “AuthManager" pour le cette partie du projet, ce qui est responsable de la gestion d’authentification pour la connection au site. Elle oblige le système qu’une seule instance de cette classe est créée et utilisée pendant tout le cycle de vie du programme (comme l’exemple qu’un seul guarde doit être dans la salle du président. Si un autre rentre et voir le guarde, il sort)

L’instance est stockée en version statique et initialisée avec un **Lazy initialization** lors du premier accès via le getter Instance. Je n’ai utiliser aucun lock car JavaScript côté navigateur fonctionne selon un modèle single-threaded, qui évite les risques de redondances quand l’instance est créé. 

