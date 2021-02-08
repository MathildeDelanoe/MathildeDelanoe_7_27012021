// Importation des dépendances
const mysql = require('mysql');
const fs = require('fs');
require('dotenv').config();

/* Cette fonction renvoie une chaine de caractères exprimant la date tel qu'attendu par SQL */
function formatDate(date) {
    let newDate = new Date(date); // Création d'un objet date utilisant la chaine de caractères fournit en entrée
    let jourMois = newDate.getDate();
    let mois = (newDate.getMonth() + 1); // +1 parce que getMonth renvoie 0 pour janvier
    let annee = newDate.getFullYear();
    let heures = newDate.getHours();
    let minutes = newDate.getMinutes();
    let secondes = newDate.getSeconds();

    return annee + "-" + mois + "-" + jourMois + " " + heures + ":" + minutes + ":" + secondes;
}

// Création du middleware de sauvegarde d'un post
exports.savePost = (req, res, next) => {
    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    // Connection à la base de données
    connection.connect(error => {
        if (error) throw error;
        // Construction de la requête SQL
        let sqlQuery = "INSERT INTO posts (user_id, date, text, nb_like) VALUES ('";
        sqlQuery += req.body.employeeId;
        sqlQuery += "', '";
        sqlQuery += formatDate(req.body.date);
        sqlQuery += "', '";
        sqlQuery += req.body.message;
        sqlQuery += "', 0);";
        console.log(sqlQuery)
        // Traitement de la requête SQL
        connection.query(sqlQuery, (error) => {
            if (error) throw new Error(error);
            res.status(201).json({ message: 'Post créé !'});
        });
    })
};
