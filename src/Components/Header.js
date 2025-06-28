import React, { useState, useEffect, useRef } from "react";
import { Search, History, MapPin } from "lucide-react";
import './Header.css';
import { BACKEND_BASE_URLS, BACKEND_ENDPOINTS } from "../utils/frontEndUtils"; // Import Backend constants

const Header = ({ setWeatherData, setActivePage, setDefaultLocation, defaultLocation, units }) => {
    const [locationData, setLocationData] = useState({
        name: "Allow location access...",
        weather: "N/A",
        temperature: "N/A",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [locationError, setLocationError] = useState(null);
    const [city, setCity] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [locationObtained, setLocationObtained] = useState(null);
    const searchContainerRef = useRef(null);

    // Temperature and speed units based on settings
    const tempSymbol = units === 'metric' ? '°C' : '°F';
    const speedSymbol = units === 'metric' ? 'km/h' : 'mph';

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch recent searches on mount
    useEffect(() => {
        fetchRecentSearches();
    }, []);

    // Fetch city suggestions based on user input
    const fetchSuggestions = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(`${BACKEND_BASE_URLS.SUGGESTED_SEARCHES}${BACKEND_ENDPOINTS.SEARCH_SUGGESTIONS}?query=${query}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            setSuggestions([]);
        }
    };

    // Fetch user's recent searches
    const fetchRecentSearches = async () => {
        try {
            const response = await fetch(`${BACKEND_BASE_URLS.SUGGESTED_SEARCHES}${BACKEND_ENDPOINTS.RECENT_SEARCHES}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setRecentSearches(data);
        } catch (error) {
            console.error("Error fetching recent searches:", error);
            setRecentSearches([]);
        }
    };

    // Add search to recent searches
    const addToRecentSearches = async (query) => {
        try {
            const response = await fetch(`${BACKEND_BASE_URLS.SUGGESTED_SEARCHES}${BACKEND_ENDPOINTS.RECENT_SEARCHES}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            setRecentSearches(data.recent_searches);
        } catch (error) {
            console.error("Error adding to recent searches:", error);
        }
    };

    // Handle input change for search
    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        setCity(value);
        fetchSuggestions(value);
        setShowSuggestions(true);
    };

    // Handle suggestion selection
    const handleSuggestionSelect = (suggestion) => {
        setCity(suggestion);
        setShowSuggestions(false);
        // Automatically search when a suggestion is selected
        fetchWeatherForCity(suggestion);
    };

    // Fetch weather data based on user location
    const fetchWeatherForUserLocation = async (locationName) => {
        try {
            const response = await fetch(`${BACKEND_BASE_URLS.SAVED_SEARCHES}${BACKEND_ENDPOINTS.SAVED_SEARCHES}?city=${locationName}&units=${units}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setLocationData({
                name: data.name || "Unknown Location",
                weather: data.weather[0].description || "N/A",
                temperature: data.main.temp || "N/A",
            });
        } catch (error) {
            console.error("Error fetching location weather:", error);
            setLocationError("Failed to load location weather.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCityName = async (lat, lon) => {
        try {
            const response = await fetch(`${BACKEND_BASE_URLS.NAME}${BACKEND_ENDPOINTS.NAME}?lat=${lat}&lon=${lon}`)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setDefaultLocation(data[0].name || defaultLocation);
        } catch (error) {
            console.error("Error fetching city name based on location coordinates. Using Default Location");
        } finally {
            setIsLoading(false);
        }
    }
    
    useEffect(() => {
        if (!locationObtained) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        fetchCityName(latitude, longitude)
                        fetchWeatherForUserLocation(defaultLocation);
                        setLocationObtained(true);
                    },
                    (error) => {
                        console.log("Geolocation Not Approved. Using Default Location");
                        fetchWeatherForUserLocation(defaultLocation);
                    }
                );
            } else {
                console.warn("Geolocation error. Fetching weather for default location.");
                fetchWeatherForUserLocation(defaultLocation);
            }
        } else {
            fetchWeatherForUserLocation(defaultLocation);
        }
        
    }, [defaultLocation, units]);

    const fetchWeatherForCity = async (cityName) => {
        if (!cityName) return;
        
        setIsLoading(true);
    
        try {
            const response = await fetch(`${BACKEND_BASE_URLS.SAVED_SEARCHES}${BACKEND_ENDPOINTS.SAVED_SEARCHES}?city=${cityName}&units=${units}`);
            if (!response.ok) {
                throw new Error("Failed to fetch weather data");
            }
            const data = await response.json();
            
            // Format the data before setting state
            const formattedWeatherData = {
                name: data.name,
                weather: data.weather[0].main,
                description: data.weather[0].description,
                temperature: data.main.temp,
                feels_like: data.main.feels_like,
                temp_max: data.main.temp_max,
                temp_min: data.main.temp_min,
                wind_speed: data.wind.speed,
                wind_direction: data.wind.deg,
                wind_gust: data.wind.gust || 0,
                sunrise: data.sys.sunrise,
                sunset: data.sys.sunset,
            };
            
            setWeatherData(formattedWeatherData);
            setActivePage("searched");
            
            // Add to recent searches
            addToRecentSearches(cityName);
        } catch (error) {
            console.error("Error fetching weather data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <header className="header-container">
            <div className="search-container" ref={searchContainerRef}>
                <input
                    type="text"
                    placeholder="Search for any city..."
                    value={city}
                    onChange={handleSearchInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            fetchWeatherForCity(city);
                            setShowSuggestions(false);
                        }
                    }}
                    className="search-input"
                />
                <Search 
                    className="search-icon" 
                    onClick={() => {
                        fetchWeatherForCity(city);
                        setShowSuggestions(false);
                    }} 
                />
                
                {showSuggestions && (city.length > 1 || recentSearches.length > 0) && (
                    <div className="suggestions-dropdown">
                        {city.length > 1 && suggestions.length > 0 && (
                            <div className="suggestions-section">
                                <div className="suggestions-header">
                                    <MapPin size={14} />
                                    <span>Suggestions</span>
                                </div>
                                <ul className="suggestions-list">
                                    {suggestions.map((suggestion, index) => (
                                        <li 
                                            key={`suggestion-${index}`} 
                                            onClick={() => handleSuggestionSelect(suggestion)}
                                        >
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {recentSearches.length > 0 && (
                            <div className="suggestions-section">
                                <div className="suggestions-header">
                                    <History size={14} />
                                    <span>Recent Searches</span>
                                </div>
                                <ul className="suggestions-list">
                                    {recentSearches.slice(0, 5).map((search, index) => (
                                        <li 
                                            key={`recent-${index}`} 
                                            onClick={() => handleSuggestionSelect(search)}
                                        >
                                            {search}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="weather-info">
                {locationError ? (
                    <p className="error-message">{locationError}</p>
                ) : (
                    <>
                        <p className="weather-location"><strong>Location: </strong>{locationData.name}</p>
                        <p className="weather-description"><strong>Weather Conditions: </strong>{locationData.weather}</p>
                        <p className="weather-temperature"><strong>Temperature: </strong>{locationData.temperature}{tempSymbol}</p>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;