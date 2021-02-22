// Importation des dépendances
const bcrypt = require('bcrypt');
const jwt = require ('jsonwebtoken');
var cryptoJs = require("crypto-js");
var passwordValidator = require('password-validator');
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


function formatDatabaseInput(dataIn)
{
    let lowercase = dataIn.toLowerCase(); // Met la chaîne en minuscules
    // Renvoie une chaîne de caractères avec une majuscule au début
    return lowercase.charAt(0).toUpperCase() + lowercase.slice(1);
}

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
            reject(false);
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
            reject(false);
        }
    });
}

// Création du middleware d'enregistrement de nouveaux employés
exports.signup = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    checkEmail(email) // Vérification du format d'email
    .then(() => 
        checkPassword(req.body.password) // Vérification du format de mot de passe
        .then(() =>
        {
            // Chiffrement de l'adresse email
            let encryptedEmail = cryptoJs.AES.encrypt(formatDatabaseInput(email), process.env.EMAIL_KEY).toString();

            // Connexion à la base de données
            let connection = mysql.createConnection({
                host:process.env.DB_HOST,
                user:process.env.DB_USER,
                password:process.env.DB_PASS,
                database:process.env.DB_NAME
            });
            connection.connect(error => {
                if (error) throw error;
                // Récupération des emails de tous les employés présents
                connection.query("SELECT e_mail FROM employees;", (error, result) => {
                    if (error) throw new Error(error);
                    // result est un tableau qui contient les emails. Exemple : result[0].e_mail
                    // Parcours du tableau d'email pour vérifier que l'email n'est pas déjà présent en BDD
                    for (let employee of result)
                    {
                        // Décrytage de l'email présent dans la base de données
                        var bytes  = cryptoJs.AES.decrypt(employee.e_mail, process.env.EMAIL_KEY);
                        var originalEmail = bytes.toString(cryptoJs.enc.Utf8);
                        // Comparaison des emails
                        if (originalEmail === formatDatabaseInput(email))
                        {
                            connection.end();
                            return res.status(403).json({ errorMessage: 'Email déjà utilisé'});
                        }
                    }
                    // Si on arrive ici, c'est que l'email n'est pas présent en BDD, c'est bien une nouvelle inscription
                    // Fonction pour crypter le mot de passe via hash
                    bcrypt.hash(password, 10) // 10 itérations
                    .then(hash =>
                    {
                        // Insertion du nouvel employé avec son prénom, nom, email crypté et mot de passe hashé
                        let sqlQuery = "INSERT INTO employees (first_name, last_name, e_mail, password, is_admin) VALUES ('";
                        sqlQuery += formatDatabaseInput(req.body.firstName);
                        sqlQuery += "', '";
                        sqlQuery += formatDatabaseInput(req.body.lastName);
                        sqlQuery += "', '";
                        sqlQuery += encryptedEmail;
                        sqlQuery += "', '";
                        sqlQuery += hash;
                        sqlQuery += "', 0);";
                        // Traitement de la requête SQL
                        connection.query(sqlQuery, (error) => {
                            if (error) throw new Error(error);
                            connection.end();
                            return res.status(201).json({ message: 'Employé créé !'});
                        });
                    });
                });
            })
        })
        .catch(() => {res.status(403).json({ errorMessage: 'Votre mot de passe ne remplit pas les critères' })})
    )
    .catch(() => {res.status(500).json({ errorMessage: 'Votre email ne remplit pas les critères' })})
};

// Création du middleware de connexion des employés
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
        // Selection de l'email de tous les employés
        connection.query("SELECT e_mail FROM employees;", (error, result) => {
            if (error) throw new Error(error);
            for (let employee of result)
            {
                // Décrytage de l'email présent dans la base de données
                var bytes  = cryptoJs.AES.decrypt(employee.e_mail, process.env.EMAIL_KEY);
                var originalEmail = bytes.toString(cryptoJs.enc.Utf8);
                // Comparaison des emails non cryptés
                if (originalEmail === formatDatabaseInput(req.body.email))
                {
                    currentEmail = employee.e_mail; // Stockage de l'email crypté
                    break; // Si l'email correspond on sort de la boucle for
                }
            }
            // L'employé, via son email, a bien été trouvé
            // Sélectionner son id et son mot de passe
            connection.query("SELECT id, password FROM employees WHERE e_mail=?;", currentEmail, (error, result) => {
                if (error) throw new Error(error);
                if (result.length === 1)
                {
                    // L'employé a été trouvé. Il faut maintenant procéder à la comparaison des mots de passe
                    bcrypt.compare(req.body.password, result[0].password)
                    .then(valid =>
                    {
                        /* valid est un booléen qui retourne si la comparaison est validée :
                            - les chaînes de caractères sont identiques => renvoie true
                            - les chaînes diffèrent => renvoie false
                        */
                        if (!valid)
                        {
                            // Le mot de passe fourni diffère de celui enregistré dans la BDD => envoi d'une réponse avec erreur
                            connection.end();
                            return res.status(401).json({ errorMessage: 'Mot de passe incorrect !' });
                        }
                        /* Le mot de passe est correct.
                            Envoi d'un objet json qui contient l'identifiant de l'utilisateur et un token d'authentification
                        */
                        connection.end();
                        return res.status(200).json({
                            userId: result[0].id,
                            token: jwt.sign(
                                { userId: result[0].id},
                                process.env.TOKEN_KEY,
                                { expiresIn: '24h' }
                            )
                        });
                    })
                    .catch(() => res.status(500).json({ errorMessage: 'bcrypt erreur' }));
                }
                else if (result.length == 0)
                {
                    connection.end();
                    return res.status(401).json({ errorMessage: "Adresse mail non reconnue!" });
                }
                else  // (result.length > 1)
                {
                    connection.end();
                    return res.status(401).json({ errorMessage: "Plusieurs adresses email reconnues!" });
                }
            });
        });
    });
};

// Création du middleware de récupération des infos de l'employé + les likes
exports.retrieveEmployeeInfo = (req, res, next) => {
    // Connexion à la base de données
    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    connection.connect(error => {
        if (error) throw error;
        // Récupération des données de l'employé dont l'id est passé en paramètre
        connection.query("SELECT * FROM employees WHERE id=?;", req.params.id, (error, result) => {
            if (error) throw new Error(error);
            let employee = result[0];
            // Récupération des posts que l'employé aime
            connection.query("SELECT post_id FROM likes WHERE employee_id=? ORDER BY post_id DESC;", req.params.id, (error, result) => {
                if (error) throw new Error(error);
                // Création de l'objet de retour contenant les informations de l'employé et le tableau de likes
                employee = { ...employee, likedPosts: result }
                connection.end();
                return res.status(200).json({ employee: employee });
            })
        });
    });
};

// Création du middleware de suppression de l'employé
exports.deleteEmployee = (req, res, next) => {
    // Connexion à la base de données
    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    connection.connect(error => {
        if (error) throw error;
        // Sélection de l'avatar de l'employé à supprimer
        connection.query("SELECT avatar FROM employees WHERE id=?;", req.params.id, (error, result) => {
            if (error) throw error;
            if (result[0].avatar) // Suppression de la photo de profil de l'employé si elle existe
            {
                const filename = result[0].avatar.split('/images/')[1];
                fs.unlink('images/' + filename, (err) => { // Suppression de la photo de profil de l'employé
                    if (err) throw err;
                });
            }
        });

        // Sélection des images chargées par l'employé dans ses posts
        connection.query("SELECT picture FROM posts WHERE employee_id=? AND picture IS NOT NULL;", req.params.id, (error, result) => {
            if (error) throw error;
            for (let line of result) // Parcours des posts écrits par l'employé
            {
                if (line.picture) // Suppression de la photo du post courant de l'employé s'il y en a
                {
                    const filename = line.picture.split('/images/')[1];
                    fs.unlink('images/' + filename, (err) => { // Suppression de l'image postée par l'utilisateur
                        if (err) throw err;
                    });
                }
            }
        });

        // Suppression du compte de l'employé
        connection.query("DELETE FROM employees WHERE id=?", req.params.id, (error, result) => {
            if (error) throw new Error(error);
            connection.end();
            return res.status(200).json({ deletionNumber: result.affectedRows });
        });
    });
};

// Création du middleware de mise à jour du profil de l'employé
exports.updateEmployee = (req, res, next) => {
    // Connexion à la base de données
    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    connection.connect(error => {
        if (error) throw error;
        let job = formatDatabaseInput(req.body.job);
        let team = formatDatabaseInput(req.body.team);

        let sqlQuery = "UPDATE employees SET job = '";
        sqlQuery += job;
        sqlQuery += "', team = '";
        sqlQuery += team;
        sqlQuery += "'";
        if (req.file)
        {
            sqlQuery += ", avatar = '";
            sqlQuery += `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
            sqlQuery += "'";
            // Récupération de la précédente image de profil
            connection.query("SELECT avatar FROM employees WHERE id=?;", req.params.id, (error, result) => {
                if (error) throw error;
                if (result[0].avatar) // S'il existe une image déjà enregistrée, on la supprime
                {
                    const filename = result[0].avatar.split('/images/')[1];
                    fs.unlink('images/' + filename, (err) => { // Suppression de la précédente photo de profil
                        if (err) throw err;
                    });
                }
            });
        }
        else // La modification de profil n'entraîne pas de changement de photo de profil
        {
            if (req.body.removeAvatar) // L'utilisateur souhaite supprimer sa photo de profil
            {
                sqlQuery += ", avatar = NULL";
                // Récupération de la précédente image de profil
                connection.query("SELECT avatar FROM employees WHERE id=?;", req.params.id, (error, result) => {
                    if (error) throw error;
                    if (result[0].avatar) // S'il existe une image déjà enregistrée, on la supprime
                    {
                        const filename = result[0].avatar.split('/images/')[1];
                        fs.unlink('images/' + filename, (err) => { // Suppression de la précédente photo de profil
                            if (err) throw err;
                        });
                    }
                });
            }
        }
        // Mise à jour du profil de l'employé
        connection.query(sqlQuery + " WHERE id=?;", req.params.id, (error, result) => {
            if (error) throw new Error(error);
            connection.end();
            if (req.file)
            {
                return res.status(200).json({ updatedNumber: result.affectedRows,
                                              filename: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                                            });
            }
            
            return res.status(200).json({ updatedNumber: result.affectedRows,
                                          filename: null
                                        });
        });
    });
};

// Création du middleware de mise à jour du mot de passe de l'employé
exports.updatePassword = (req, res, next) => {
    // Connexion à la base de données
    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    connection.connect(error => {
        if (error) throw error;
        // Sélection du mot de passe et de l'id de l'employé considéré
        connection.query('SELECT password, id FROM employees WHERE id=?', req.params.id, (error,result) => {
            if (error) throw error;
            // Comparaison des mots de passe
            bcrypt.compare(req.body.oldPassword, result[0].password)
            .then(valid =>
            {
                /* valid est un booléen qui retourne si la comparaison est validée :
                    - les chaînes de caractères sont identiques => renvoie true
                    - les chaînes diffèrent => renvoie false
                */
                if (!valid)
                {
                    // Le mot de passe fourni diffère de celui enregistré dans la BDD => envoi d'une réponse avec erreur
                    connection.end();
                    return res.status(401).json({ errorMessage: 'Mot de passe incorrect !' });
                }
                // Le mot de passe est correct, on peut changer par le nouveau en le hashant tout d'abord
                bcrypt.hash(req.body.newPassword, 10) // 10 itérations
                .then(hash =>
                {
                    // Mise à jour du mot de passe de l'employé considéré
                    let sqlQuery = "UPDATE employees SET password='";
                    sqlQuery += hash;
                    sqlQuery += "'";
                    // Traitement de la requête SQL
                    connection.query(sqlQuery + ' WHERE id=?', req.params.id, (error) => {
                        if (error) throw new Error(error);
                        connection.end();
                        return res.status(201).json({ message: 'Mot de passe modifié !'});
                    });
                })
                .catch(() => res.status(500).json({ errorMessage: 'hash erreur' }));
            })
        })
    });
};