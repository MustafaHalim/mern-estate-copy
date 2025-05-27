import { useSelector } from 'react-redux';
import { format } from 'date-fns';

export default function MessageItem({ message }) {
  const { currentUser } = useSelector((state) => state.user);
  const isOwnMessage = message.senderId === currentUser._id;
  
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[70%] p-3 rounded-lg ${
          isOwnMessage 
            ? 'bg-blue-500 text-white rounded-tr-none'
            : 'bg-gray-200 text-gray-800 rounded-tl-none'
        }`}
      >
        <p className="text-sm">{message.message}</p>
        <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
          {format(new Date(message.createdAt), 'p')}
          {isOwnMessage && (
            <span className="ml-2">
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 