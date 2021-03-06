'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Tout avant est créé par Sequelize

db.user = require("./User")(sequelize, Sequelize)
db.post = require("./Post")(sequelize, Sequelize)
db.comment = require("./Comment")(sequelize, Sequelize)

// posts
db.user.hasMany(db.post);

db.post.belongsTo(db.user, {
    foreignKey: "userId",
});

// Ccomments
db.user.hasMany(db.comment);

db.comment.belongsTo(db.user, {
    foreignKey: "userId",
});
db.post.hasMany(db.comment);

db.comment.belongsTo(db.post, {
    foreignKey: "postId",
});

module.exports = db;