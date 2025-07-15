import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid'; // 🔑 for unique session IDs
import User from './models/User.js';
import Message from './models/Message.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS: Only allow frontend
app.use(cors({
  origin: 'https://chat28410.vercel.app',
  credentials: true,
}));

app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Login route with sessionId
app.post('/api/login', async (req, res) => {
  const { username } = req.body;
  const sessionId = uuidv4(); // generate unique session ID

  let user = await User.findOne({ username });

  if (!user) {
    user = await User.create({ username, sessionId });
  } else {
    user.sessionId = sessionId; // invalidate old session
    await user.save();
  }

  res.json({ username: user.username, sessionId });
});

// ✅ Middleware to verify session
async function verifySession(req, res, next) {
  const { sender, sessionId } = req.body;

  if (!sender || !sessionId) {
    return res.status(401).json({ error: 'Missing session info' });
  }

  const user = await User.findOne({ username: sender });

  if (!user || user.sessionId !== sessionId) {
    return res.status(403).json({ error: 'Invalid session. Please login again.' });
  }

  next();
}

// ✅ Save message (with session check)
app.post('/api/messages', verifySession, async (req, res) => {
  const { sender, text } = req.body;
  const message = await Message.create({ sender, text });
  res.json(message);
});

// ✅ Get messages (no session needed)
app.get('/api/messages', async (req, res) => {
  const messages = await Message.find().sort({ createdAt: 1 });
  res.json(messages);
});

// ✅ Start server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
