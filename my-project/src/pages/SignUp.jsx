import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log(data);

      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }

      setLoading(false);
      setError(null);
      navigate('/sign-in');
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"}}>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      <div className="w-full max-w-md p-8 mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl z-10">
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>Create an Account</h1>
          <p className='text-gray-600'>Join our real estate community today</p>
        </div>
          
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4'>
            <div>
              <label htmlFor='username' className='block text-sm font-medium text-gray-700 mb-1'>Username</label>
              <input
                type='text'
                placeholder='Choose a username'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'
                id='username'
                name='username'
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
              <input
                type='email'
                placeholder='Enter your email'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
              <input
                type='password'
                placeholder='Create a password'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'
                id='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            disabled={loading}
            className='w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed'
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          
          <div className='relative flex items-center justify-center'>
            <div className='border-t border-gray-300 absolute w-full'></div>
            <span className='bg-white px-4 text-sm text-gray-500 relative'>Or sign up with</span>
          </div>
          
          <OAuth />
        </form>
        
        <div className='text-center mt-6'>
          <span className='text-gray-600'>Already have an account? </span>
          <Link to='/sign-in' className='text-indigo-600 hover:text-indigo-800 font-medium transition-colors'>
            Sign in
          </Link>
        </div>
        {error && (
          <div className='bg-red-50 text-red-700 p-3 rounded-lg text-center mt-4'>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
