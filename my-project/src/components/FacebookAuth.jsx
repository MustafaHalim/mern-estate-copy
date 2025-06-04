import { useNavigate } from 'react-router-dom';
import facebookIcon from '../assets/facebook.svg';

export default function FacebookAuth() {
  const navigate = useNavigate();
  
  const handleFacebookClick = () => {
    // This is a frontend-only button - no actual authentication implementation
    console.log('Facebook login clicked - Frontend only');
    alert('Facebook login is not implemented yet. This is frontend only.');
  };
  
  return (
    <button
      onClick={handleFacebookClick}
      type='button'
      className='flex items-center justify-center gap-2 bg-[#1877F2] text-white p-3 rounded-lg uppercase hover:opacity-95 w-full'
    >
      <img src={facebookIcon} alt="Facebook" className="w-6 h-6" />
      Continue with facebook
    </button>
  );
} 