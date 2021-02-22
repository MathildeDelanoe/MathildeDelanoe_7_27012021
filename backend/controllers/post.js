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
    // Connexion à la base de données
    connection.connect(error => {
        if (error) throw error;
        // Vérification que le contenu du post n'est pas vide => Absence de texte et d'image
        if (req.body.message.length === 0 && !req.file)
        {
            connection.end();
            return res.status(403).json({ errorMessage: 'Message vide !'});
        }

        // Si le texte du message présente des apostrophes, on double les apostrophes pour éviter les erreurs sql
        let messageSplit = req.body.message.split("'"); // On crée un tableau qui sépare les bouts de texte encadrés de l'élément '
        let message = messageSplit[0]; // Initialisation du message final avec la première partie de texte
        for (let index = 1; index < messageSplit.length; ++index)
        {
            message += "''"; // Insertion d'un double ' pour contrecarrer les erreurs SQL
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
            // Traitement de la requête SQL d'insertion du post avec contenu multimédia dans la bdd
            connection.query(sqlQuery, (error, result) => {
                if (error) throw new Error(error);
                // Sélection du message ainsi ajouté pour envoi vers le frontend
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
        else // Réception d'un post ou d'un commentaire sans contenu multimédia
        {
            if (req.body.postId) // Création d'un commentaire car le champ postId est présent
            {
                let sqlQuery = "INSERT INTO posts (employee_id, date, text, post_id) VALUES ('";
                sqlQuery += req.body.employeeId;
                sqlQuery += "', NOW(), '";
                sqlQuery += message;
                sqlQuery += "', '";
                sqlQuery += req.body.postId;
                sqlQuery += "');";
                // Traitement de la requête SQL d'insertion du commentaire
                connection.query(sqlQuery, (error, result) => {
                    if (error) throw new Error(error);
                    // Sélection du message ainsi ajouté pour envoi vers le frontend
                    connection.query("SELECT id, DATE_FORMAT(date, 'Le %d/%m/%Y à %Hh%i') AS formatedDate, text FROM posts WHERE id=?", result.insertId, (error, result) => {
                        if (error) throw new Error(error);
                        connection.end();
                        return res.status(201).json({ id: result[0].id,
                                                      date: result[0].formatedDate,
                                                      content: result[0].text });
                    });
                });
            }
            else // Création d'un post car le champ postId est absent
            {
                // Construction de la requête SQL
                let sqlQuery = "INSERT INTO posts (employee_id, date, text) VALUES ('";
                sqlQuery += req.body.employeeId;
                sqlQuery += "', NOW(), '";
                sqlQuery += message;
                sqlQuery += "');";
                // Traitement de la requête SQL d'insertion d'un post sans contenu multimédia
                connection.query(sqlQuery, (error, result) => {
                    if (error) throw new Error(error);
                    // Sélection du message ainsi ajouté pour envoi vers le frontend
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

// Création du middleware de récupération de tous les posts de la bdd
exports.getAllPost = (req, res, next) => {
    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    // Connexion à la base de données
    connection.connect(error => {
        if (error) throw error;
        // Traitement de la requête SQL
        // Sélection de toutes les infos de la table post, du nom, prénom et avatar de l'employé ayant rédigé le post, et le nombre de likes du post
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
            return res.status(201).json({ posts: result });
        });
    })
};

// Création du middleware de récupération des commentaires du post courant
exports.getAllCommentsFromPost= (req, res, next) => {
    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    // Connexion à la base de données
    connection.connect(error => {
        if (error) throw error;
        // Sélection de tous les commentaires du post req.params.id, du prénom, nom et avatar de l'auteur et formattagede la date de création
        connection.query("SELECT posts.*, DATE_FORMAT(date, 'Le %d/%m/%Y à %Hh%i') as formatedDate, \
                          first_name, last_name, avatar\
                          FROM posts\
                          LEFT JOIN employees\
                          ON employee_id=employees.id\
                          WHERE post_id = ?\
                          ORDER BY date", req.params.id, (error, result) => {
            if (error) throw new Error(error);
            connection.end();
            return res.status(201).json({ comments: result });
        });
    })
};

// Création du middleware de suppression d'un message, qu'il soit post ou commentaire
exports.delete = (req, res, next) => {
    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    // Connexion à la base de données
    connection.connect(error => {
        if (error) throw error;
        // Sélection de l'image du message à supprimer
        connection.query("SELECT picture FROM posts WHERE id=?;", req.params.id, (error, result) => {
            if (error) throw error;
            if (result[0].picture) // S'il en existe une, elle doit être supprimée du serveur
            {
                const filename = result[0].picture.split('/images/')[1];
                fs.unlink('images/' + filename, (err) => { // Suppression de l'image liée au post
                    if (err) throw err;
                });
            }
        });
        // Traitement de la requête SQL de suppression du message req.params.id
        connection.query("DELETE FROM posts WHERE id=?", req.params.id, (error, result) => {
            if (error) throw new Error(error);
            connection.end();
            return res.status(201).json({ 
                deletionNumber: result.affectedRows
            });
        });
    })
};

// Création du middleware de changement de like d'un post
exports.like = (req, res, next) => {
    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    // Connexion à la base de données
    connection.connect(error => {
        if (error) throw error;
        // Recherche du couple (employé/post) dans la table de like
        connection.query("SELECT id FROM likes WHERE employee_id=? AND post_id=?", [req.body.employeeId, req.params.id], (error, result) => {
            if (error) throw new Error(error)
            if (result.length === 1)
            {
                // Le couple a été trouvé, l'employé souhaite enlever son like => Suppression de la ligne dans la table likes
                connection.query("DELETE FROM likes WHERE id=?", result[0].id, (error) => {
                    if (error) throw new Error(error)
                    connection.end();
                    return res.status(201).json({ like: 0 });
                });
            }
            else if (result.length === 0)
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

// Création du middleware de récupération de tous les posts écrits par un employé
exports.getAllPostsFromEmployee = (req, res, next) => {
    let connection = mysql.createConnection({
        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
        database:process.env.DB_NAME
    });
    // Connexion à la base de données
    connection.connect(error => {
        if (error) throw error;
        // Sélection de l'id de l'employé  dont les nom et prénoms sont passés en paramètre de la requête
        connection.query("SELECT id FROM employees WHERE first_name=? AND last_name=?;", [req.params.firstName, req.params.lastName], (error, result) => {
            if (error) throw new Error(error);
            if (result.length === 0)
            {
                // Si aucun résultat, renvoi d'un message d'erreur
                connection.end();
                return res.status(403).json({ errorMessage: 'Aucun employé connu sous Nom Prénom : ' + req.params.lastName + ' ' + req.params.firstName});
            }
            else
            {
                // Sélection de l'id des posts écrits par l'employé dont le nom et prénoms sont passés en paramètre de la requête
                connection.query("SELECT posts.id\
                                  FROM posts \
                                  LEFT JOIN employees \
                                  ON posts.employee_id=employees.id \
                                  WHERE posts.post_id IS NULL AND employees.id IN (SELECT id FROM employees WHERE first_name=? AND last_name=?)\
                                  ORDER BY date DESC;",
                                  [req.params.firstName, req.params.lastName], (error, result) => {
                    if (error) throw new Error(error);
                    connection.end();
                    return res.status(201).json({ postIds: result });
                });      
            }
        });
    });
};