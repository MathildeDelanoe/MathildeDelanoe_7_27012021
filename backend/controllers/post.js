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
        if (req.body.message.length === 0 && !req.file)
        {
            connection.end();
            return res.status(403).json({ errorMessage: 'Message vide !'});
        }
        // Si le texte du message présente des apostrophes, on double les apostrophes pour éviter les erreurs sql
        let messageSplit = req.body.message.split("'");
        let message = messageSplit[0];
        for (let index = 1; index < messageSplit.length; ++index)
        {
            message += "''";
            message += messageSplit[index];
        }
        if (req.file)
        {
            // Construction de la requête SQL
            let sqlQuery = "INSERT INTO posts (employee_id, date, text, picture) VALUES ('";
            sqlQuery += req.body.employeeId;
            sqlQuery += "', NOW(), '";
            sqlQuery += message;
            sqlQuery += "', '";
            sqlQuery += `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
            sqlQuery += "');";
            // Traitement de la requête SQL
            connection.query(sqlQuery, (error) => {
                if (error) throw new Error(error);
                connection.end();
                return res.status(201).json({ message: 'Post créé !'});
            });
        }
        else
        {
            // Réception d'un post ou d'un commentaire
            if (req.body.postId)
            {
                let sqlQuery = "INSERT INTO posts (employee_id, date, text, post_id) VALUES ('";
                sqlQuery += req.body.employeeId;
                sqlQuery += "', NOW(), '";
                sqlQuery += message;
                sqlQuery += "', '";
                sqlQuery += req.body.postId;
                sqlQuery += "');";
                // Traitement de la requête SQL
                connection.query(sqlQuery, (error) => {
                    if (error) throw new Error(error);
                    connection.end();
                    return res.status(201).json({ message: 'Commentaire créé !'});
                });
            }
            else
            {
                // Construction de la requête SQL
                let sqlQuery = "INSERT INTO posts (employee_id, date, text) VALUES ('";
                sqlQuery += req.body.employeeId;
                sqlQuery += "', NOW(), '";
                sqlQuery += message;
                sqlQuery += "');";
                // Traitement de la requête SQL
                connection.query(sqlQuery, (error) => {
                    if (error) throw new Error(error);
                    connection.end();
                    return res.status(201).json({ message: 'Post créé !'});
                });
            }
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
        connection.query("SELECT posts.*, DATE_FORMAT(date, 'Le %d/%m/%Y à %Hh%i') as formatedDate, first_name, last_name, avatar FROM posts LEFT JOIN employees ON employee_id=employees.id WHERE post_id IS NULL ORDER BY date DESC", (error, result) => {
            if (error) throw new Error(error);
            connection.end();
            return res.status(201).json({ posts: result});
        });
    })
};

exports.getAllCommentsFromPost= (req, res, next) => {
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
        connection.query("SELECT posts.*, DATE_FORMAT(date, 'Le %d/%m/%Y à %Hh%i') as formatedDate, first_name, last_name, avatar FROM posts LEFT JOIN employees ON employee_id=employees.id WHERE post_id = ? ORDER BY date", req.params.id, (error, result) => {
            if (error) throw new Error(error);
            connection.end();
            return res.status(201).json({ comments: result});
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
            connection.end();
            return res.status(201).json({ 
                deletionNumber: result.affectedRows
            });
        });
    })
};