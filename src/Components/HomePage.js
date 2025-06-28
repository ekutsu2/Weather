import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HomePage.css";
import GoogleMapComponent from "./GoogleMapComponent";
import { BACKEND_BASE_URLS, BACKEND_ENDPOINTS, formatLocationQuery } from "../utils/frontEndUtils.js";

function HomePage({ searchedCity }) {
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState(null);

  // Get user's location or load from settings on component mount
  useEffect(() => {
    const loadDefaultLocation = async () => {
      try {
        // Try to get saved settings first
        const settingsResponse = await axios.get(`${BACKEND_BASE_URLS.MAIN}/api/settings`);
        const settings = settingsResponse.data;
        
        if (settings.defaultCoordinates && settings.defaultCoordinates.lat && settings.defaultCoordinates.lng) {
          // Use saved coordinates from settings
          setCoordinates(settings.defaultCoordinates);
          handleLocationSelect(settings.defaultCoordinates);
          return;
        } else if (settings.defaultCity) {
          // If we have a default city but no coordinates, search for it
          try {
            const response = await axios.get(`${BACKEND_BASE_URLS.SAVED_SEARCHES}${BACKEND_ENDPOINTS.SAVED_SEARCHES}?city=${settings.defaultCity}&units=imperial`);
            setWeatherData(response.data);
            if (response.data.coord) {
              setCoordinates({
                lat: response.data.coord.lat,
                lng: response.data.coord.lon
              });
            }
            return;
          } catch (err) {
            console.error("Error fetching default city:", err);
            // Fall through to geolocation
          }
        }
        
        // If no saved location or failed to load it, try geolocation
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userCoords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setCoordinates(userCoords);
              handleLocationSelect(userCoords);
            },
            (error) => {
              console.error("Error getting location:", error);
              setError("Could not get your location. Using default location.");
              // If geolocation fails, use a default location like New York
              const defaultCoords = { lat: 40.7128, lng: -74.0060 };
              setCoordinates(defaultCoords);
              handleLocationSelect(defaultCoords);
            }
          );
        } else {
          setError("Geolocation is not supported by your browser. Using default location.");
          // Use a default location like New York
          const defaultCoords = { lat: 40.7128, lng: -74.0060 };
          setCoordinates(defaultCoords);
          handleLocationSelect(defaultCoords);
        }
      } catch (err) {
        console.error("Error loading default location from settings:", err);
        // Fall back to geolocation
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userCoords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setCoordinates(userCoords);
              handleLocationSelect(userCoords);
            },
            (error) => {
              console.error("Error getting location:", error);
              setError("Could not get your location. Using default location.");
              // If geolocation fails, use a default location like New York
              const defaultCoords = { lat: 40.7128, lng: -74.0060 };
              setCoordinates(defaultCoords);
              handleLocationSelect(defaultCoords);
            }
          );
        } else {
          setError("Geolocation is not supported by your browser. Using default location.");
          // Use a default location like New York
          const defaultCoords = { lat: 40.7128, lng: -74.0060 };
          setCoordinates(defaultCoords);
          handleLocationSelect(defaultCoords);
        }
      }
    };
    
    loadDefaultLocation();
  }, []);

  useEffect(() => {
    if (searchedCity) {
      const fetchWeatherData = async () => {
        setWeatherLoading(true);
        setError(null);

        try {
          const response = await axios.get(`${BACKEND_BASE_URLS.SAVED_SEARCHES}${BACKEND_ENDPOINTS.SAVED_SEARCHES}?city=${searchedCity}&units=imperial`);
          setWeatherData(response.data);
          
          // If the API response includes coordinates, update the state
          if (response.data.lat && response.data.lon) {
            setCoordinates({
              lat: response.data.lat,
              lng: response.data.lon
            });
          } else {
            // Reset coordinates if not available
            setCoordinates(null);
          }
        } catch (err) {
          console.error("Error fetching weather:", err);
          setError("Failed to load weather data. Please try again later.");
          setCoordinates(null);
        } finally {
          setWeatherLoading(false);
        }
      };

      fetchWeatherData();
    }
  }, [searchedCity]);

  // Handle location selection from the map
  const handleLocationSelect = (newCoordinates) => {
    setCoordinates(newCoordinates);
    
    // Fetch weather data for the selected location
    const fetchWeatherForCoordinates = async () => {
      setWeatherLoading(true);
      setError(null);
      
      // Try to get city name first
      try {
        const cityUrl = `${BACKEND_BASE_URLS['NAME']}${BACKEND_ENDPOINTS['NAME']}?lat=${newCoordinates.lat}&lon=${newCoordinates.lng}&units=imperial`;
        const cityNameResponse = await axios.get(cityUrl);
        
        if (cityNameResponse.data && cityNameResponse.data.length > 0) {
          const cityName = cityNameResponse.data[0].name;
          
          try {
            const response = await axios.get(`${BACKEND_BASE_URLS.SAVED_SEARCHES}${BACKEND_ENDPOINTS.SAVED_SEARCHES}?city=${cityName}&units=imperial`);
            setWeatherData(response.data);
            
            // Save this as the default location in settings
            try {
              await axios.post(`${BACKEND_BASE_URLS.MAIN}/api/settings`, {
                defaultCity: cityName,
                defaultCoordinates: newCoordinates,
                units: "imperial"
              });
            } catch (settingsErr) {
              console.error("Error saving default location:", settingsErr);
              // Continue anyway as this is not critical
            }
            
          } catch (err) {
            console.error("Error fetching weather for city:", err);
            // If city name lookup fails, try direct coordinates
            fetchWeatherDirectly(newCoordinates);
          }
        } else {
          // No city name found, try direct coordinates
          fetchWeatherDirectly(newCoordinates);
        }
      } catch (err) {
        console.error("Error fetching city name:", err);
        // If city name lookup fails, try direct coordinates
        fetchWeatherDirectly(newCoordinates);
      } finally {
        setWeatherLoading(false);
      }
    };
    
    // Helper function to fetch weather directly using coordinates
    const fetchWeatherDirectly = async (coords) => {
      try {
        // Use direct weather API with coordinates
        const weatherUrl = `${BACKEND_BASE_URLS.MAIN}/api/weather?lat=${coords.lat}&lon=${coords.lng}&units=imperial`;
        const response = await axios.get(weatherUrl);
        
        // Format the response to match the expected structure
        const formattedData = {
          name: response.data.name || "Unknown Location",
          main: {
            temp: response.data.temperature || 0,
            feels_like: response.data.feels_like || 0,
            temp_max: response.data.temp_max || 0,
            temp_min: response.data.temp_min || 0
          },
          weather: [{
            description: response.data.description || "Unknown"
          }],
          coord: {
            lat: coords.lat,
            lon: coords.lng
          }
        };
        
        setWeatherData(formattedData);
        
        // Save this as the default location in settings
        try {
          await axios.post(`${BACKEND_BASE_URLS.MAIN}/api/settings`, {
            defaultCoordinates: coords,
            units: "imperial"
          });
        } catch (settingsErr) {
          console.error("Error saving default location:", settingsErr);
          // Continue anyway as this is not critical
        }
        
      } catch (err) {
        console.error("Error fetching weather directly with coordinates:", err);
        setError("Failed to load weather data for the selected location.");
      }
    };

    fetchWeatherForCoordinates();
  };

  return (
    <div id='Home-Page-Container'>
      <div className="home-header">
        <h1>Weather Map</h1>
      </div>

      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="map-container">
          <GoogleMapComponent 
            city={weatherData?.name || searchedCity || "Default Location"}
            coordinates={coordinates}
            onLocationSelect={handleLocationSelect}
          />
          <p className="map-instruction">Click on the map to check weather at a different location</p>
          
          {weatherData && (
            <div className="weather-info-minimal">
              <h2>{weatherData.name}</h2>
              <p className="temp-value">{Math.round(weatherData.main.temp)}°F</p>
              <p className="condition">{weatherData.weather[0].description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;
