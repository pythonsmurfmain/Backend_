import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';

import User from './models/User.js';
import Message from './models/Message.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'https://chat28410.vercel.app',
  credentials: true,
}));

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Root route for health check
app.get('/', (req, res) => {
  res.send('✅ Chat backend is live.');
});

// ✅ Login route
app.post('/api/login', async (req, res) => {
  const { username } = req.body;
  const sessionId = uuidv4();

  let user = await User.findOne({ username });

  if (!user) {
    user = await User.create({ username, sessionId });
  } else {
    user.sessionId = sessionId;
    await user.save();
  }

  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.json({ username: user.username });
});

// ✅ Auto-login route
app.get('/api/me', async (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) return res.status(401).json({ error: 'Not logged in' });

  const user = await User.findOne({ sessionId });
  if (!user) return res.status(403).json({ error: 'Invalid session' });

  res.json({ username: user.username });
});

// ✅ Middleware to verify session
async function verifySession(req, res, next) {
  const sessionId = req.cookies.sessionId;
  const { sender } = req.body;

  if (!sessionId || !sender) {
    return res.status(401).json({ error: 'Missing session info' });
  }

  const user = await User.findOne({ username: sender });

  if (!user || user.sessionId !== sessionId) {
    return res.status(403).json({ error: 'Invalid session' });
  }

  next();
}

// ✅ Save message (protected)
app.post('/api/messages', verifySession, async (req, res) => {
  const { sender, text } = req.body;
  const message = await Message.create({ sender, text });
  res.json(message);
});

// ✅ Get messages (public)
app.get('/api/messages', async (req, res) => {
  const messages = await Message.find().sort({ createdAt: 1 });
  res.json(messages);
});

// ✅ Start server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
