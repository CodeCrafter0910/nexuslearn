const { summarizeText } = require('../services/llmService');
const { sendSuccess, sendError } = require('../utils/response');

const summarize = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return sendError(res, 'text field is required', 400);
    }

    const trimmed = text.trim();

    if (trimmed.length < 50) {
      return sendError(res, 'text is too short, minimum is 50 characters', 400);
    }

    if (trimmed.length > 10000) {
      return sendError(res, 'text is too large, maximum is 10000 characters', 413);
    }

    const result = await summarizeText(trimmed);

    return sendSuccess(res, result);
  } catch (err) {
    if (err?.status === 401) {
      return sendError(res, 'LLM API key is invalid', 502);
    }
    if (err?.status === 429) {
      return sendError(res, 'LLM provider rate limit hit, try again later', 502);
    }
    return sendError(res, 'Failed to get summary from LLM provider', 502);
  }
};

module.exports = { summarize };
