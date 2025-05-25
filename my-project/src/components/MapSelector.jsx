import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const NominatimBaseUrl = "https://nominatim.openstreetmap.org/";

export default function MapSelector() {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [zoom, setZoom] = useState(13);

  // إنشاء الخريطة مرة واحدة
  useEffect(() => {
    mapRef.current = L.map("map", {
      center: [30.0444, 31.2357], // القاهرة كموقع افتراضي
      zoom,
      zoomControl: false, // نعطل التحكم الافتراضي
    });

    // إضافة طبقة الخريطة
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    // إضافة أزرار تكبير وتصغير مخصصة
    const zoomControl = L.control.zoom({ position: "topright" });
    zoomControl.addTo(mapRef.current);

    // إضافة زر تحديد الموقع
    const locateControl = L.control({ position: "topright" });
    locateControl.onAdd = function () {
      const btn = L.DomUtil.create("button", "locate-btn");
      btn.innerHTML = "📍";
      btn.title = "Locate Me";

      btn.onclick = () => {
        mapRef.current.locate({ setView: true, maxZoom: 16 });
      };

      return btn;
    };
    locateControl.addTo(mapRef.current);

    // عندما يعثر على الموقع، ضع ماركر
    mapRef.current.on("locationfound", (e) => {
      updateMarker(e.latitude, e.longitude);
    });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  // تحديث الماركر عند تغيير selectedPosition
  useEffect(() => {
    if (selectedPosition && mapRef.current) {
      if (!markerRef.current) {
        // إنشاء ماركر draggable
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

  // دالة البحث في Nominatim
  const searchLocation = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    const url = `${NominatimBaseUrl}search?format=json&q=${encodeURIComponent(
      query
    )}&addressdetails=1&limit=5`;

    const response = await fetch(url);
    const data = await response.json();

    setSearchResults(data);
  };

  // دالة العنوان العكسي (Reverse Geocoding)
  const reverseGeocode = async (lat, lon) => {
    const url = `${NominatimBaseUrl}reverse?format=json&lat=${lat}&lon=${lon}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.display_name) {
      setAddress(data.display_name);
    } else {
      setAddress("العنوان غير متوفر");
    }
  };

  // تحديث الماركر وإحداثياته
  const updateMarker = (lat, lng) => {
    setSelectedPosition([lat, lng]);
  };

  // عند كتابة النص في البحث
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    searchLocation(e.target.value);
  };

  // عند اختيار نتيجة البحث
  const handleSelectResult = (result) => {
    setSelectedPosition([parseFloat(result.lat), parseFloat(result.lon)]);
    setSearchResults([]);
    setSearchTerm(result.display_name);
  };

  return (
    <div style={{ width: "100%", maxWidth: 600, margin: "auto" }}>
      <input
        type="text"
        placeholder="ابحث عن مكان..."
        value={searchTerm}
        onChange={handleInputChange}
        style={{
          width: "100%",
          padding: "8px 12px",
          marginBottom: 4,
          fontSize: 16,
          boxSizing: "border-box",
        }}
      />

      {/* قائمة نتائج البحث */}
      {searchResults.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            maxHeight: 150,
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: 4,
            backgroundColor: "white",
            position: "absolute",
            width: "calc(100% - 24px)",
            zIndex: 1000,
          }}
        >
          {searchResults.map((result) => (
            <li
              key={result.place_id}
              onClick={() => handleSelectResult(result)}
              style={{
                padding: 8,
                borderBottom: "1px solid #eee",
                cursor: "pointer",
              }}
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}

      {/* الخريطة */}
      <div
        id="map"
        style={{ height: 400, width: "100%", marginTop: searchResults.length > 0 ? 160 : 8 }}
      ></div>

      {/* عرض الإحداثيات والعنوان */}
      {selectedPosition && (
        <div style={{ marginTop: 8, fontSize: 14 }}>
          <p>
            <b>الإحداثيات:</b> {selectedPosition[0].toFixed(5)} , {selectedPosition[1].toFixed(5)}
          </p>
          <p>
            <b>العنوان:</b> {address}
          </p>
        </div>
      )}
    </div>
  );
}
