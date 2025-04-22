import React, { useState } from 'react';

function ImageUploader() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setUploadError('Please select an image.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImageUrl(data.imageUrl);
        setIsUploading(false);
        console.log('Image URL:', data.imageUrl); // للتأكد إن الـ URL وصل صح
      } else {
        setUploadError(data.error || 'Upload failed.');
        setIsUploading(false);
        console.error('Upload Error:', data.error); // لعرض تفاصيل الخطأ في الـ console
      }
    } catch (error) {
      setUploadError(error.message || 'Network error.');
      setIsUploading(false);
      console.error('Network Error:', error); // لعرض تفاصيل الخطأ في الـ console
    }
  };

  return (
    <div>
      <h2>Upload Image</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>

      {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
      {imageUrl && (
        <div>
          <h3>Uploaded Image:</h3>
          <img
            src={imageUrl}
            alt="Uploaded"
            className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
            style={{ maxWidth: '300px', height: '96px', width: '96px' }}
          />
        </div>
      )}
    </div>
  );
}

export default ImageUploader;