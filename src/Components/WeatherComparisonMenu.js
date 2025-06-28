import React, { useState } from 'react';
import './WeatherComparisonMenu.css';
import { BACKEND_BASE_URLS, BACKEND_ENDPOINTS } from "../utils/frontEndUtils";

// Function to get the appropriate weather background GIF based on the weather condition
function getWeatherBackground(weatherCondition) {
  if (!weatherCondition) return 'sunnyGif';
  
  const condition = weatherCondition.toLowerCase();
  
  if (condition.includes('cloud') || condition.includes('overcast') || condition.includes('fog') || condition.includes('mist')) {
    return 'cloudyGif';
  } else if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
    return 'rainGif';
  } else if (condition.includes('snow') || condition.includes('sleet') || condition.includes('hail') || condition.includes('ice')) {
    return 'snowGif';
  } else if (condition.includes('thunder') || condition.includes('storm') || condition.includes('lightning')) {
    return 'thunderstormsGif';
  } else if (condition.includes('clear') || condition.includes('sun') || condition.includes('fair')) {
    return 'sunnyGif';
  } else {
    return 'sunnyGif';
  }
}

function WeatherComparisonMenu({ units }) {
  const [locationOne, setLocationOne] = useState(null);
  const [locationTwo, setLocationTwo] = useState(null);
  const [locationOneData, setLocationOneData] = useState(null);
  const [locationTwoData, setLocationTwoData] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);

  if (units === 'metric') {
    var tempSymbol = '°C';
    var speedSymbol = 'km/h';
  } else {
    var tempSymbol = '°F';
    var speedSymbol = 'mph';
  }

  const fetchWeatherData = async (locationName, locationNum) => {
    try {
      // Call our backend API using fetch
      const response = await fetch(`${BACKEND_BASE_URLS.SAVED_SEARCHES}${BACKEND_ENDPOINTS.SAVED_SEARCHES}?city=${locationName}&units=${units}`);
      
      // Check if the response is OK (status code 200-299)
      if (!response.ok) {
        throw new Error(`Error fetching weather for ${locationName}`);
      }
      
      // Parse the JSON data
      const data = await response.json();
      
      // Format the data for display
      const formattedData = {
        city: data.name,
        temp: data.main.temp,
        feelsLike: data.main.feels_like,
        condition: data.weather[0].description, // Assuming the condition is an array, access the first object
        windDirection: data.wind.deg,
        windSpeed: data.wind.speed,
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
        uvIndex: '3', // Placeholder - would need a separate API call
        airQuality: 'Good' // Placeholder - would need a separate API call
      };
      
      if (locationNum == 1) {
        setLocationOneData(formattedData);
      } else {
        setLocationTwoData(formattedData);
      }
    } catch (err) {
      console.error(`Error fetching weather for ${locationName}:`, err);
    }
  };
  

  function handleCompareStatistics(tempSymbol, speedSymbol) {
    if (locationOneData && locationTwoData) {
      
      const result = {
        tempDifference: `${locationOneData.temp}${tempSymbol} vs ${locationTwoData.temp}${tempSymbol} (${Number((locationOneData.temp - locationTwoData.temp).toFixed(2))}${tempSymbol} difference)`,
        feelsLikeDifference: `${locationOneData.feelsLike}${tempSymbol} vs ${locationTwoData.feelsLike}${tempSymbol}`,
        conditionComparison: `${locationOneData.condition} vs ${locationTwoData.condition}`,
        windSpeedComparison: `${locationOneData.windSpeed}${speedSymbol} vs ${locationTwoData.windSpeed}${speedSymbol}`,
        uvIndexComparison: `${locationOneData.uvIndex} vs ${locationTwoData.uvIndex}`,
        airQualityComparison: `${locationOneData.airQuality} vs ${locationTwoData.airQuality}`
      };
      setComparisonResult(result);
    } else {
      console.error('Please select 2 cities to compare');
    }
  };


  return (
    <div id="comparison-menu-container">
      <div id="comparison-header-container">
        <h2 id="comparison-header">Compare Weather Between Cities</h2>
      </div>

      <div id="comparison-column-container">
        <div id="location-one-input-column">
          <div className="location-comparison-input">
            <label htmlFor="location-one">Location One:</label>
            <input
              type="text"
              placeholder={`Enter Location 1`}
              onChange={(e) => {
                setLocationOne(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setLocationOneData(fetchWeatherData(locationOne, 1));
                }}}
            />
          </div>
                
          {locationOneData && (
            <div className={`weather-comparison-background ${getWeatherBackground(locationOneData.condition)}`}>
              <div className="text-comparison-background">
                <h3 className="h3-weather-comparison-header">{locationOneData.city}</h3>
                <div className="details-grid">
                  <p className="p-weather-comparison-statistics"><strong>Condition:</strong> {locationOneData.condition}</p>
                  <p className="p-weather-comparison-statistics"><strong>Temperature:</strong> {locationOneData.temp}{tempSymbol}</p>
                  <p className="p-weather-comparison-statistics"><strong>Feels Like:</strong> {locationOneData.feelsLike}{tempSymbol}</p>
                  <p className="p-weather-comparison-statistics"><strong>Wind Speed:</strong> {locationOneData.windSpeed}{speedSymbol}</p>
                  <p className="p-weather-comparison-statistics"><strong>Wind Direction:</strong> {locationOneData.windDirection}°</p>
                  <p className="p-weather-comparison-statistics"><strong>Sunset Time:</strong> {locationOneData.sunset}</p>
                  <p className="p-weather-comparison-statistics"><strong>UV Index:</strong> {locationOneData.uvIndex}</p>
                  <p className="p-weather-comparison-statistics"><strong>Air Quality:</strong> {locationOneData.airQuality}</p>
                </div>
              </div>
              
            </div>
          )}



          
        </div>


        <div id="location-two-input-column">
          <div className="location-comparison-input">
            <label htmlFor="location-two">Location Two:</label>
            <input
              type="text"
              placeholder={`Enter Location 1`}
              onChange={(e) => {
                setLocationTwo(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setLocationTwoData(fetchWeatherData(locationTwo, 2));
                }}}
            />
          </div>

          {locationTwoData && (
            <div className={`weather-comparison-background ${getWeatherBackground(locationTwoData.condition)}`}>
              <div className="text-comparison-background">
                <h3 className="h3-weather-comparison-header">{locationTwoData.city}</h3>
                <div className="details-grid">
                  <p className="p-weather-comparison-statistics"><strong>Condition:</strong> {locationTwoData.condition}</p>
                  <p className="p-weather-comparison-statistics"><strong>Temperature:</strong> {locationTwoData.temp}{tempSymbol}</p>
                  <p className="p-weather-comparison-statistics"><strong>Feels Like:</strong> {locationTwoData.feelsLike}{tempSymbol}</p>
                  <p className="p-weather-comparison-statistics"><strong>Wind Speed:</strong> {locationTwoData.windSpeed}{speedSymbol}</p>
                  <p className="p-weather-comparison-statistics"><strong>Wind Direction:</strong> {locationTwoData.windDirection}°</p>
                  <p className="p-weather-comparison-statistics"><strong>Sunset Time:</strong> {locationTwoData.sunset}</p>
                  <p className="p-weather-comparison-statistics"><strong>UV Index:</strong> {locationTwoData.uvIndex}</p>
                  <p className="p-weather-comparison-statistics"><strong>Air Quality:</strong> {locationTwoData.airQuality}</p>
                </div>
              </div>
              
            </div>
          )}


        </div>


        <div id="compare-statistics-column">
          {locationOneData && locationTwoData && !comparisonResult && (
            <button 
              onClick={() => handleCompareStatistics(tempSymbol, speedSymbol)} 
              className="compare-button">
              Compare Cities
            </button>
          )}
          
          {comparisonResult && (
            <div className="comparison-result">
            <h3>Comparison Result</h3>
            <div className="result-grid">
              <p><strong>Temperature:</strong> {comparisonResult.tempDifference}</p>
              <p><strong>Feels Like:</strong> {comparisonResult.feelsLikeDifference}</p>
              <p><strong>Condition:</strong> {comparisonResult.conditionComparison}</p>
              <p><strong>Wind Speed:</strong> {comparisonResult.windSpeedComparison}</p>
              <p><strong>UV Index:</strong> {comparisonResult.uvIndexComparison}</p>
              <p><strong>Air Quality:</strong> {comparisonResult.airQualityComparison}</p>
            </div>
            </div>
          )}

          {comparisonResult && (
            <button 
              onClick={() => setComparisonResult(null)} 
              className="clear-compare-button">
              Clear Comparison
            </button>
          )}

        </div>
      
      </div>
      
    </div>
  );
};

export default WeatherComparisonMenu;
