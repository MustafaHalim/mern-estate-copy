import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

const NominatimBaseUrl = "https://nominatim.openstreetmap.org/";

export default function MapSelector({ location, setLocation, error }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [zoom, setZoom] = useState(13);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [30.0444, 31.2357], // Default to Cairo
        zoom,
        zoomControl: false,
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
        const btn = L.DomUtil.create("button", "locate-btn");
        btn.innerHTML = "📍";
        btn.title = "Locate Me";
        btn.className = "bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition";

        btn.onclick = () => {
          mapRef.current.locate({ setView: true, maxZoom: 16 });
        };

        return btn;
      };
      locateControl.addTo(mapRef.current);

      // Handle location found
      mapRef.current.on("locationfound", (e) => {
        updateMarker(e.latitude, e.longitude);
      });

      // Handle map clicks
      mapRef.current.on("click", (e) => {
        updateMarker(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker when position changes
  useEffect(() => {
    if (selectedPosition && mapRef.current) {
      if (!markerRef.current) {
        markerRef.current = L.marker(selectedPosition, { draggable: true }).addTo(
          mapRef.current
        );

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
    }
  }, [selectedPosition]);

  // Search location
  const searchLocation = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

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
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a location..."
            value={searchTerm}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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

      <div 
        ref={mapContainerRef}
        className="h-[400px] w-full rounded-lg overflow-hidden shadow-md border border-gray-200"
      />

      {selectedPosition && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 p-4 rounded-lg"
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
          className="text-red-600 text-sm font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
