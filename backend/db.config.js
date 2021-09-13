const mysql = require('mysql');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({

    host: '127.0.0.1',

    user: 'root',

    password: '',

    database: '',

    dialect: "mysql"

});

const db = {};
try {
    db;
    console.log('Connecté à la base de données MySQL!');
} catch (error) {
    console.error('Impossible de se connecter à MySQL :', error);
}

db.Sequelize = Sequelize;
db.sequelize = sequelize;