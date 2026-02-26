const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * Strip HTML tags for AI processing
 */
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Call Gemini with automatic retry on rate-limit (429) errors.
 * Retries up to 2 times with longer delays matching free-tier cooldown.
 */
async function callWithRetry(prompt, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      const isRateLimit =
        error.status === 429 ||
        error.message?.includes('429') ||
        error.message?.includes('RESOURCE_EXHAUSTED') ||
        error.message?.includes('retry');

      if (isRateLimit && attempt < maxRetries) {
        // Try to parse the retryDelay from Gemini's error (e.g. "retryDelay":"45s")
        let backoffMs = 15000 * (attempt + 1); // default: 15s, then 30s
        const delayMatch = error.message?.match(/retryDelay["\s:]+(\d+)/);
        if (delayMatch) {
          backoffMs = parseInt(delayMatch[1], 10) * 1000;
        }
        console.log(`⏳ Gemini rate limited. Waiting ${backoffMs / 1000}s before retry (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }

      throw error;
    }
  }
}

/**
 * Improve/rewrite article content using Gemini AI
 */
async function improveContent(content, mode = 'improve') {
  const plainText = stripHtml(content);

  const prompts = {
    improve: `You are a professional technical writer. Improve the following article content to make it clearer, better structured, and more professional. Keep the technical accuracy. Return ONLY the improved content in HTML format suitable for a rich text editor (use <p>, <h2>, <h3>, <strong>, <em>, <ul>, <li>, <code>, <pre> tags as appropriate). Do not include any explanation or preamble.\n\nContent:\n${plainText}`,
    grammar: `Fix all grammar, spelling, and punctuation errors in the following content. Keep the meaning and structure the same. Return ONLY the corrected content in HTML format (use <p>, <strong>, <em>, <code> tags as appropriate). Do not include any explanation.\n\nContent:\n${plainText}`,
    concise: `Make the following content more concise and to-the-point while keeping all important information. Return ONLY the concise version in HTML format (use <p>, <strong>, <em>, <code> tags as appropriate). Do not include any explanation.\n\nContent:\n${plainText}`,
    title: `Based on the following article content, suggest 3 better, more engaging titles. Return ONLY a JSON array of 3 title strings, nothing else.\n\nContent:\n${plainText}`,
  };

  try {
    let text = await callWithRetry(prompts[mode] || prompts.improve);

    // Clean markdown code fences if present
    text = text.replace(/```html\n?/gi, '').replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();

    return { success: true, data: text };
  } catch (error) {
    console.error('AI improve error:', error.message);
    return { success: false, error: 'AI service temporarily unavailable. Please try again in a few seconds.' };
  }
}

/**
 * Generate a short summary for an article
 */
async function generateSummary(content) {
  const plainText = stripHtml(content);

  try {
    let text = await callWithRetry(
      `Summarize the following technical article in 1-2 concise sentences (max 200 characters). Return ONLY the summary text, no quotes or explanation.\n\nArticle:\n${plainText}`
    );
    text = text.trim().replace(/^["']|["']$/g, '');
    return text;
  } catch (error) {
    console.error('AI summary error:', error.message);
    // Fallback: first 200 chars of plain text
    return plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
  }
}

/**
 * Suggest relevant tags based on article content
 */
async function suggestTags(content, title = '') {
  const plainText = stripHtml(content);

  try {
    let text = await callWithRetry(
      `Based on the following technical article, suggest 5-8 relevant tags. Return ONLY a JSON array of tag strings (lowercase, single or two words each). No explanation.\n\nTitle: ${title}\nContent: ${plainText}`
    );
    text = text.trim().replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    const tags = JSON.parse(text);
    return { success: true, tags };
  } catch (error) {
    console.error('AI tags error:', error.message);
    return { success: false, tags: [] };
  }
}

module.exports = { improveContent, generateSummary, suggestTags };
