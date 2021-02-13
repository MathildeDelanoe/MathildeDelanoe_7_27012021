// Importation des dépendances
const express = require('express');
const multer = require('../middleware/multer-config');
const router = express.Router();
const auth = require('../middleware/auth');
const postCtrl = require('../controllers/post');

// Création des routes
router.post('/save', auth, multer, postCtrl.savePost);
router.get('/', auth, postCtrl.getAllPost);
router.delete('/:id', auth, postCtrl.delete);

// Exportation du router et de ses différentes routes
module.exports = router;