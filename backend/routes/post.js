// Importation des dépendances
const express = require('express');
const multer = require('../middleware/multer-config');
const router = express.Router();
const auth = require('../middleware/auth');
const postCtrl = require('../controllers/post');

// Création des routes
router.post('/save', postCtrl.savePost);
router.get('/', postCtrl.getAllPost);

// Exportation du router et de ses différentes routes
module.exports = router;