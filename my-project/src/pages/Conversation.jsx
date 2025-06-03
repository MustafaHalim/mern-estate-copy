import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoArrowBack } from "react-icons/io5";
import MessageItem from '../components/MessageItem';
import MessageInput from '../components/MessageInput';

export default function Conversation() {
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Fetch conversation details and messages
  useEffect(() => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    
    const fetchConversation = async () => {
      try {
        // Fetch messages
        const messagesRes = await fetch(`/api/messages/${conversationId}`);
        const messagesData = await messagesRes.json();
        
        if (!messagesRes.ok) {
          throw new Error(messagesData.message || 'Could not fetch messages');
        }
        
        setMessages(messagesData);
        
        // Fetch conversations to get the conversation details
        const conversationsRes = await fetch('/api/messages/conversations');
        const conversationsData = await conversationsRes.json();
        
        if (!conversationsRes.ok) {
          throw new Error(conversationsData.message || 'Could not fetch conversations');
        }
        
        const currentConversation = conversationsData.find(
          (conv) => conv._id === conversationId
        );
        
        if (!currentConversation) {
          throw new Error('Conversation not found');
        }
        
        setConversation(currentConversation);
        
        // Find the other user in the conversation
        const otherUserId = currentConversation.participants.find(
          (id) => id !== currentUser._id
        );
        
        // Fetch other user details
        const userRes = await fetch(`/api/user/${otherUserId}`);
        const userData = await userRes.json();
        
        if (!userRes.ok) {
          throw new Error(userData.message || 'Could not fetch user details');
        }
        
        setOtherUser(userData);
        
        // Mark messages as read
        await fetch(`/api/messages/read/${conversationId}`, {
          method: 'PUT'
        });
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversation();
    
    // Poll for new messages every 10 seconds
    const interval = setInterval(() => {
      fetchConversation();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [conversationId, currentUser, navigate]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (messageText) => {
    if (sendingMessage) return;
    
    setSendingMessage(true);
    setError(null);
    
    try {
      const res = await fetch('/api/messages/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: otherUser._id,
          message: messageText,
          listingId: conversation.listingId,
          listingTitle: conversation.listingTitle,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send message');
      }
      
      // Add the new message to the messages list
      setMessages([...messages, data]);
    } catch (error) {
      setError(error.message);
    } finally {
      setSendingMessage(false);
    }
  };
  
  const handleDeleteMessage = (messageId, deleteType) => {
    // Update the UI by removing the deleted message
    const updatedMessages = messages.filter(msg => msg._id !== messageId);
    setMessages(updatedMessages);
    
    // If we deleted the last message, update the lastMessage in the UI
    if (messages.length > 0 && updatedMessages.length > 0 && messages[messages.length - 1]._id === messageId) {
      // The last message was deleted, so we need to show the new last message
      scrollToBottom();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-screen bg-[url('/chat-bg-pattern.svg')] bg-repeat"
    >
      {/* Header */}
      <div className="bg-white shadow-sm p-3 flex items-center justify-between border-b bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          <Link to="/messages" className="text-gray-600 hover:text-gray-900 bg-gray-100 p-2 rounded-full transition-colors hover:bg-gray-200">
            <IoArrowBack className="text-xl" />
          </Link>
          
          {loading ? (
            <div className="h-10 w-40 bg-gray-200 animate-pulse rounded-md"></div>
          ) : otherUser ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm">
                <img 
                  src={otherUser.avatar} 
                  alt={otherUser.username} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h2 className="font-medium text-gray-800">{otherUser.username}</h2>
                {conversation && (
                  <p className="text-xs text-gray-500 flex items-center">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                    Re: {conversation.listingTitle}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-white bg-opacity-90 relative">
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-[url('/chat-conversation-bg.svg')] bg-repeat opacity-30 pointer-events-none"
          aria-hidden="true"
        ></div>
        
        {/* Actual messages with relative positioning to appear above the background */}
        <div className="relative z-10">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : messages.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <MessageItem 
                  key={message._id} 
                  message={message} 
                  onDelete={handleDeleteMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
      
      {/* Message input */}
      <MessageInput 
        onSendMessage={handleSendMessage} 
        disabled={loading || sendingMessage || !otherUser} 
      />
    </motion.div>
  );
}