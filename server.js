import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import User from './models/User.js';
import Message from './models/Message.js';

dotenv.config();
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Auth routes
app.post('/api/login', async (req, res) => {
  const { username } = req.body;
  let user = await User.findOne({ username });
  if (!user) user = await User.create({ username });
  res.json(user);
});

// Save message
app.post('/api/messages', async (req, res) => {
  const { sender, text } = req.body;
  const message = await Message.create({ sender, text });
  res.json(message);
});

// Get all messages
app.get('/api/messages', async (req, res) => {
  const messages = await Message.find().sort({ createdAt: 1 });
  res.json(messages);
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
