const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  getMyArticles,
} = require('../controllers/articleController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.get('/', getArticles);
router.get('/user/me', authMiddleware, getMyArticles);
router.get('/:id', getArticle);

// Protected routes
router.post('/', authMiddleware, createArticle);
router.put('/:id', authMiddleware, updateArticle);
router.delete('/:id', authMiddleware, deleteArticle);

module.exports = router;
