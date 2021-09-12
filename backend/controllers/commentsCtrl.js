//imports
const db = require("../models/index");
const Comment = db.comment;
const User = db.user;
const asyncLib = require('async');

//creer 
exports.createComment = (req, res, next) => {

    //parametres
    const content = req.body;

    if (content == null) {
        return res.status(400).json({ 'error': 'missing body' });
    }

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

        //si trouvé, créer un commentaire avec entrée
        function(userFound, done) {
            if (userFound) {
                // Créez le message et enregistrez-le dans DB
                Comment.create({
                        content: req.body.content,
                        UserId: userFound.id,
                        postId: req.params.id,
                    })
                    .then(function(newComment) {
                        done(newComment)
                    })
                    .catch(() => res.status(400).json({ message: "erreur commentaire controller" }));
            } else {
                res.status(404).json({ 'error': 'user not found' });
            }
        },

        // si ok confirme-le
    ], function(newComment) {
        if (newComment) {
            return res.status(201).json(newComment);
        } else {
            return res.status(500).json({ 'error': 'cannot send comment' });
        }
    })
};

//tout
exports.getAllComments = (req, res, next) => {

        Comment.findAll({
                include: [{ // Lie la publication avec les tableaux Utilisateur et Commentaires
                    model: User,
                    attributes: ['pseudo', 'imageUrl', 'isAdmin']
                }]
            })
            .then((comment => res.status(200).json(comment)))
            .catch(() => res.status(400).json({ error: "Erreur lors de l'affichage des commentaires" }));
    },


    // supprimer
    exports.deleteComment = (req, res, next) => {

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

                // Obtenez les informations des commentaires ciblés
                function(userFound, done) {
                    Comment.findOne({
                            where: { id: req.params.id }
                        })
                        .then(function(commentFound) {
                            done(null, userFound, commentFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ 'error': 'Comment not found' });
                        });
                },

                function(userFound, commentFound, done) {

                    // Vérifie si l'utilisateur est le propriétaire de l'utilisateur ciblé
                    if (userFound.id == commentFound.userId || userFound.isAdmin == true) { // ou s'il est administrateur

                        // Suppression logicielle modifiant la publication de l'annonce à supprimé 
                        Comment.destroy({
                                where: { id: req.params.id }
                            })
                            .then(() => res.status(200).json({ message: 'Comment supprimé !' }))
                            .catch(error => res.status(400).json({ error }));

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