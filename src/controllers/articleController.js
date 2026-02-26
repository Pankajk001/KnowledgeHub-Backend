const { Op } = require('sequelize');
const Article = require('../models/Article');
const User = require('../models/User');

// GET /api/articles — list all with search & filter
const getArticles = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { tags: { [Op.like]: `%${search}%` } },
      ];
    }

    if (category && category !== 'All') {
      where.category = category;
    }

    const { count, rows } = await Article.findAndCountAll({
      where,
      include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      articles: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalCount: count,
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/articles/:id — single article
const getArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'email'] }],
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    res.json({ article });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// POST /api/articles — create article
const createArticle = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required.' });
    }

    // Plain-text summary (first 200 chars, no AI call)
    const summary = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200);

    const article = await Article.create({
      title,
      content,
      summary,
      category,
      tags: tags || '',
      author_id: req.user.id,
    });

    const fullArticle = await Article.findByPk(article.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
    });

    res.status(201).json({ message: 'Article created successfully.', article: fullArticle });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// PUT /api/articles/:id — update article (author only)
const updateArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    if (article.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own articles.' });
    }

    const { title, content, category, tags } = req.body;
    const contentChanged = content && content !== article.content;

    await article.update({
      title: title || article.title,
      content: content || article.content,
      summary: contentChanged
        ? content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200)
        : article.summary,
      category: category || article.category,
      tags: tags !== undefined ? tags : article.tags,
    });

    const updated = await Article.findByPk(article.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
    });

    res.json({ message: 'Article updated successfully.', article: updated });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// DELETE /api/articles/:id — delete article (author only)
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    if (article.author_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own articles.' });
    }

    await article.destroy();
    res.json({ message: 'Article deleted successfully.' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/articles/user/me — get current user's articles
const getMyArticles = async (req, res) => {
  try {
    const articles = await Article.findAll({
      where: { author_id: req.user.id },
      include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
      order: [['created_at', 'DESC']],
    });

    res.json({ articles });
  } catch (error) {
    console.error('Get my articles error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getArticles, getArticle, createArticle, updateArticle, deleteArticle, getMyArticles };
