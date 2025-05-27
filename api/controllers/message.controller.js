import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';
import { errorHandler } from '../utils/error.js';

export const createMessage = async (req, res, next) => {
  try {
    const { receiverId, message, listingId, listingTitle } = req.body;
    
    if (!receiverId || !message || !listingId || !listingTitle) {
      return next(errorHandler(400, 'Missing required fields'));
    }
    
    const senderId = req.user.id;
    
    // Check if we already have a conversation between these users for this listing
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      listingId
    });
    
    // If no conversation exists, create one
    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        listingId,
        listingTitle,
        lastMessage: message,
        unreadCount: 1
      });
      await conversation.save();
    } else {
      // Update last message and unread count
      conversation.lastMessage = message;
      conversation.unreadCount += 1;
      await conversation.save();
    }
    
    // Create the message
    const newMessage = new Message({
      conversationId: conversation._id,
      senderId,
      receiverId,
      message,
      listingId,
      read: false
    });
    
    await newMessage.save();
    
    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return next(errorHandler(404, 'Conversation not found'));
    }
    
    if (!conversation.participants.includes(userId)) {
      return next(errorHandler(403, 'You are not authorized to access this conversation'));
    }
    
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Find all conversations where user is a participant
    const conversations = await Conversation.find({
      participants: userId
    }).sort({ updatedAt: -1 });
    
    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return next(errorHandler(404, 'Conversation not found'));
    }
    
    if (!conversation.participants.includes(userId)) {
      return next(errorHandler(403, 'You are not authorized to access this conversation'));
    }
    
    // Mark all messages as read where user is the receiver
    await Message.updateMany(
      { 
        conversationId, 
        receiverId: userId, 
        read: false 
      },
      { read: true }
    );
    
    // Reset unread count
    conversation.unreadCount = 0;
    await conversation.save();
    
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}; 