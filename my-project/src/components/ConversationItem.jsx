import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { IoEllipsisVertical, IoTrash } from 'react-icons/io5';

export default function ConversationItem({ conversation, onDelete }) {
  const { currentUser } = useSelector((state) => state.user);
  const [otherUser, setOtherUser] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);
  const navigate = useNavigate();
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
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
  
  const handleDelete = async (e) => {
    e.preventDefault(); // Prevent navigating to the conversation
    e.stopPropagation(); // Stop event bubbling
    
    if (!window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/messages/conversation/${conversation._id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete conversation');
      }
      
      // Notify parent component to update the UI
      if (onDelete) {
        onDelete(conversation._id);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete conversation. Please try again.');
    }
  };
  
  if (!otherUser) return <div className="animate-pulse h-16 bg-gray-100 rounded-md"></div>;
  
  return (
    <div className="relative group">
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
      
      {/* Options button */}
      <div 
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
        ref={optionsRef}
      >
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowOptions(!showOptions);
          }}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
        >
          <IoEllipsisVertical />
        </button>
        
        {/* Options menu */}
        {showOptions && (
          <div className="absolute right-0 top-8 bg-white rounded-md shadow-lg p-1 w-32 z-10">
            <button
              onClick={handleDelete}
              className="w-full text-left p-2 text-red-500 text-sm flex items-center gap-2 hover:bg-gray-100 rounded-md"
            >
              <IoTrash />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 