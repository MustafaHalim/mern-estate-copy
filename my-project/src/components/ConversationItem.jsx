import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function ConversationItem({ conversation }) {
  const { currentUser } = useSelector((state) => state.user);
  const [otherUser, setOtherUser] = useState(null);
  
  useEffect(() => {
    const fetchOtherUser = async () => {
      // Find the other participant ID who is not the current user
      const otherUserId = conversation.participants.find(
        (id) => id !== currentUser._id
      );
      
      try {
        const res = await fetch(`/api/user/${otherUserId}`);
        const data = await res.json();
        setOtherUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    fetchOtherUser();
  }, [conversation, currentUser]);
  
  if (!otherUser) return <div className="animate-pulse h-16 bg-gray-100 rounded-md"></div>;
  
  return (
    <Link
      to={`/messages/${conversation._id}`}
      className="block"
    >
      <div className={`p-4 border-b hover:bg-gray-50 transition-colors flex items-center gap-3 ${conversation.unreadCount > 0 ? 'bg-blue-50' : ''}`}>
        <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
          <img 
            src={otherUser.avatar} 
            alt={otherUser.username} 
            className="h-full w-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-medium truncate">{otherUser.username}</h3>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 truncate">
              {conversation.lastMessage}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {conversation.unreadCount}
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-1 truncate">
            Re: {conversation.listingTitle}
          </p>
        </div>
      </div>
    </Link>
  );
} 