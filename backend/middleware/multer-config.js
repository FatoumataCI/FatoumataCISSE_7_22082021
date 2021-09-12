const multer = require('multer');


//extensions types d'images
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/.gif': 'gif'
};
// Délimiter la taille des fichiers
const maxSize = 1 * 20000 * 20000;


//objet de configuration 3arguments null sans erreur
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },

    filename: (req, file, callback) => {
        // remplacer les espaces par _ dans le nom de fichier
        const name = file.originalname.split(' ').join('_');
        // ajouter une extension
        const extension = MIME_TYPES[file.mimetype];
        // ajouter un timestamp pour un nom de fichier unique
        callback(null, name + Date.now() + '.' + extension);
    },
    limits: { fileSize: maxSize }
});
//methode single = fichier unique, image uniquement
module.exports = multer({ storage: storage }).single('image');