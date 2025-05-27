import { useState } from 'react';
import { IoSend } from "react-icons/io5";

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
      className="flex items-center gap-2 border-t p-3 bg-white"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={disabled}
      />
      <button
        type="submit"
        className={`p-2 rounded-full bg-blue-500 text-white ${
          disabled || !message.trim() 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-blue-600'
        }`}
        disabled={disabled || !message.trim()}
      >
        <IoSend />
      </button>
    </form>
  );
} 