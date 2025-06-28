// Import weather background GIFs
import sunnyGif from "../Assets/images/Sunny.gif";
import cloudyGif from "../Assets/images/Cloudy.gif";
import rainGif from "../Assets/images/Rain.gif";
import snowGif from "../Assets/images/Snow.gif";
import thunderstormsGif from "../Assets/images/Thunderstroms.gif"; // Fixed filename

/**
 * Formats a location query string for API requests
 * @param {string} location - The location query to format
 * @returns {string} - The formatted query
 */
export const formatLocationQuery = (location) => {
  if (location.includes(",")) {
    const [latitude, longitude] = location.split(",");
    return `${latitude.trim()},${longitude.trim()}`;
  }
  return location.trim();
};

/**
 * Determines the appropriate background GIF based on weather condition
 * @param {string} weatherCondition - The weather condition
 * @returns {string} - The path to the appropriate background GIF
 */
export const getWeatherBackground = (weatherCondition) => {
  if (!weatherCondition) return sunnyGif;
  
  const condition = weatherCondition.toLowerCase();
  
  if (condition.includes("cloud") || condition.includes("overcast") || condition.includes("fog") || condition.includes("mist")) {
    return cloudyGif;
  } else if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("shower")) {
    return rainGif;
  } else if (condition.includes("snow") || condition.includes("sleet") || condition.includes("hail") || condition.includes("ice")) {
    return snowGif;
  } else if (condition.includes("thunder") || condition.includes("storm") || condition.includes("lightning")) {
    return thunderstormsGif;
  } else {
    return sunnyGif;
  }
};

/**
 * Converts wind direction in degrees to cardinal direction
 * @param {number} degrees - The wind direction in degrees
 * @returns {string} - The cardinal direction
 */
export const getWindDirection = (degrees) => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

/**
 * Formats a date string to be more readable
 * @param {string} dateString - The date string to format
 * @returns {string} - The formatted date string
 */
export const formatDate = (dateString) => {
  const options = { weekday: "short", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Backend Endpoints
 */
export const BACKEND_ENDPOINTS = {
  SAVED_SEARCHES: "/saved_searches",
  WEATHER_FORECAST: "/forecast",
  NAME: "/name",
  COORDINATES: "/coordinates",
  GOOGLE_MAPS_KEY: "/google-maps-key",
  GEOCODE: "/geocode",
  SEARCH_SUGGESTIONS: "/suggestions",
  RECENT_SEARCHES: "/recent-searches"
}

/**
 * Base URL for the backend API
 */
export const BACKEND_BASE_URLS = {
  MAIN: "http://127.0.0.1:5000",
  SAVED_SEARCHES: "http://127.0.0.1:5001",
  WEATHER_FORECAST: "http://127.0.0.1:5002",
  NAME: "http://127.0.0.1:5003",
  COORDINATES: "http://127.0.0.1:5004",
  GOOGLE_MAPS: "http://127.0.0.1:5005",
  SUGGESTED_SEARCHES: "http://127.0.0.1:5006"
}