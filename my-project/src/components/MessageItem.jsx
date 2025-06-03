import { useSelector } from 'react-redux';
import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { IoEllipsisVertical, IoTrash } from 'react-icons/io5';

export default function MessageItem({ message, onDelete }) {
  const { currentUser } = useSelector((state) => state.user);
  const isOwnMessage = message.senderId === currentUser._id;
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const optionsRef = useRef(null);
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
        setShowDeleteOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleDelete = async (type) => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/messages/delete/${message._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deleteType: type }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete message');
      }
      
      // Close all menus
      setShowOptions(false);
      setShowDeleteOptions(false);
      
      // Update parent component
      if (onDelete) {
        onDelete(message._id, type);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div 
        className={`max-w-[70%] p-3 rounded-lg relative shadow-sm ${
          isOwnMessage 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-none border border-blue-400'
            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 rounded-tl-none border border-gray-200'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.message}</p>
        <div className={`text-xs mt-1 flex items-center justify-between ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
          <span className="font-light">{format(new Date(message.createdAt), 'p')}</span>
          <div className="flex items-center">
            {isOwnMessage && (
              <span className="mx-2">
                {message.read ? '✓✓' : '✓'}
              </span>
            )}
            
            {/* Options button - only show for own messages */}
            {isOwnMessage && (
              <div className="relative" ref={optionsRef}>
                <button 
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                  onClick={() => setShowOptions(!showOptions)}
                  aria-label="Message options"
                >
                  <IoEllipsisVertical size={14} />
                </button>
                
                {/* Options menu */}
                {showOptions && (
                  <div className="absolute bottom-6 right-0 bg-white rounded-md shadow-lg p-1 w-28 z-10 border border-gray-100">
                    <button
                      className="w-full text-left p-2 text-red-500 text-xs flex items-center gap-2 hover:bg-gray-100 rounded-md"
                      onClick={() => setShowDeleteOptions(true)}
                    >
                      <IoTrash />
                      Delete
                    </button>
                  </div>
                )}
                
                {/* Delete options */}
                {showDeleteOptions && (
                  <div className="absolute bottom-6 right-0 bg-white rounded-md shadow-lg p-2 w-48 z-10 border border-gray-100">
                    <p className="text-xs mb-2 text-gray-600">Delete message for:</p>
                    <div className="space-y-1">
                      <button
                        className="w-full text-left p-2 text-xs hover:bg-gray-100 rounded-md text-gray-700"
                        onClick={() => handleDelete('self')}
                        disabled={isDeleting}
                      >
                        Delete for me
                      </button>
                      <button
                        className="w-full text-left p-2 text-xs hover:bg-gray-100 rounded-md text-red-500"
                        onClick={() => handleDelete('everyone')}
                        disabled={isDeleting}
                      >
                        Delete for everyone
                      </button>
                    </div>
                    {isDeleting && (
                      <div className="text-xs text-center mt-2 text-gray-500">
                        Deleting...
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 