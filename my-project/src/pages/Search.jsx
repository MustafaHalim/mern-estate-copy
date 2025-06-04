import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import { motion } from 'framer-motion';
import ListingItem from '../components/ListingItem';
import { FaSearch, FaFilter, FaHome, FaKey, FaTag, FaMapMarkerAlt, FaList, FaMap, FaExpand, FaCompress } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icon
const createCustomIcon = (color = 'blue', isHighlighted = false) => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `<div class="marker-pin bg-${color}-600 ${isHighlighted ? 'highlight' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
           </div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42],
  });
};

// Map Custom Controls
function MapControls({ onFullscreenToggle, isFullscreen }) {
  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar custom-map-controls">
        <button 
          className="custom-map-control-button" 
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          onClick={onFullscreenToggle}
        >
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </button>
      </div>
    </div>
  );
}

// Map bounds setter
function SetMapBounds({ markers, selectedId }) {
  const map = useMap();
  
  useEffect(() => {
    if (markers && markers.length > 0) {
      // Create bounds
      const bounds = L.latLngBounds([]);
      markers.forEach((marker) => {
        if (marker.latitude && marker.longitude) {
          bounds.extend([marker.latitude, marker.longitude]);
        }
      });
      
      // Add padding
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, markers]);

  // Zoom to selected marker
  useEffect(() => {
    if (selectedId) {
      const selected = markers.find(m => m._id === selectedId);
      if (selected && selected.latitude && selected.longitude) {
        map.setView([selected.latitude, selected.longitude], 16, {
          animate: true,
          duration: 1
        });
      }
    }
  }, [selectedId, map, markers]);

  return null;
}

// Map Popup content component
function MapPopupContent({ listing, navigate }) {
  return (
    <div className="map-popup-content">
      <img 
        src={listing.imageUrls[0] || 'https://placehold.co/400x300?text=No+Image'}
        alt={listing.name}
        className="map-popup-image"
      />
      <div className="map-popup-info">
        <h3 className="map-popup-title">{listing.name}</h3>
        <p className="map-popup-address">{listing.address}</p>
        <p className="map-popup-price">
          ${listing.offer 
            ? listing.discountPrice.toLocaleString('en-US')
            : listing.regularPrice.toLocaleString('en-US')}
          {listing.type === 'rent' && ' / month'}
        </p>
        <div className="flex gap-2 mt-2 text-xs text-gray-500">
          <span>{listing.bedrooms} beds</span>
          <span>•</span>
          <span>{listing.bathrooms} baths</span>
          {listing.size && (
            <>
              <span>•</span>
              <span>{listing.size} m²</span>
            </>
          )}
        </div>
        <button 
          onClick={() => navigate(`/listing/${listing._id}`)}
          className="map-popup-button"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default function Search() {
  const navigate = useNavigate();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [viewType, setViewType] = useState('grid'); // 'grid', 'map', or 'split'
  const [selectedListing, setSelectedListing] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const mapContainerRef = useRef(null);
  const listingsWithCoordinates = listings.filter(listing => listing.latitude && listing.longitude);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const typeFromUrl = urlParams.get('type');
    const parkingFromUrl = urlParams.get('parking');
    const furnishedFromUrl = urlParams.get('furnished');
    const offerFromUrl = urlParams.get('offer');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');
    const viewTypeFromUrl = urlParams.get('viewType');

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || '',
        type: typeFromUrl || 'all',
        parking: parkingFromUrl === 'true' ? true : false,
        furnished: furnishedFromUrl === 'true' ? true : false,
        offer: offerFromUrl === 'true' ? true : false,
        sort: sortFromUrl || 'created_at',
        order: orderFromUrl || 'desc',
      });
    }

    if (viewTypeFromUrl && ['grid', 'map', 'split'].includes(viewTypeFromUrl)) {
      setViewType(viewTypeFromUrl);
    }

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();
      if (data.length > 8) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
      setListings(data);
      setLoading(false);
      setTimeout(() => setMapReady(true), 300);
    };

    fetchListings();
  }, [location.search]);

  // Handle map resize when view type or fullscreen changes
  useEffect(() => {
    const handleResize = () => {
      const mapContainer = mapContainerRef.current;
      if (mapContainer && mapContainer._leaflet_id) {
        mapContainer.invalidateSize();
      }
    };

    // Small delay to ensure the map is ready
    setTimeout(handleResize, 300);
  }, [viewType, mapFullscreen]);

  const handleChange = (e) => {
    if (
      e.target.id === 'all' ||
      e.target.id === 'rent' ||
      e.target.id === 'sale'
    ) {
      setSidebardata({ ...sidebardata, type: e.target.id });
    }

    if (e.target.id === 'searchTerm') {
      setSidebardata({ ...sidebardata, searchTerm: e.target.value });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setSidebardata({
        ...sidebardata,
        [e.target.id]:
          e.target.checked || e.target.checked === 'true' ? true : false,
      });
    }

    if (e.target.id === 'sort_order') {
      const sort = e.target.value.split('_')[0] || 'created_at';
      const order = e.target.value.split('_')[1] || 'desc';
      setSidebardata({ ...sidebardata, sort, order });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set('searchTerm', sidebardata.searchTerm);
    urlParams.set('type', sidebardata.type);
    urlParams.set('parking', sidebardata.parking);
    urlParams.set('furnished', sidebardata.furnished);
    urlParams.set('offer', sidebardata.offer);
    urlParams.set('sort', sidebardata.sort);
    urlParams.set('order', sidebardata.order);
    urlParams.set('viewType', viewType);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const startIndex = numberOfListings;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`/api/listing/get?${searchQuery}`);
    const data = await res.json();
    if (data.length < 9) {
      setShowMore(false);
    }
    setListings([...listings, ...data]);
  };

  const handleViewChange = (newViewType) => {
    setViewType(newViewType);
    if (mapFullscreen && newViewType !== 'map') {
      setMapFullscreen(false);
    }
    
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('viewType', newViewType);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`, { replace: true });
  };

  const handleMarkerClick = (listingId) => {
    setSelectedListing(listingId);
    // Scroll to the listing in the results list
    if (viewType === 'split') {
      const element = document.getElementById(`listing-${listingId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleListingHover = (listingId) => {
    setSelectedListing(listingId);
  };

  const toggleMapFullscreen = () => {
    if (!mapFullscreen && viewType !== 'map') {
      // Store the previous view to restore when exiting fullscreen
      setMapFullscreen(true);
    } else {
      setMapFullscreen(false);
    }
  };
  
  // Determine current view mode considering both viewType and fullscreen state
  const effectiveViewType = mapFullscreen ? 'map' : viewType;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* View Type Switcher - Mobile Only */}
      <div className="md:hidden p-3 bg-white border-b flex justify-center gap-2 sticky top-0 z-20 shadow-sm">
        <button
          onClick={() => handleViewChange('grid')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            effectiveViewType === 'grid'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaList />
          List
        </button>
        <button
          onClick={() => handleViewChange('map')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            effectiveViewType === 'map'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaMap />
          Map
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Only visible when not in fullscreen and on desktop or in grid/split view on mobile */}
        <div 
          className={`
            ${mapFullscreen ? 'hidden' : 
              effectiveViewType === 'map' ? 'hidden md:block' : 'block'}
            md:w-72 lg:w-80 border-r bg-white overflow-y-auto
            z-10 transition-all duration-300
            ${effectiveViewType === 'map' ? 'md:w-72 lg:w-80' : ''}
          `}
        >
          <div className="p-4 md:p-6 sticky top-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <div className="flex items-center rounded-lg border border-gray-300 hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-white overflow-hidden">
                  <input
                    type="text"
                    id="searchTerm"
                    placeholder="Search properties..."
                    className="px-4 py-3 w-full focus:outline-none text-gray-700"
                    value={sidebardata.searchTerm}
                    onChange={handleChange}
                  />
                  <button type="submit" className="px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 transition">
                    <FaSearch className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <FaHome className="w-4 h-4" />
                  Property Type
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setSidebardata({ ...sidebardata, type: 'all' })}
                    className={`px-4 py-2 rounded-lg transition ${
                      sidebardata.type === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebardata({ ...sidebardata, type: 'rent' })}
                    className={`px-4 py-2 rounded-lg transition ${
                      sidebardata.type === 'rent'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaKey className="inline-block mr-2" />
                    Rent
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebardata({ ...sidebardata, type: 'sale' })}
                    className={`px-4 py-2 rounded-lg transition ${
                      sidebardata.type === 'sale'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaHome className="inline-block mr-2" />
                    Sale
                  </button>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <FaFilter className="w-4 h-4" />
                  Amenities
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      id="parking"
                      className="w-4 h-4 text-blue-600 rounded"
                      onChange={handleChange}
                      checked={sidebardata.parking}
                    />
                    <span className="text-gray-700">Parking</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      id="furnished"
                      className="w-4 h-4 text-blue-600 rounded"
                      onChange={handleChange}
                      checked={sidebardata.furnished}
                    />
                    <span className="text-gray-700">Furnished</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      id="offer"
                      className="w-4 h-4 text-blue-600 rounded"
                      onChange={handleChange}
                      checked={sidebardata.offer}
                    />
                    <span className="text-gray-700 flex items-center gap-1">
                      <FaTag className="w-3 h-3" />
                      Special Offer
                    </span>
                  </label>
                </div>
              </div>

              {/* Sort */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Sort By</h3>
                <select
                  onChange={handleChange}
                  defaultValue={'created_at_desc'}
                  id="sort_order"
                  className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="regularPrice_desc">Price: High to Low</option>
                  <option value="regularPrice_asc">Price: Low to High</option>
                  <option value="created_at_desc">Latest First</option>
                  <option value="created_at_asc">Oldest First</option>
                </select>
              </div>

              {/* Apply Filters Button */}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <FaSearch className="w-4 h-4" />
                Apply Filters
              </button>

              {/* View Type Switcher - Desktop Only */}
              <div className="hidden md:block border-t pt-4 mt-4">
                <h3 className="font-semibold text-gray-700 mb-3">View</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewChange('grid')}
                    className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                      effectiveViewType === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaList className="w-3.5 h-3.5" />
                    <span className="text-sm">List</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewChange('map')}
                    className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                      effectiveViewType === 'map'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaMap className="w-3.5 h-3.5" />
                    <span className="text-sm">Map</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewChange('split')}
                    className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                      effectiveViewType === 'split'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaList className="w-3.5 h-3.5" />
                    <FaMap className="w-3.5 h-3.5" />
                    <span className="text-sm">Both</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Results Header - Only visible when not in fullscreen map mode */}
          {!mapFullscreen && (
            <div className="bg-white p-4 border-b flex items-center justify-between sticky top-0 z-10 shadow-sm">
              <h1 className="text-xl font-semibold text-gray-800">
                Properties
                {listings.length > 0 && (
                  <span className="text-gray-500 text-lg ml-2">
                    ({listings.length})
                  </span>
                )}
              </h1>
              
              {/* Fullscreen toggle for map when in map view */}
              {effectiveViewType === 'map' && (
                <button 
                  onClick={toggleMapFullscreen}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition flex items-center gap-2"
                  title={mapFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
                >
                  {mapFullscreen ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
                  <span className="sr-only md:not-sr-only text-sm">
                    {mapFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Map View */}
            <div 
              className={`
                ${effectiveViewType === 'grid' ? 'hidden' : 'block'} 
                ${effectiveViewType === 'split' ? 'hidden md:block md:w-1/2' : 'w-full'}
                h-full transition-all duration-300 ease-in-out
                ${mapFullscreen ? 'absolute inset-0 z-30' : ''}
              `}
            >
              {mapReady && (
                <div className="h-full relative">
                  {mapFullscreen && (
                    <button 
                      onClick={() => setMapFullscreen(false)}
                      className="absolute top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition"
                      aria-label="Exit fullscreen"
                    >
                      <FaCompress className="w-4 h-4 text-gray-700" />
                    </button>
                  )}
                  
                  <MapContainer
                    center={[30.0444, 31.2357]} // Default center
                    zoom={13}
                    className="h-full w-full map-container"
                    zoomControl={false}
                    zoomAnimation={true}
                    markerZoomAnimation={true}
                    ref={mapContainerRef}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    <ZoomControl position="topright" />
                    
                    {!mapFullscreen && (
                      <MapControls 
                        onFullscreenToggle={toggleMapFullscreen} 
                        isFullscreen={mapFullscreen}
                      />
                    )}
                    
                    {/* Set bounds based on markers */}
                    {listingsWithCoordinates.length > 0 && (
                      <SetMapBounds markers={listingsWithCoordinates} selectedId={selectedListing} />
                    )}
                    
                    {/* Map Markers */}
                    {listingsWithCoordinates.map((listing) => (
                      <Marker
                        key={listing._id}
                        position={[listing.latitude, listing.longitude]}
                        icon={createCustomIcon(listing._id === selectedListing ? 'red' : 'blue', listing._id === selectedListing)}
                        eventHandlers={{
                          click: () => handleMarkerClick(listing._id),
                        }}
                      >
                        <Popup>
                          <MapPopupContent listing={listing} navigate={navigate} />
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              )}
            </div>

            {/* List View */}
            <div 
              className={`
                ${effectiveViewType === 'map' ? 'hidden' : 'block'} 
                ${effectiveViewType === 'split' ? 'w-full md:w-1/2' : 'w-full'}
                overflow-y-auto transition-all duration-300 ease-in-out
              `}
            >
              <div className="p-4 pb-20">
                {!loading && listings.length === 0 && (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FaSearch className="text-gray-400 w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700">No properties found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your search criteria</p>
                  </div>
                )}
                
                {loading && (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 rounded-full border-4 border-t-blue-500 border-gray-200 animate-spin mb-4"></div>
                    <p className="text-gray-600">Loading properties...</p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {!loading &&
                    listings.map((listing) => (
                      <motion.div 
                        id={`listing-${listing._id}`}
                        key={listing._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`transition duration-300 ${selectedListing === listing._id ? 'ring-2 ring-blue-500 transform scale-[1.02] shadow-lg' : ''}`}
                        onMouseEnter={() => handleListingHover(listing._id)}
                        onMouseLeave={() => setSelectedListing(null)}
                      >
                        <ListingItem listing={listing} />
                      </motion.div>
                    ))}
                </div>

                {showMore && !loading && listings.length > 0 && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={onShowMoreClick}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
                    >
                      Load More Properties
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 