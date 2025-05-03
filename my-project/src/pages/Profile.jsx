import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = async (file) => {
    const cloudName = 'dbzsledh2';
    const uploadPreset = 'listing_uploads';

    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', uploadPreset);

    try {
      setFileUploadError(false);
      setFilePerc(0);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: form,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, avatar: data.secure_url });
        setFilePerc(100);
      } else {
        setFileUploadError(true);
      }
    } catch (error) {
      setFileUploadError(true);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-white to-blue-100 relative overflow-x-hidden'>
      <svg
        className='absolute top-0 left-0 w-full h-full'
        xmlns='http://www.w3.org/2000/svg'
        preserveAspectRatio='none'
        viewBox='0 0 1440 320'
      >
        <path
          fill='#e0f2fe'
          fillOpacity='1'
          d='M0,192L80,170.7C160,149,320,107,480,101.3C640,96,800,128,960,160C1120,192,1280,224,1360,240L1440,256L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z'
        ></path>
      </svg>

      <div className='p-5 max-w-4xl mx-auto relative z-10'>
        <h1 className='text-4xl font-bold text-center my-8 text-blue-800'>Profile</h1>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type='file'
            ref={fileRef}
            hidden
            accept='image/*'
          />

          <div className='flex justify-center'>
            <img
              onClick={() => fileRef.current.click()}
              src={formData.avatar || currentUser.avatar}
              alt='profile'
              className='rounded-full h-32 w-32 object-cover cursor-pointer border-4 border-white shadow-lg hover:shadow-xl transition duration-300'
            />
          </div>

          <p className='text-sm text-center mt-2'>
            {fileUploadError ? (
              <span className='text-red-700'>
                Error uploading image (must be less than 2 MB)
              </span>
            ) : filePerc > 0 && filePerc < 100 ? (
              <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
            ) : filePerc === 100 ? (
              <span className='text-green-700'>Image uploaded successfully!</span>
            ) : (
              ''
            )}
          </p>

          <input
            type='text'
            placeholder='Username'
            defaultValue={currentUser.username}
            id='username'
            className='border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200'
            onChange={handleChange}
          />

          <input
            type='email'
            placeholder='Email'
            id='email'
            defaultValue={currentUser.email}
            className='border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200'
            onChange={handleChange}
          />

          <input
            type='password'
            placeholder='Password'
            onChange={handleChange}
            id='password'
            className='border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200'
          />

          <button
            disabled={loading}
            className='bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg p-3 uppercase hover:opacity-90 transition duration-200 disabled:opacity-80'
          >
            {loading ? 'Loading...' : 'Update'}
          </button>

          <Link
            className='bg-gradient-to-r from-green-400 to-green-600 text-white p-3 rounded-lg uppercase text-center hover:opacity-90 transition duration-200'
            to={'/create-listing'}
          >
            Create Listing
          </Link>
        </form>

        <div className='flex justify-between mt-5'>
          <span
            onClick={handleDeleteUser}
            className='text-red-700 cursor-pointer hover:underline'
          >
            Delete account
          </span>
          <span
            onClick={handleSignOut}
            className='text-red-700 cursor-pointer hover:underline'
          >
            Sign out
          </span>
        </div>

        <p className='text-red-700 mt-5'>{error ? error : ''}</p>
        <p className='text-green-700 mt-5'>
          {updateSuccess ? 'User updated successfully!' : ''}
        </p>

        <button
          onClick={handleShowListings}
          className='text-white bg-gradient-to-r from-blue-400 to-blue-600 w-full mt-5 py-2 rounded-lg hover:opacity-90 transition duration-200'
        >
          Show Listings
        </button>

        <p className='text-red-700 mt-5'>
          {showListingsError ? 'Error showing listings' : ''}
        </p>

        {userListings && userListings.length > 0 && (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8'>
            {userListings.map((listing) => (
              <div
                key={listing._id}
                className='bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-between gap-4 transition hover:shadow-lg'
              >
                <Link to={`/listing/${listing._id}`} className='w-full'>
                  <img
                    src={listing.imageUrls[0]}
                    alt='listing cover'
                    className='h-40 w-full object-cover rounded-lg'
                  />
                </Link>
                <Link
                  className='text-blue-700 font-semibold hover:underline truncate w-full text-center'
                  to={`/listing/${listing._id}`}
                >
                  <p>{listing.name}</p>
                </Link>

                <div className='flex justify-between w-full'>
                  <button
                    onClick={() => handleListingDelete(listing._id)}
                    className='text-sm text-red-600 hover:underline'
                  >
                    Delete
                  </button>
                  <Link to={`/update-listing/${listing._id}`}>
                    <button className='text-sm text-green-600 hover:underline'>
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
