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

export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { deleteType } = req.body; // "self" or "everyone"
    const userId = req.user.id;
    
    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return next(errorHandler(404, 'Message not found'));
    }
    
    // Check if the user is the sender of the message
    if (message.senderId !== userId) {
      return next(errorHandler(403, 'You can only delete messages you sent'));
    }
    
    if (deleteType === 'everyone') {
      // Delete the message completely
      await Message.findByIdAndDelete(messageId);
      
      // If this was the last message in the conversation, update the last message
      const conversation = await Conversation.findById(message.conversationId);
      
      if (conversation && conversation.lastMessage === message.message) {
        // Find the new last message
        const lastMessage = await Message.findOne({ 
          conversationId: message.conversationId 
        }).sort({ createdAt: -1 });
        
        if (lastMessage) {
          conversation.lastMessage = lastMessage.message;
        } else {
          conversation.lastMessage = '';
        }
        
        await conversation.save();
      }
      
      return res.status(200).json({ success: true, deleted: 'everyone' });
    } else {
      // Mark as deleted for this user only (we can add a "deletedFor" array to the message model for this)
      // For now, we'll just delete it completely as the "deletedFor" array isn't implemented yet
      await Message.findByIdAndDelete(messageId);
      
      return res.status(200).json({ success: true, deleted: 'self' });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return next(errorHandler(404, 'Conversation not found'));
    }
    
    // Check if the user is part of the conversation
    if (!conversation.participants.includes(userId)) {
      return next(errorHandler(403, 'You can only delete conversations you are part of'));
    }
    
    // For now, we'll delete the conversation and all its messages for simplicity
    // In a more advanced implementation, we could mark it as deleted for the specific user
    
    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId });
    
    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}; 