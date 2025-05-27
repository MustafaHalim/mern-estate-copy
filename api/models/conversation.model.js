import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: Array,
      required: true,
    },
    listingId: {
      type: String,
      required: true,
    },
    listingTitle: {
      type: String,
      required: true,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation; 