import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
});

router.post('/', async (req, res) => {
  const { sender, text } = req.body;
  const msg = await Message.create({ sender, text });
  res.json(msg);
});

export default router;
