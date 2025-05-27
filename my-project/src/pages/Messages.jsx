import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ConversationItem from '../components/ConversationItem';
import { motion } from 'framer-motion';

export default function Messages() {
  const { currentUser } = useSelector((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }
    
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/messages/conversations');
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || 'Could not fetch conversations');
        }
        
        setConversations(data);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
  }, [currentUser, navigate]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto p-3 py-8"
    >
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-4">You don't have any messages yet.</p>
            <p>
              When you contact a property owner, your conversations will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation) => (
              <ConversationItem 
                key={conversation._id} 
                conversation={conversation} 
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
} 