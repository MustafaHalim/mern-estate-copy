import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import FacebookAuth from '../components/FacebookAuth';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"}}>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      <div className="w-full max-w-md p-8 mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl z-10">
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>Welcome Back</h1>
          <p className='text-gray-600'>Sign in to access your account</p>
        </div>
          
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4'>
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
              <input
                type='email'
                placeholder='Enter your email'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'
                id='email'
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <div className='flex items-center justify-between mb-1'>
                <label htmlFor='password' className='block text-sm font-medium text-gray-700'>Password</label>
                <Link to="/forgot-password" className='text-sm text-indigo-600 hover:text-indigo-800 transition-colors'>
                  Forgot Password?
                </Link>
              </div>
              <input
                type='password'
                placeholder='Enter your password'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors'
                id='password'
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            disabled={loading}
            className='w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed'
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          
          <div className='relative flex items-center justify-center'>
            <div className='border-t border-gray-300 absolute w-full'></div>
            <span className='bg-white px-4 text-sm text-gray-500 relative'>Or continue with</span>
          </div>
          
          <div className='space-y-3'>
            <OAuth />
            <FacebookAuth />
          </div>
        </form>
        
        <div className='text-center mt-6'>
          <span className='text-gray-600'>Don't have an account? </span>
          <Link to='/sign-up' className='text-indigo-600 hover:text-indigo-800 font-medium transition-colors'>
            Sign up
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