import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux';
import { Navigation } from 'swiper/modules';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import 'swiper/css/bundle';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
  FaTag,
  FaInfoCircle,
  FaLocationArrow,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';
import Contact from '../components/Contact';

// Fix for default marker icon
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map resize helper
function MapResizer() {
  const map = useMap();
  
  useEffect(() => {
    // Force resize on map load and on window resize
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Add another resize check after a longer delay to catch any layout shifts
    const secondResizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      clearTimeout(secondResizeTimer);
    };
  }, [map]);
  
  return null;
}

// Custom marker icon
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `<div class="marker-pin bg-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
           </div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42],
  });
};

// Location Control Component
const LocationControl = forwardRef(function LocationControl(props, ref) {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const userLocationMarkerRef = useRef(null);
  
  // Expose the locateMe function to parent through ref
  useImperativeHandle(ref, () => ({
    locateMe
  }));
  
  const locateMe = () => {
    if (!navigator.geolocation) {
      showLocationError('Geolocation is not supported by your browser');
      return;
    }
    
    setLocating(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const { latitude, longitude } = position.coords;
        
        map.flyTo([latitude, longitude], 16, {
          animate: true,
          duration: 1.5
        });
        
        // Add a pulsing user location marker
        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          const pulsingIcon = L.divIcon({
            className: 'user-location-marker',
            html: '<div class="pulse-circle"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          
          userLocationMarkerRef.current = L.marker([latitude, longitude], {
            icon: pulsingIcon,
            zIndexOffset: 1000
          }).addTo(map);
        }
        
        setLocating(false);
      },
      // Error callback
      (error) => {
        setLocating(false);
        
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services for this site.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          case error.UNKNOWN_ERROR:
          default:
            errorMessage = 'An unknown error occurred.';
            break;
        }
        
        showLocationError(errorMessage);
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  
  const showLocationError = (message) => {
    setLocationError(message);
    setTimeout(() => setLocationError(null), 5000);
  };
  
  return (
    <div className="location-control-container">
      <AnimatePresence>
        {locationError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000] flex items-center gap-2 location-notification error"
          >
            <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
            <span className="text-sm">{locationError}</span>
            <button 
              onClick={() => setLocationError(null)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {locating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg z-[1000]"
          >
            <FaSpinner className="w-6 h-6 text-blue-500 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Map Custom Controls
function MapControls({ onLocateMe }) {
  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar custom-map-controls">
        <button 
          className="custom-map-control-button" 
          title="Locate Me"
          onClick={onLocateMe}
        >
          <FaLocationArrow />
        </button>
      </div>
    </div>
  );
}

// Map Popup content component
function MapPopupContent({ listing }) {
  return (
    <div className="map-popup-content">
      <div className="map-popup-info">
        <h3 className="map-popup-title">{listing.name}</h3>
        <p className="map-popup-address">{listing.address}</p>
      </div>
    </div>
  );
}

// https://sabe.io/blog/javascript-format-numbers-commas#:~:text=The%20best%20way%20to%20format,format%20the%20number%20with%20commas.

export default function Listing() {
  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapContainerRef = useRef(null);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const locationControlRef = useRef();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
        
        // Show map immediately after data is loaded
        setShowMap(true);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  // Handle locate me button click
  const handleLocateMe = () => {
    if (locationControlRef.current) {
      locationControlRef.current.locateMe();
    }
  };

  // Ensure map container is properly sized
  useEffect(() => {
    if (showMap && mapContainerRef.current) {
      const resizeMapContainer = () => {
        const mapContainer = mapContainerRef.current;
        if (mapContainer) {
          // If needed, you can add logic to adjust height based on viewport
          mapContainer.style.height = '450px';
        }
      };

      resizeMapContainer();
      window.addEventListener('resize', resizeMapContainer);
      
      return () => {
        window.removeEventListener('resize', resizeMapContainer);
      };
    }
  }, [showMap]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      {loading && (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center my-7 text-2xl text-red-600 bg-red-50 p-4 rounded-lg mx-4"
        >
          Something went wrong!
        </motion.div>
      )}
      {listing && !loading && !error && (
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Swiper navigation className="relative">
              {listing.imageUrls.map((url) => (
                <SwiperSlide key={url}>
                  <div
                    className="h-[550px] bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${url})` }}
                  ></div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="fixed top-[13%] right-[3%] z-10"
          >
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
              className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-300"
            >
              <FaShare className="text-slate-500 text-xl" />
            </button>
          </motion.div>

          <AnimatePresence>
            {copied && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="fixed top-[23%] right-[5%] z-10 bg-white px-4 py-2 rounded-lg shadow-lg"
              >
                Link copied!
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4"
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {listing.name}
              </h1>
              
              <div className="flex items-center gap-2 text-slate-600 mb-4">
                <FaMapMarkerAlt className="text-green-700" />
                <span className="text-lg">{listing.address}</span>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                  {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
                {listing.offer && (
                  <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                    ${+listing.regularPrice - +listing.discountPrice} OFF
                  </span>
                )}
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ${listing.offer
                    ? listing.discountPrice.toLocaleString('en-US')
                    : listing.regularPrice.toLocaleString('en-US')}
                  {listing.type === 'rent' && ' / month'}
                </h2>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaInfoCircle className="text-blue-600" />
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <FaBed className="text-2xl text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900">
                    {listing.bedrooms} {listing.bedrooms > 1 ? 'Beds' : 'Bed'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <FaBath className="text-2xl text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900">
                    {listing.bathrooms} {listing.bathrooms > 1 ? 'Baths' : 'Bath'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <FaParking className="text-2xl text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900">
                    {listing.parking ? 'Parking' : 'No Parking'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <FaChair className="text-2xl text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900">
                    {listing.furnished ? 'Furnished' : 'Unfurnished'}
                  </p>
                </div>
                {listing.size && (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <FaMapMarkedAlt className="text-2xl text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">{listing.size} m²</p>
                  </div>
                )}
              </div>
            </div>

            {listing.latitude && listing.longitude && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm p-6"
                id="map-container"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-600" />
                  Location
                </h3>
                <div 
                  ref={mapContainerRef}
                  className="h-[450px] w-full rounded-lg overflow-hidden shadow-md relative listing-map-container"
                >
                  {!showMap && (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center map-loading">
                      <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  )}
                  
                  {showMap && (
                    <MapContainer
                      center={[listing.latitude, listing.longitude]}
                      zoom={14}
                      scrollWheelZoom={true}
                      className="h-full w-full map-container"
                      zoomControl={false}
                      key={`map-${listing._id}`} // Force recreation when listing changes
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <ZoomControl position="topright" />
                      <MapControls onLocateMe={handleLocateMe} />
                      <LocationControl ref={locationControlRef} />
                      <MapResizer />
                      <Marker 
                        position={[listing.latitude, listing.longitude]}
                        icon={createCustomIcon()}
                      >
                        <Popup>
                          <MapPopupContent listing={listing} />
                        </Popup>
                      </Marker>
                    </MapContainer>
                  )}
                </div>
              </motion.div>
            )}

            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => setContact(true)}
                className="w-full bg-blue-600 text-white rounded-lg uppercase hover:bg-blue-700 p-4 font-semibold transition-colors duration-300"
              >
                Contact landlord
              </motion.button>
            )}
            {contact && <Contact listing={listing} />}
          </motion.div>
        </div>
      )}
    </motion.main>
  );
}