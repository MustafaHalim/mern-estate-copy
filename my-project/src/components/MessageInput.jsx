import { useState } from 'react';
import { IoSend, IoHappy } from "react-icons/io5";

export default function MessageInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    onSendMessage(message);
    setMessage('');
  };
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center gap-2 border-t p-3 bg-white shadow-md"
    >
      <button
        type="button"
        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        disabled={disabled}
      >
        <IoHappy size={20} />
      </button>
      
      <div className="flex-1 relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full p-2.5 pl-4 pr-4 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
          disabled={disabled}
        />
      </div>
      
      <button
        type="submit"
        className={`p-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm ${
          disabled || !message.trim() 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:from-blue-600 hover:to-blue-700 transition-all'
        }`}
        disabled={disabled || !message.trim()}
      >
        <IoSend size={18} />
      </button>
    </form>
  );
} 