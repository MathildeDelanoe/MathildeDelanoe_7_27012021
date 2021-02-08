// Importation des differents package
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require("helmet");

// Importation des routeurs
const employeeRoutes = require('./routes/employee');
const postRoutes = require('./routes/post');

// Création de l'application Express
const app = express();

// Permet de sécuriser en définissant des en-têtes HTTP liés à la sécurité
app.use(helmet());

// Empêche les requêtes malveillantes d'accéder à des ressources sensibles
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Permet d'extraire le corps de la requête
app.use(bodyParser.json());

// Indique qu'il faut gérer l'image de manière statique
app.use('/images', express.static(path.join(__dirname, 'images')));

// Enregistrement des routes
app.use('/api/employee', employeeRoutes);
app.use('/api/post', postRoutes);

//exporter cette application
module.exports = app;