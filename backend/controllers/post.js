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
        // Réception d'un post avec un fichier
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
            connection.query(sqlQuery, (error, result) => {
                if (error) throw new Error(error);
                connection.query("SELECT id, DATE_FORMAT(date, 'Le %d/%m/%Y à %Hh%i') AS formatedDate, text, picture FROM posts WHERE id=?", result.insertId, (error, result) => {
                    if (error) throw new Error(error);
                    connection.end();
                    return res.status(201).json({ id: result[0].id,
                                                  date: result[0].formatedDate,
                                                  picture: result[0].picture,
                                                  content: result[0].text });
                });
            });
        }
        else
        {
            // Réception d'un post ou d'un commentaire sans contenu multimédia
            if (req.body.postId)
            {
                // Création d'un commentaire
                let sqlQuery = "INSERT INTO posts (employee_id, date, text, post_id) VALUES ('";
                sqlQuery += req.body.employeeId;
                sqlQuery += "', NOW(), '";
                sqlQuery += message;
                sqlQuery += "', '";
                sqlQuery += req.body.postId;
                sqlQuery += "');";
                // Traitement de la requête SQL
                connection.query(sqlQuery, (error, result) => {
                    if (error) throw new Error(error);
                    connection.query("SELECT id, DATE_FORMAT(date, 'Le %d/%m/%Y à %Hh%i') AS formatedDate, text FROM posts WHERE id=?", result.insertId, (error, result) => {
                        if (error) throw new Error(error);
                        connection.end();
                        return res.status(201).json({ id: result[0].id,
                                                      date: result[0].formatedDate,
                                                      content: result[0].text });
                    });
                });
            }
            else
            {
                // Création d'un post
                // Construction de la requête SQL
                let sqlQuery = "INSERT INTO posts (employee_id, date, text) VALUES ('";
                sqlQuery += req.body.employeeId;
                sqlQuery += "', NOW(), '";
                sqlQuery += message;
                sqlQuery += "');";
                // Traitement de la requête SQL
                connection.query(sqlQuery, (error, result) => {
                    if (error) throw new Error(error);
                    connection.query("SELECT id, DATE_FORMAT(date, 'Le %d/%m/%Y à %Hh%i') AS formatedDate, text FROM posts WHERE id=?", result.insertId, (error, result) => {
                        if (error) throw new Error(error);
                        connection.end();
                        return res.status(201).json({ id: result[0].id,
                                                      date: result[0].formatedDate,
                                                      content: result[0].text });
                    });
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
        // connection.query("SELECT posts.*, DATE_FORMAT(date, 'Le %d/%m/%Y à %Hh%i') as formatedDate, first_name, last_name, avatar FROM posts LEFT JOIN employees ON employee_id=employees.id WHERE post_id IS NULL ORDER BY date DESC", (error, result) => {
        connection.query("SELECT posts.*, DATE_FORMAT(date, 'Le %d/%m/%Y à %Hh%i') as formatedDate, first_name, last_name, avatar, IFNULL(postLike.nb_likes, 0) as nbLikes\
                          FROM posts \
                          LEFT JOIN employees \
                          ON posts.employee_id=employees.id \
                          LEFT JOIN (SELECT post_id, count(distinct likes.employee_id) as nb_likes \
                          from likes \
                          group by post_id) AS postLike \
                          ON posts.id=postLike.post_id \
                          WHERE posts.post_id IS NULL \
                          ORDER BY date DESC;", (error, result) => {
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

exports.like = (req, res, next) => {
    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    // Connection à la base de données
    connection.connect(error => {
        if (error) throw error;
        // Recherche du couple (employé/post) dans la table de like
        connection.query("SELECT id FROM likes WHERE employee_id=? AND post_id=?", [req.body.employeeId, req.params.id], (error, result) => {
            if (error) throw new Error(error)
            if (result.length == 1)
            {
                // Le couple a été trouvé, l'employé souhaite enlever son like => Suppression de la ligne dans la table likes
                connection.query("DELETE FROM likes WHERE id=?", result[0].id, (error) => {
                    if (error) throw new Error(error)
                    connection.end();
                    return res.status(201).json({ like: 0 });
                });
            }
            else if (result.length == 0)
            {
                // Le couple (employé/post) n'a pas été trouvé, l'employé souhaite aimer le post
                let sqlQuery = "INSERT INTO likes (employee_id, post_id) VALUES ('";
                sqlQuery += req.body.employeeId;
                sqlQuery += "', '";
                sqlQuery += req.params.id;
                sqlQuery += "');";
                connection.query(sqlQuery, (error) => {
                    if (error) throw new Error(error);
                    connection.end();
                    return res.status(201).json({ like: 1 });
                });
            }
            else
            {
                connection.end();
                return res.status(403).json({ errorMessage: 'L\'employé a liké plusieurs fois le même post' });
            }
        });
    })
};

exports.getAllPostsFromEmployee = (req, res, next) => {
    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    // Connection à la base de données
    connection.connect(error => {
        if (error) throw error;
        connection.query("SELECT posts.id\
                          FROM posts \
                          LEFT JOIN employees \
                          ON posts.employee_id=employees.id \
                          WHERE posts.post_id IS NULL AND employees.id IN (SELECT id FROM employees WHERE first_name=? AND last_name=?)\
                          ORDER BY date DESC;",
                          [req.params.firstName, req.params.lastName], (error, result) => {
            if (error) throw new Error(error);
            connection.end();
            if (result.length === 0)
            {
                return res.status(403).json({ errorMessage: 'Aucun employé connu sous Nom Prénom : ' + req.params.lastName + ' ' + req.params.firstName});
            }
            return res.status(201).json({ postIds: result });
        });      
    });
};