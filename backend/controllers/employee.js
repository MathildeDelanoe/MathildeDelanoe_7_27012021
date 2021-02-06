// Importation des dépendances
const bcrypt = require('bcrypt');
const jwt = require ('jsonwebtoken');
var cryptoJs = require("crypto-js");
var passwordValidator = require('password-validator');
const employee = require('../models/employee');
const mysql = require('mysql');
const fs = require('fs');
require('dotenv').config();

/* Paramétrage du schéma de mot de passe autorisé
 Longueur minimale de 8 éléments
 Longueur maximale de 30 éléments
 Présence d'au moins une majuscule
 Présence d'au moins une minuscule
 Présence d'au moins un chiffre
 Absence d'espaces
*/
var schema = new passwordValidator();
schema
  .is().min(8)
  .is().max(30)
  .has().uppercase(1)
  .has().lowercase(1)
  .has().digits(1)
  .has().symbols(1)
  .has().not().spaces();

/* Fonction de vérification du mot de passe
 La fonction prend en argument une chaine de caractères représentant un mot de passe
 Elle renvoie une promesse :
    - résolue si le mot de passe est conforme au format attendu
    - rejetée si le mot de passe ne respecte pas les critères définis
*/
function checkPassword(password)
{
    return new Promise((resolve, reject) => {
        if (schema.validate(password))
        {
            resolve(true);
        }
        else
        {
            reject('Votre mot de passe ne remplit pas les critères');
        }
    });
}

/* Fonction de vérification de l'adresse email
 La fonction prend en argument une chaine de caractères représentant une adresse email
 Elle renvoie une promesse :
    - résolue si l'email est conforme à l'expression régulière définie
    - rejetée si l'email diffère du format attendu
*/
function checkEmail(email)
{
    return new Promise((resolve, reject) => {
        /* /gm signifie :
            g : 'global', vérifie l'expression dans son intégralité
            m : 'multi line', les symboles ^ et $ représentent le début et la fin de la ligne
        */
        const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ-.'_0-9]{0,62}[A-Za-zÀ-ÖØ-öø-ÿ]@groupomania.com$/gm; // Définition de l'expression régulière
        if (email.match(regex) !== null)
        {
            // L'email est du format attendu
            resolve(true);
        }
        else
        {
            reject('Votre email ne remplit pas les critères');
        }
    });
}

// Création du middleware d'enregistrement de nouveaux utilisateurs
exports.signup = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    checkEmail(email) // Vérification du format d'email
    .then(() => 
        checkPassword(req.body.password) // Vérification du format de mot de passe
        .then(() =>
        {
            // Chiffrement de l'adresse email
            let encryptedEmail = cryptoJs.AES.encrypt(email, "key").toString();
            // Fonction pour crypter le mot de passe via hash
            bcrypt.hash(password, 10) // 10 itérations
            .then(hash =>
            {
                let connection = mysql.createConnection({
                    host:process.env.DB_HOST,
                    user:process.env.DB_USER,
                    password:process.env.DB_PASS,
                    database:process.env.DB_NAME
                });
                connection.connect(error => {
                    if (error) throw error;
                    console.log("Connected to the database!");
                    let sqlQuery = "INSERT INTO employees (first_name, last_name, e_mail, password, job, is_admin) VALUES ('";
                    sqlQuery += req.body.firstName;
                    sqlQuery += "', '";
                    sqlQuery += req.body.lastName;
                    sqlQuery += "', '";
                    sqlQuery += encryptedEmail;
                    sqlQuery += "', '";
                    sqlQuery += hash;
                    sqlQuery += "', '";
                    sqlQuery += req.body.job;
                    sqlQuery += "', 0);";
                    connection.query(sqlQuery, (error, result) => {
                        if (error) throw new Error(error);
                        res.status(201).json({ message: 'Employé créé !', result: result });
                    });
                });
            })
            .catch(error => res.status(500).json({ error }));
        })
        .catch((error) => {res.status(403).json({error});})
    )
    .catch((error => {console.log(error); res.status(500).json({ error });}))
};

// Création du middleware de connexion des utilisateurs
exports.login = (req, res, next) => {
    let currentEmail = "";
    /* Comme le cryptage AES utilisé ne permet pas d'obtenir le même cryptage pour une même chaine de départ
       il nous faut parcourir tous les utilisateurs de la base, décoder les emails et les comparer à celui
       présent dans la requête.
    */
    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    connection.connect(error => {
        if (error) throw error;
        console.log("Connected to the database!");
        let sqlQuery = "SELECT e_mail FROM employees;";
        // let values = [req.body.firstName, req.body.lastName, encryptedEmail, hash, req.body.job, 0];
        // connection.query(sqlQuery, [values], (error, result) => {
        connection.query(sqlQuery, (error, result) => { //result est un tableau contenant toutes les lignes retournées
            if (error) throw new Error(error);
            for (let employee of result)
            {
                // Décrytage de l'email présent danse MongoDB
                var bytes  = cryptoJs.AES.decrypt(employee.e_mail, 'key');
                var originalEmail = bytes.toString(cryptoJs.enc.Utf8);
                // Comparaison des emails
                if (originalEmail === req.body.email)
                {
                    currentEmail = employee.e_mail; // Stockage de l'email crypté
                    break; // Si l'email correspond on sort de la boucle for
                }
            }
            connection.query("SELECT id, password FROM employees WHERE e_mail=?;", currentEmail, (error, result) => {
                if (error) throw new Error(error);
                if (result.length === 1)
                {
                    // L'utilisateur a été trouvé. Il faut maintenant procéder à la comparaison des mots de passe
                    bcrypt.compare(req.body.password, result[0].password)
                    .then(valid =>
                    {
                        /* valid est un booléen qui retourne si la comparaison est validée :
                            - les chaînes de caractères sont identiques => renvoie true
                            - les chaînes diffèrent => renvoie false
                        */
                        if (!valid)
                        {
                            // Le mot de passe fourni diffère de celui enregistré dans MongoDB => envoi d'une réponse avec erreur
                            return res.status(401).json({ error: 'Mot de passe incorrect !' });
                        }
                        /* Le mot de passe est correct.
                            Envoi d'un objet json qui contient l'identifiant de l'utilisateur et un token d'authentification
                        */
                        res.status(200).json({
                            userId: result[0].id,
                            token: jwt.sign(
                                { userId: result[0].id},
                                process.env.TOKEN_KEY,
                                { expiresIn: '24h' }
                            )
                        });
                    })
                    .catch(error => res.status(500).json({ error }));
                }
                else if (result.length == 0)
                {
                    res.status(401).json({ message: "Adresse mail non reconnue!" });
                }
                else  // (result.length > 1)
                {
                    res.status(401).json({ message: "Plusieurs adresses email reconnues!" });
                }
            });
        });
    });
};

// Exportation du middleware de récupération des infos de l'utilisateur
exports.retrieveUserInfo = (req, res, next) => {
    console.log("retrieveUserInfo")
    // /* La variable 'authorization' de 'req.headers' est un chaîne de caractères qui contient 'bearer xxxxx' 
    //      où xxxx représente une chaine de caractères correspodant au token. C'est cette information
    //      que nous récupérons ici
    //   */
    // const token =  req.headers.authorization.split(' ')[1];
    // // Décodage du token à l'aide de la clé utilisée pendant le codage
    // const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
    // // Récupération du userId du token décodé
    // const userId = decodedToken.userId;

    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    connection.connect(error => {
        if (error) throw error;
        console.log("Connected to the database!");
        // let sqlQuery = "SELECT * FROM employees WHERE id=?;" + req.params.id;
        connection.query("SELECT * FROM employees WHERE id=?;", req.params.id, (error, result) => { //result est un tableau contenant toutes les lignes retournées
            if (error) throw new Error(error);
            res.status(200).json({
                employee: result[0]
            });
        });
    });
};

exports.deleteEmployee = (req, res, next) => {
    console.log("deleteEmployee")

    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    connection.connect(error => {
        if (error) throw error;
        console.log("Connected to the database!");
        connection.query("SELECT avatar FROM employees WHERE id=?;", req.params.id, (error, result) => {
            if (error) throw error;
            if (result[0].avatar)
            {
                console.log("a previous picture existed")
                const filename = result[0].avatar.split('/images/')[1];
                fs.unlink('images/' + filename, (err) => { // Suppression de la précédente image stockée pour cette Sauce
                    if (err) throw err;
                    console.log('image supprimée');
                });
                // if (error) throw new Error(error);
                // res.status(200).json({
                //     updatedNumber: result.affectedRows,
                //     filename: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                // });
            }
        });
        connection.query("DELETE FROM employees WHERE id=?",req.params.id , (error, result) => {
            //result est un tableau contenant des informations sur comment la table a été impactée
            if (error) throw new Error(error);
            res.status(200).json({
                deletionNumber: result.affectedRows
            });
        });
    });
};

exports.updateEmployee = (req, res, next) => {
    console.log("updateEmployee")
    
    // console.log(req.body)
    // console.log(req.body.firstName)
    // console.log(req.body.lastName)
    // console.log(req.body.job)
    // console.log(req.file)
    // // Interrogation de l'existence d'un fichier dans la requête => Signifie que l'image, au moins, a été modifiée
    // const modifiedEmployee = req.file ?
    // { // Si l'image a été modifiée, gestion du formData reçu du frontEnd
    //     ...req.body.employee,
    //     imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    // } : 
    // { // Seulement du contenu texte a été modifié, la requête présente seulement un contenu JSON
    //     ...req.body.employee
    // };

    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    // const filename = thing.imageUrl.split('/images/')[1];
    //   fs.unlink(`images/${filename}`, () => {
    connection.connect(error => {
        if (error) throw error;
        console.log("Connected to the database!");

        let sqlQuery = "UPDATE employees SET first_name = '";
        sqlQuery += req.body.firstName;
        sqlQuery += "', last_name = '";
        sqlQuery += req.body.lastName;
        if (req.file)
        {
            sqlQuery += "', avatar = '";
            sqlQuery += `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
            connection.query("SELECT avatar FROM employees WHERE id=?;", req.params.id, (error, result) => {
                if (error) throw error;
                if (result[0].avatar)
                {
                    console.log("a previous picture existed")
                    const filename = result[0].avatar.split('/images/')[1];
                    fs.unlink('images/' + filename, (err) => { // Suppression de la précédente image stockée pour cette Sauce
                        if (err) throw err;
                        console.log('image supprimée');
                    });
                    // if (error) throw new Error(error);
                    // res.status(200).json({
                    //     updatedNumber: result.affectedRows,
                    //     filename: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                    // });
                }
            });
        }
        sqlQuery += "', job = '";
        sqlQuery += req.body.job;
        sqlQuery += "', team = '";
        sqlQuery += req.body.team;
        sqlQuery += "' WHERE id=";
        sqlQuery += req.params.id;
        sqlQuery += ";"
        console.log(sqlQuery)
        connection.query(sqlQuery, (error, result) => {
            //result est un tableau contenant des informations sur comment la table a été impactée
            if (error) throw new Error(error);
            res.status(200).json({
                updatedNumber: result.affectedRows,
                filename: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            });
        });
    });
};