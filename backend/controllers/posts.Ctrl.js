const db = require("../models/index");
const Post = db.post;
const User = db.user;
const Comment = db.comment;
const asyncLib = require('async');

// CRUD MODEL

const ITEMS_LIMIT = 50;

// creation
exports.createPost = (req, res, next) => {

    // Vérifie s'il y a un fichier et définit son adresse ou le laisse vide
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null;

    asyncLib.waterfall([

        // Faire en sorte que l'utilisateur soit lié à la publication
        function(done) {
            User.findOne({
                    where: { id: req.body.userId }
                })
                .then(function(userFound) {
                    done(null, userFound);
                })
                .catch(function(err) {
                    return res.status(500).json({ 'error': 'unable to verify user' });
                });
        },

        // S'il est trouvé, créez le message avec des entrées
        function(userFound, done) {
            if (userFound) {
                Post.create({
                        content: req.body.content,
                        imageUrl: imageUrl,
                        UserId: userFound.id
                    })
                    .then(function(newPost) {
                        done(newPost);
                    });
            } else {
                res.status(404).json({ 'error': 'user not found' });
            }
        },

        // si ok, confirme le
    ], function(newPost) {
        if (newPost) {
            return res.status(201).json(newPost);
        } else {
            return res.status(500).json({ 'error': 'cannot send post' });
        }
    })
};

// read
exports.findAll = (req, res) => {

    const fields = req.query.fields; // Champs de table de base de données à charger
    const limit = parseInt(req.query.limit); // limite le nombre
    const offset = parseInt(req.query.offset); // messages chargés
    const order = req.query.order;

    if (limit > ITEMS_LIMIT) {
        limit = ITEMS_LIMIT;
    }

    asyncLib.waterfall([

            // Si trouvé, obtenez tous les messages par pseudo
            function(done) {
                Post.findAll({
                    // Ne jamais faire confiance aux entrées utilisateur -> les tester
                    order: [(order != null) ? order.split(':') : ['createdAt', 'DESC']],
                    attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
                    limit: (!isNaN(limit)) ? limit : null,
                    offset: (!isNaN(offset)) ? offset : null,
                    include: [{ // Lie la publication avec les tableaux Utilisateur et Commentaires
                        model: User,
                        Comment,
                        attributes: ['pseudo', 'imageUrl', 'isAdmin']
                    }]
                }).then(function(posts) {
                    done(posts)
                }).catch(function(err) {
                    console.log(err);
                    res.status(500).json({ "error": "invalid fields" });
                });
            },
            // si ok, ocnfirme le
        ],
        function(posts) {
            if (posts) {
                return res.status(201).json(posts);
            } else {
                return res.status(500).json({ 'error': 'cannot send post' });
            }
        })
};

// supprimer
exports.deletePost = (req, res, next) => {

    asyncLib.waterfall([

            // Vérifie si la demande est envoyée par un utilisateur enregistré
            function(done) {
                User.findOne({
                        where: { id: req.body.userId }
                    }).then(function(userFound) {
                        done(null, userFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'unable to verify user' });
                    });
            },

            // Obtenez les informations sur les publications ciblées
            function(userFound, done) {
                Post.findOne({
                        where: { id: req.params.id }
                    })
                    .then(function(postFound) {
                        done(null, userFound, postFound);
                    })
                    .catch(function(err) {
                        return res.status(500).json({ 'error': 'Post not found' });
                    });
            },

            function(userFound, postFound) {

                // Vérifie si l'utilisateur est le propriétaire de l'utilisateur ciblé
                if (userFound.id == postFound.userId || userFound.isAdmin == true) { // ou s'il est administrateur

                    // Suppression logicielle modifiant la publication de l'annonce à supprimé 
                    Post.destroy({
                            where: { id: req.params.id }
                        })
                        .then(() => res.status(200).json({ message: 'Post supprimé !' }))
                        .catch(error => res.status(400).json({ message: "Post introuvable", error: error }))

                } else {
                    res.status(401).json({ 'error': 'user not allowed' });
                }
            },
        ],

        function(userFound) {
            if (userFound) {
                return res.status(201).json({ 'message': 'post deleted' });
            } else {
                return res.status(500).json({ 'error': 'cannot delete post' });
            }
        });
};