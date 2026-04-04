const express = require('express');
const router = express.Router();
const axios = require('axios');

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

router.post('/chat', async (req, res) => {
  const { messages, articleContext } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: 'messages 不能为空' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: '服务端未配置 AI API Key' });
  }

  const plainText = articleContext ? stripHtml(articleContext) : '';
  const systemPrompt = plainText
    ? `你是一位专业的博客助手，帮助读者理解当前这篇文章。请基于以下文章内容回答读者的问题，如果问题超出文章范围，也可以结合相关知识作答，但请注明。\n\n文章内容：\n${plainText.slice(0, 3000)}`
    : '你是一位专业的博客助手，帮助读者理解文章内容，回答读者的问题。';

  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.deepseek.com/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      data: {
        model: 'deepseek-chat',
        messages: fullMessages,
        stream: true,
      },
      responseType: 'stream',
      timeout: 60000,
    });

    response.data.on('data', (chunk) => {
      res.write(chunk);
    });

    response.data.on('end', () => {
      res.end();
    });

    response.data.on('error', (err) => {
      res.end();
    });

  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.error?.message || err.message || 'AI 服务调用失败';
    if (!res.headersSent) {
      res.status(status).json({ message });
    } else {
      res.end();
    }
  }
});

module.exports = router;
