const express = require('express');
const router = express.Router();
const { improve, summarize, suggestTagsHandler } = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');

// All AI routes require authentication
router.post('/improve', authMiddleware, improve);
router.post('/summarize', authMiddleware, summarize);
router.post('/suggest-tags', authMiddleware, suggestTagsHandler);

module.exports = router;
