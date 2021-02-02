// Importation des dépendances
const express = require('express');
const router = express.Router();
const employeeCtrl = require('../controllers/employee');

// Création des routes
router.post('/signup', employeeCtrl.signup);
router.post('/login', employeeCtrl.login);

// Exportation du router et de ses différentes routes
module.exports = router;