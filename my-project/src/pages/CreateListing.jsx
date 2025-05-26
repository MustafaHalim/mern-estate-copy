import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import MapSelector from '../components/MapSelector';
import { motion } from 'framer-motion';
import { FaHome, FaMapMarkerAlt, FaImages, FaInfoCircle } from 'react-icons/fa';

// دالة مساعدة للـ Reverse Geocoding
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return data.display_name || '';
  } catch {
    return '';
  }
};

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
    latitude: null,
    longitude: null,
    size: '', // مساحة العقار جديدة
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapError, setMapError] = useState('');

  const handleImageSubmit = async (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const urls = [];
      for (const file of files) {
        const url = await storeImage(file);
        if (url) {
          urls.push(url);
        } else {
          setImageUploadError('Image upload failed (2 mb max per image)');
          setUploading(false);
          return;
        }
      }
      setFormData({ ...formData, imageUrls: formData.imageUrls.concat(urls) });
      setImageUploadError(false);
      setUploading(false);
    } else {
      setImageUploadError('You can only upload up to 6 images per listing');
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    const cloudName = 'dbzsledh2';
    const uploadPreset = 'listing_uploads';

    const formDataCloud = new FormData();
    formDataCloud.append('file', file);
    formDataCloud.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formDataCloud,
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.secure_url;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return null;
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    if (id === 'sale' || id === 'rent') {
      setFormData({ ...formData, type: id });
      return;
    }
    if (id === 'parking' || id === 'furnished' || id === 'offer') {
      setFormData({ ...formData, [id]: checked });
      return;
    }
    setFormData({ ...formData, [id]: value });
  };

  // لما المستخدم يحدد موقع على الخريطة، نجيب العنوان ونعبيه تلقائياً في حقل العنوان
  const handleLocationSelect = async (location) => {
    if (!location) return;
    setFormData((prev) => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
    }));
    setMapError('');
    const address = await reverseGeocode(location.lat, location.lng);
    if (address) {
      setFormData((prev) => ({
        ...prev,
        address,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      setMapError('Please select location on the map');
      return;
    }
    if (formData.imageUrls.length < 1) {
      setError('You must upload at least one image');
      return;
    }
    if (+formData.regularPrice < +formData.discountPrice) {
      setError('Discount price must be lower than regular price');
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
        return;
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-8 text-gray-900"
        >
          Create a Listing
        </motion.h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 space-y-6"
          >
            <div className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <FaInfoCircle className="text-blue-600" />
              <h2>Basic Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Name
                </label>
                <input
                  type="text"
                  placeholder="Enter property name"
                  className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  id="name"
                  maxLength={62}
                  minLength={10}
                  required
                  onChange={handleChange}
                  value={formData.name}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Describe your property..."
                  className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
                  id="description"
                  required
                  rows={4}
                  onChange={handleChange}
                  value={formData.description}
                />
              </div>
            </div>
          </motion.section>

          {/* Location Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 space-y-6"
          >
            <div className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <FaMapMarkerAlt className="text-blue-600" />
              <h2>Location</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Enter property address"
                  className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  id="address"
                  required
                  onChange={handleChange}
                  value={formData.address}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-white/50 z-10 pointer-events-none rounded-lg" />
                <MapSelector
                  location={
                    formData.latitude && formData.longitude
                      ? { lat: formData.latitude, lng: formData.longitude }
                      : null
                  }
                  setLocation={handleLocationSelect}
                  error={mapError}
                />
                {mapError && (
                  <p className="mt-2 text-sm text-red-600">{mapError}</p>
                )}
              </div>
            </div>
          </motion.section>

          {/* Property Details Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 space-y-6"
          >
            <div className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <FaHome className="text-blue-600" />
              <h2>Property Details</h2>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                {['sale', 'rent'].map((item) => (
                  <label
                    key={item}
                    htmlFor={item}
                    className="flex items-center gap-2 cursor-pointer select-none bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <input
                      type="radio"
                      id={item}
                      name="type"
                      className="w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                      onChange={handleChange}
                      checked={formData.type === item}
                    />
                    <span className="capitalize text-gray-700 font-medium">{item}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                  <input
                    type="number"
                    id="bedrooms"
                    min={1}
                    max={10}
                    required
                    className="w-20 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    onChange={handleChange}
                    value={formData.bedrooms}
                  />
                  <span className="text-gray-700 font-medium">Bedrooms</span>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                  <input
                    type="number"
                    id="bathrooms"
                    min={1}
                    max={10}
                    required
                    className="w-20 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    onChange={handleChange}
                    value={formData.bathrooms}
                  />
                  <span className="text-gray-700 font-medium">Bathrooms</span>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                  <input
                    type="number"
                    id="regularPrice"
                    min={50}
                    max={10000000}
                    required
                    className="w-32 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    onChange={handleChange}
                    value={formData.regularPrice}
                  />
                  <span className="text-gray-700 font-medium">Price ($)</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {['parking', 'furnished', 'offer'].map((item) => (
                  <label
                    key={item}
                    htmlFor={item}
                    className="flex items-center gap-2 cursor-pointer select-none bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <input
                      type="checkbox"
                      id={item}
                      className="w-4 h-4 cursor-pointer text-blue-600 focus:ring-blue-500"
                      onChange={handleChange}
                      checked={formData[item]}
                    />
                    <span className="capitalize text-gray-700 font-medium">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Images Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 space-y-6"
          >
            <div className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <FaImages className="text-blue-600" />
              <h2>Images</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleImageSubmit}
                  className={`px-6 py-2 rounded-lg text-white font-semibold transition
                    ${uploading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>

              {imageUploadError && (
                <p className="text-red-600 text-sm font-medium">{imageUploadError}</p>
              )}

              {formData.imageUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.imageUrls.map((url, i) => (
                    <div
                      key={i}
                      className="relative group rounded-lg overflow-hidden shadow-md"
                    >
                      <img
                        src={url}
                        alt={`Listing ${i + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 text-center font-medium"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-bold text-lg transition
              ${loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'
              }`}
          >
            {loading ? 'Creating Listing...' : 'Create Listing'}
          </motion.button>
        </form>
      </div>
    </motion.main>
  );
}