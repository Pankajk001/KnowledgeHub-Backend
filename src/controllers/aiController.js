const { improveContent, generateSummary, suggestTags } = require('../services/aiService');

// POST /api/ai/improve
const improve = async (req, res) => {
  try {
    const { content, mode } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required.' });
    }

    const validModes = ['improve', 'grammar', 'concise', 'title'];
    const selectedMode = validModes.includes(mode) ? mode : 'improve';

    const result = await improveContent(content, selectedMode);

    if (result.success) {
      res.json({ improved: result.data });
    } else {
      res.status(503).json({ error: result.error });
    }
  } catch (error) {
    console.error('AI improve error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// POST /api/ai/summarize
const summarize = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required.' });
    }

    const summary = await generateSummary(content);
    res.json({ summary });
  } catch (error) {
    console.error('AI summarize error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// POST /api/ai/suggest-tags
const suggestTagsHandler = async (req, res) => {
  try {
    const { content, title } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required.' });
    }

    const result = await suggestTags(content, title || '');

    if (result.success) {
      res.json({ tags: result.tags });
    } else {
      res.status(503).json({ error: 'AI service temporarily unavailable.', tags: [] });
    }
  } catch (error) {
    console.error('AI suggest tags error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { improve, summarize, suggestTagsHandler };
