// Importation des dépendances
// const bcrypt = require('bcrypt');
// const jwt = require ('jsonwebtoken');
// var cryptoJs = require("crypto-js");
// var passwordValidator = require('password-validator');

// Création du middleware d'enregistrement de nouveaux utilisateurs
exports.signup = (req, res, next) => {
    console.log(req);
    res.status(200).json({ message: 'Tu es une championne !' });
    // checkEmail(req.body.email) // Vérification du format d'email
    //     .then(() => 
    //         checkPassword(req.body.password) // Vérification du format de mot de passe
    //         .then(() =>
    //         {
    //             // Chiffrement de l'adresse email
    //             let encryptedEmail = cryptoJs.AES.encrypt(req.body.email, "key").toString();
    //             // Fonction pour crypter le mot de passe via hash
    //             bcrypt.hash(req.body.password, 10) // 10 itérations
    //             .then(hash =>
    //             {
    //                 // Création d'un nouvel utilisateur avec email/mot de passe cryptés
    //                 const signedUser = new user({
    //                     email: encryptedEmail,
    //                     password: hash
    //                 }); 
    //                 // Sauvegarde du nouvel utilisateur dans la base de données et envoi de la réponse
    //                 signedUser.save()
    //                     .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
    //                     .catch(error => res.status(400).json({error}));
    //             })
    //             .catch(error => res.status(500).json({ error }));
    //         })
    //         .catch((error) => {res.status(403).json({error});})
    //     )
    //     .catch((error => {console.log(error); res.status(500).json({ error });}))
};