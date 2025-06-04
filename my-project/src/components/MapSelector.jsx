import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaMapMarkerAlt, FaSpinner, FaExclamationTriangle, FaLocationArrow } from "react-icons/fa";

const NominatimBaseUrl = "https://nominatim.openstreetmap.org/";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MapSelector({ location, setLocation, error }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const userLocationMarkerRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [zoom, setZoom] = useState(13);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationFound, setLocationFound] = useState(false);

  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      try {
        mapRef.current = L.map(mapContainerRef.current, {
          center: [30.0444, 31.2357], // Default to Cairo
          zoom,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapRef.current);

        // Custom zoom control
        const zoomControl = L.control.zoom({ position: "topright" });
        zoomControl.addTo(mapRef.current);

        // Location control
        const locateControl = L.control({ position: "topright" });
        locateControl.onAdd = function () {
          const container = L.DomUtil.create("div", "custom-locate-container");
          const btn = L.DomUtil.create("button", "locate-btn", container);
          btn.title = "Locate Me";
          
          // Add Font Awesome icon
          const icon = document.createElement("i");
          icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="14" height="14" fill="currentColor">
            <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
          </svg>`;
          btn.appendChild(icon);

          btn.onclick = function(e) {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            locateUser();
          };

          return container;
        };
        locateControl.addTo(mapRef.current);

        // Handle map clicks
        mapRef.current.on("click", (e) => {
          updateMarker(e.latlng.lat, e.latlng.lng);
        });

        // Initialize with provided location if available
        if (location?.lat && location?.lng) {
          updateMarker(location.lat, location.lng);
        }
      } catch (error) {
        console.error("Map initialization error:", error);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);
  
  // Function to locate user
  const locateUser = () => {
    if (!navigator.geolocation) {
      showLocationError("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLoading(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      // Success handler
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Update marker position
        updateMarker(latitude, longitude);
        
        // Add a special user location marker if needed
        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          // Create a custom HTML element for the pulsing marker
          const pulsingIcon = L.divIcon({
            className: 'user-location-marker',
            html: '<div class="pulse-circle"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          
          userLocationMarkerRef.current = L.marker([latitude, longitude], {
            icon: pulsingIcon,
            zIndexOffset: 1000
          }).addTo(mapRef.current);
          
          // Add a highlight animation
          setTimeout(() => {
            if (userLocationMarkerRef.current) {
              userLocationMarkerRef.current.setOpacity(0);
              setTimeout(() => {
                if (userLocationMarkerRef.current) {
                  mapRef.current.removeLayer(userLocationMarkerRef.current);
                  userLocationMarkerRef.current = null;
                }
              }, 2000);
            }
          }, 5000);
        }
        
        // Show success message
        setLocationFound(true);
        setTimeout(() => setLocationFound(false), 3000);
        
        setIsLoading(false);
      },
      // Error handler
      (error) => {
        setIsLoading(false);
        
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location services for this site.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = "An unknown error occurred while trying to access your location.";
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

  // Update marker when position changes
  useEffect(() => {
    if (selectedPosition && mapRef.current) {
      try {
        if (!markerRef.current) {
          markerRef.current = L.marker(selectedPosition, { 
            draggable: true,
            autoPan: true
          }).addTo(mapRef.current);

          markerRef.current.on("dragend", (e) => {
            const latlng = e.target.getLatLng();
            setSelectedPosition([latlng.lat, latlng.lng]);
            reverseGeocode(latlng.lat, latlng.lng);
          });
        } else {
          markerRef.current.setLatLng(selectedPosition);
        }

        mapRef.current.setView(selectedPosition, zoom);
        reverseGeocode(selectedPosition[0], selectedPosition[1]);
      } catch (error) {
        console.error("Marker update error:", error);
      }
    }
  }, [selectedPosition]);

  // Search location with debounce
  const searchLocation = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const url = `${NominatimBaseUrl}search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=5`;

        const response = await fetch(url);
        const data = await response.json();

        setSearchResults(data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce
  };

  // Reverse geocode
  const reverseGeocode = async (lat, lon) => {
    try {
      const url = `${NominatimBaseUrl}reverse?format=json&lat=${lat}&lon=${lon}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.display_name) {
        setAddress(data.display_name);
        if (setLocation) {
          setLocation({ lat, lng: lon });
        }
      }
    } catch (error) {
      console.error("Reverse geocode error:", error);
    }
  };

  // Update marker
  const updateMarker = (lat, lng) => {
    setSelectedPosition([lat, lng]);
  };

  // Handle input change
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    searchLocation(e.target.value);
  };

  // Handle result selection
  const handleSelectResult = (result) => {
    setSelectedPosition([parseFloat(result.lat), parseFloat(result.lon)]);
    setSearchResults([]);
    setSearchTerm(result.display_name);
  };

  return (
    <div className="space-y-4">
      <div className="relative z-50">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a location..."
            value={searchTerm}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
          {isSearching ? (
            <FaSpinner className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
          ) : (
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          )}
        </div>

        {searchResults.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
          >
            {searchResults.map((result) => (
              <li
                key={result.place_id}
                onClick={() => handleSelectResult(result)}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition flex items-center gap-2"
              >
                <FaMapMarkerAlt className="text-blue-500" />
                <span className="text-sm">{result.display_name}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </div>

      <div className="relative z-0">
        <div 
          ref={mapContainerRef}
          className="h-[400px] w-full rounded-lg overflow-hidden shadow-md border border-gray-200"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <FaSpinner className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}
        
        <AnimatePresence>
          {locationError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-20 max-w-[90%] location-notification error"
            >
              <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-gray-700">{locationError}</p>
              <button 
                onClick={() => setLocationError(null)} 
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {locationFound && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-20 location-notification success"
            >
              <FaLocationArrow className="text-green-500" />
              <p className="text-sm text-gray-700">Location found successfully</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedPosition && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 p-4 rounded-lg relative z-10"
        >
          <p className="text-sm text-gray-600">
            <span className="font-medium">Coordinates:</span>{" "}
            {selectedPosition[0].toFixed(5)}, {selectedPosition[1].toFixed(5)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">Address:</span> {address}
          </p>
        </motion.div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 text-sm font-medium relative z-10"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
