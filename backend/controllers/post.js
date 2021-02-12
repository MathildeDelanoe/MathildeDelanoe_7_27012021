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
        // Construction de la requête SQL
        let sqlQuery = "INSERT INTO posts (user_id, text, date, nb_like) VALUES ('";
        sqlQuery += req.body.employeeId;
        sqlQuery += "', '";
        sqlQuery += req.body.message;
        sqlQuery += "', NOW(), 0);";
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
        connection.query("SELECT posts.*, DATE_FORMAT(date, 'Le %d/%m/%Y à %Hh%i') as formatedDate,first_name, last_name, avatar FROM posts LEFT JOIN employees ON user_id=employees.id ORDER BY date DESC", (error, result) => {
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
        // Traitement de la requête SQL
        connection.query("DELETE FROM posts WHERE id=?", req.params.id, (error, result) => {
            if (error) throw new Error(error);
            res.status(201).json({ 
                deletionNumber: result.affectedRows
            });
        });
    })
};