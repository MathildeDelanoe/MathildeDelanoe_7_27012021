// Importation des dépendances
const express = require('express');
const multer = require('../middleware/multer-config');
const router = express.Router();
const auth = require('../middleware/auth');
const employeeCtrl = require('../controllers/employee');

// Création des routes
router.post('/signup', employeeCtrl.signup);
router.post('/login', employeeCtrl.login);
router.get('/:id', auth, employeeCtrl.retrieveEmployeeInfo);
router.delete('/:id', auth, employeeCtrl.deleteEmployee);
router.put('/:id', auth, multer, employeeCtrl.updateEmployee);
router.put('/password/:id', auth, employeeCtrl.updatePassword);

// Exportation du router et de ses différentes routes
module.exports = router;