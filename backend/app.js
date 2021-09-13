// Imports
const express = require('express')//est un framework pour construire des applications web basées sur Node.js
const app = express(); //creation de l'app
const path = require("path"); //est une variable d'environnement qui liste les répertoires dans lesquels peuvent être placés des fichiers exécutables
const xss = require('xss-clean');
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");

// routes
const postsRoutes = require("./routes/posts");
const usersRoutes = require("./routes/users");
const commentsRoutes = require("./routes/comments");

require('dotenv').config(); // plugin de code privé
const cors = require('cors'); // Plugin d'appels d'API
const bodyParser = require('body-parser');
require("./db.config");

app.disable("x-powered-by");

// middleware general 1 pour definir les headers de toutes les requetes
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// middleware qui permet l'accès statique à des images _dirname= nom du dossier
app.use('/images', express.static(path.join(__dirname, 'images')));

// sanitize des entrées contre les attaques XXS
app.use(xss());

// Définir les en-têtes HTTP 
app.use(helmet());

// Limiter plusieurs sessions dans un court laps de temps pour éviter les attaques de force
app.use(rateLimit());


app.use(cors());

app.use('/api/post', postsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/post', commentsRoutes);


// Exportation de l'app pour utilisation par d'autres fichiers, nottament le serveur Node.
module.exports = app;