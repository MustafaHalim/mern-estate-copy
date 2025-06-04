import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux';
import { Navigation } from 'swiper/modules';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
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
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

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
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  // Debug coordinates
  useEffect(() => {
    if (listing) {
      console.log('Listing Data:', listing);
      console.log('Latitude:', listing.latitude);
      console.log('Longitude:', listing.longitude);
    }
  }, [listing]);

  // Lazy load map when in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShowMap(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
      observer.observe(mapContainer);
    }

    return () => observer.disconnect();
  }, []);

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
                <div className="h-[450px] w-full rounded-lg overflow-hidden shadow-md">
                  {showMap && (
                    <MapContainer
                      center={[listing.latitude, listing.longitude]}
                      zoom={14}
                      scrollWheelZoom={true}
                      className="h-full w-full map-container"
                      zoomControl={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <ZoomControl position="topright" />
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