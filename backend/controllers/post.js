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

exports.getAllPost = (req, res, next) => {
    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    // Connection à la base de données
    connection.connect(error => {
        if (error) throw error;
        // Traitement de la requête SQL
        connection.query("SELECT posts.*, first_name, last_name, avatar FROM posts LEFT JOIN employees ON user_id=employees.id ORDER BY date DESC", (error, result) => {
            if (error) throw new Error(error);
            res.status(201).json({ posts: result});
        });
    })
};

exports.delete = (req, res, next) => {
    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    console.log("delete post " + req.params.id)
    // Connection à la base de données
    connection.connect(error => {
        if (error) throw error;
        // Traitement de la requête SQL
        connection.query("DELETE FROM posts WHERE id=?", req.params.id, (error, result) => {
            if (error) throw new Error(error);
            console.log(result)
            res.status(201).json({ 
                deletionNumber: result.affectedRows
            });
        });
    })
};