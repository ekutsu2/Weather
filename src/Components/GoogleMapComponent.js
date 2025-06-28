import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./GoogleMapComponent.css";
import { BACKEND_BASE_URLS, BACKEND_ENDPOINTS } from "../utils/frontEndUtils";

function GoogleMapComponent({ city, coordinates, onLocationSelect }) {
  const [apiKey, setApiKey] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const mapRef = useRef(null);

  // Fetch Google Maps API key from backend
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_BASE_URLS.GOOGLE_MAPS}${BACKEND_ENDPOINTS.GOOGLE_MAPS_KEY}`
        );
        setApiKey(response.data.apiKey);
      } catch (err) {
        console.error("Error fetching Google Maps API key:", err);
        setError("Failed to load Google Maps API key. Please try again later.");
        setLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  // Load Google Maps JavaScript API
  useEffect(() => {
    if (!apiKey) return;

    let scriptElement = null;

    const loadGoogleMapsAPI = () => {
      // Check if API is already loaded
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }

      // Remove any existing Google Maps scripts
      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Create new script element
      scriptElement = document.createElement("script");
      scriptElement.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      scriptElement.async = true;
      scriptElement.defer = true;
      
      // Set up callback
      window.initMap = () => {
        setMapLoaded(true);
        setLoading(false);
      };
      scriptElement.onload = window.initMap;
      
      // Handle script loading error
      scriptElement.onerror = () => {
        setError("Failed to load Google Maps. Please check your internet connection.");
        setLoading(false);
      };
      
      // Add script to document
      document.head.appendChild(scriptElement);
    };

    loadGoogleMapsAPI();

    // Cleanup function
    return () => {
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
      if (window.google && window.google.maps) {
        delete window.google.maps;
      }
      if (window.initMap) {
        delete window.initMap;
      }
    };
  }, [apiKey]);

  // Initialize map when API is loaded and either coordinates are provided or city changes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google?.maps) return;

    let mapInstance = null;
    let markerInstance = null;

    const initializeMap = async () => {
      setLoading(true);
      try {
        let mapCenter;
        
        // If coordinates are provided, use them
        if (coordinates && coordinates.lat && coordinates.lng) {
          mapCenter = {
            lat: parseFloat(coordinates.lat),
            lng: parseFloat(coordinates.lng)
          };
        } 
        // Otherwise, geocode the city name
        else if (city && city !== "Default Location") {
          // Get the center coordinates
          let mapCenter;
        
          if (coordinates) {
            // Use user's location if available
            mapCenter = coordinates;
          } else if (city) {
            // Use backend proxy for geocoding to hide API key
            try {
              const response = await axios.get(
                `${BACKEND_BASE_URLS.GOOGLE_MAPS}${BACKEND_ENDPOINTS.GEOCODE}?location=${encodeURIComponent(city)}`
              );
              
              if (response.data.results && response.data.results.length > 0) {
                const location = response.data.results[0].geometry.location;
                mapCenter = {
                  lat: location.lat,
                  lng: location.lng
                };
              } else {
                mapCenter = { lat: 40.7128, lng: -74.0060 }; // Default to NYC
              }
            } catch (error) {
              console.error("Error geocoding city:", error);
              mapCenter = { lat: 40.7128, lng: -74.0060 }; // Default to NYC
            }
          } else {
            mapCenter = { lat: 40.7128, lng: -74.0060 }; // Default to NYC
          }
        } else {
          mapCenter = { lat: 40.7128, lng: -74.0060 }; // Default to NYC
        }

        // Initialize the map
        const newMap = new window.google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: coordinates ? 13 : 10, // Zoom in more for user's location
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP
        });

        // Create a marker
        const newMarker = new window.google.maps.Marker({
          position: mapCenter,
          map: newMap,
          animation: window.google.maps.Animation.DROP,
          title: city || "Selected Location"
        });

        // Add click listener to map
        newMap.addListener("click", (event) => {
          const clickedLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          
          // Update marker position
          newMarker.setPosition(clickedLocation);
          
          // Call onLocationSelect callback with new coordinates
          if (onLocationSelect) {
            onLocationSelect(clickedLocation);
          }
        });

        // Save map and marker instances
        mapInstance = newMap;
        markerInstance = newMarker;
        setMap(newMap);
        setMarker(newMarker);
        setLoading(false);
      } catch (err) {
        console.error("Error initializing Google Maps:", err);
        setError("Error initializing map. Please try again later.");
        setLoading(false);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (markerInstance) {
        markerInstance.setMap(null);
      }
      if (mapInstance) {
        mapInstance = null;
      }
    };
  }, [mapLoaded, coordinates, city, onLocationSelect]);

  // Update marker position when coordinates change
  useEffect(() => {
    if (!map || !marker || !coordinates) return;

    const position = new window.google.maps.LatLng(
      parseFloat(coordinates.lat),
      parseFloat(coordinates.lng)
    );
    
    marker.setPosition(position);
    map.panTo(position);
  }, [map, marker, coordinates]);

  if (error) {
    return (
      <div className="map-error">
        <div>
          <p>{error}</p>
          <p>Please check your internet connection or try again later.</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="google-map-container">
    {loading && <div className="map-loading">Loading map data...</div>}
  </div>;
}

export default GoogleMapComponent;