// Importation des dépendances
const mysql = require('mysql');
const fs = require('fs');
require('dotenv').config();


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
        let message = req.body.message;
        if (req.file)
        {
            // Construction de la requête SQL
            let sqlQuery = "INSERT INTO posts (user_id, date, text, picture, nb_like) VALUES ('";
            sqlQuery += req.body.employeeId;
            sqlQuery += "', NOW(), '";
            sqlQuery += message;
            sqlQuery += "', '";
            sqlQuery += `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
            sqlQuery += "', 0);";
            // Traitement de la requête SQL
            connection.query(sqlQuery, (error) => {
                if (error) throw new Error(error);
                res.status(201).json({ message: 'Post créé !'});
            });
        }
        else
        {
            // Construction de la requête SQL
            let sqlQuery = "INSERT INTO posts (user_id, date, text, nb_like) VALUES ('";
            sqlQuery += req.body.employeeId;
            sqlQuery += "', NOW(), '";
            sqlQuery += message;
            sqlQuery += "', 0);";
            // Traitement de la requête SQL
            connection.query(sqlQuery, (error) => {
                if (error) throw new Error(error);
                res.status(201).json({ message: 'Post créé !'});
            });
        }
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
        connection.query("SELECT posts.*, DATE_FORMAT(date, 'Le %d/%m/%Y à %Hh%i') as formatedDate, first_name, last_name, avatar FROM posts LEFT JOIN employees ON user_id=employees.id ORDER BY date DESC", (error, result) => {
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
    // Connection à la base de données
    connection.connect(error => {
        if (error) throw error;
        connection.query("SELECT picture FROM posts WHERE id=?;", req.params.id, (error, result) => {
            if (error) throw error;
            if (result[0].picture)
            {
                const filename = result[0].picture.split('/images/')[1];
                fs.unlink('images/' + filename, (err) => { // Suppression de l'image liée au post
                    if (err) throw err;
                });
            }
        });
        // Traitement de la requête SQL
        connection.query("DELETE FROM posts WHERE id=?", req.params.id, (error, result) => {
            if (error) throw new Error(error);
            res.status(201).json({ 
                deletionNumber: result.affectedRows
            });
        });
    })
};