import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema({
  sender: String,
  text: String,
}, { timestamps: true });
export default mongoose.model('Message', messageSchema);
