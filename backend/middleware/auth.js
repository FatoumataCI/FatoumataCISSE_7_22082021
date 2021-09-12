const jwt = require('jsonwebtoken');
require('dotenv').config();

//bloc try catch pour gerer les erreurs
module.exports = (req, res, next) => {
    try {
        // Vérifiez les 2 deuxièmes éléments (token) dans la partie autorisation dans les en-têtes de la demande
        const token = req.headers.authorization.split(' ')[1];
        // vérifier si le token est le même que celui requis
        const decodedToken = jwt.verify(token, process.env.DB_TOKEN);
        // conserver l'identifiant donné dans le token
        const userId = decodedToken.userId;
        // si l'ID utilisateur n'est pas le même que celui enregistré -> erreur
        if (req.body.userId && req.body.userId !== userId) {
            throw 'ID utilisateur non valide!';
        } else {
            // si c'est la même chose, continuez -> juste un middleware
            req.token = token;
            req.body.userId = userId;
            /* Remplacez tout userId donné par celui déchiffré dans le token
             *Le seul userId authentifié qui compte se trouve dans le token */
      //si tout est bon, on peu passer la requete au prochain middleware

            next();
        }
    } catch {
        return res.status(401).json({
                  //probleme d'authentification

            error: new Error('Invalid request!')
        });
    }
};