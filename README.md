# Groupomania

## Pré-requis
Cloner ce repository

### Lancement du frontend
* Se rendre dans le dossier frontend
* Executer la commande "npm install"
* Executer "npm run serve"

A l'issue de cette étape, la console affiche un message "App running at: - Local:  http://localhost:8080/ 

L'application sera alors accessible depuis n'importe quel navigateur à l'url indiquée

### Lancement du backend
* Se rendre dans le dossier backend
* Lancer la commande "npm install"
* Pour lancer le serveur, executer "nodemon server"

Après cette étape, la console doit afficher le message "Listening on port 3000"

### Configuration de la base de données
Afin de permettre une interaction avec la base de données, il faut paramétrer un fichier .env à la racine du dossier 'backend' contenant les informations:
  * DB_HOST
  * DB_USER
  * DB_PASS
  * DB_NAME
  * TOKEN_KEY
  * EMAIL_KEY

### Utilisation de l'application
A partir de maintenant, l'environnement est configuré, et vous pouvez utiliser l'application, soit en vous connectant, soit en vous inscrivant.

