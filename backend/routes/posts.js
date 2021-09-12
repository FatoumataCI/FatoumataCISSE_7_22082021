const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const commentsCtrl = require('../controllers/commentsCtrl');

// comments routs
router.post('/:id/comment', auth, commentsCtrl.createComment);
router.get('/comment', auth, commentsCtrl.getAllComments);
router.delete('/:id/comment', auth, commentsCtrl.deleteComment);

module.exports = router;