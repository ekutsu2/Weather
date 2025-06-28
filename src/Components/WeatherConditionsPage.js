// Import necessary libraries
import React from "react"; // React hooks: useState for managing state, useEffect for handling side effects
import "./WeatherConditionsPage.css"; // Import Component CSS styling
import WeeklyForecast from "./WeeklyForecast"; // Import WeeklyForecast component

// Function to get the appropriate weather background GIF based on the weather condition
function getWeatherBackground(weatherCondition) {
  // Convert to lowercase for case-insensitive matching
  const condition = weatherCondition.toLowerCase();
  
  // Map weather conditions to their corresponding background GIFs
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
    // Default to sunny if condition doesn't match any known patterns
    return 'sunnyGif';
  }
}

function WeatherConditionsPage({ weatherData, units }) {
  if (!weatherData) return <p>Error: Weather Data Not Found</p>;

  if (units === 'metric') {
    var tempSymbol = '°C';
    var speedSymbol = 'km/h';
  } else {
    var tempSymbol = '°F';
    var speedSymbol = 'mph';
  }

  return (
    
    <div className={`weather-conditions-container ${getWeatherBackground(weatherData.weather)}`}> {/* Container to hold weather Conditions page with dynamic background */}
      
      <div id="top-section" > {/* Container to hold Location name above columns */}
        
        <h2 id="location" >{weatherData.name}</h2> {/* Display the city name */}
      
      </div> {/* Top-Section end */}
      
      {/* Integrated Weekly Forecast Section */}
      <div id="forecast-section">
        <div id="forecast-background">
          <WeeklyForecast 
            searchLocation={weatherData.name} 
            units={units} 
            embedded={true} 
          />
        </div>
      </div>

      <div id="columns-container"> {/* Container to hold the bottom 3 columns */}
        
        <div id="left-column" > {/* Left Column Container - Displays sunrise, sunset, UV index, and air quality */}
          
          {/* Convert sunrise Unix timestamp to human-readable time using .toLocalTimeString() */}
          <p id="sunrise"><strong>Sunrise:</strong> {new Date(weatherData.sunrise * 1000).toLocaleTimeString()}</p> 
          
          {/* Convert sunset Unix timestamp to human-readable time using .toLocalTimeString()*/}
          <p id="sunset"><strong>Sunset:</strong> {new Date(weatherData.sunset * 1000).toLocaleTimeString()}</p> 
          
          <p><strong>UV Index:</strong> 5</p> {/* Placeholder value for UV Index */}
          <p><strong>Air Quality:</strong> Good</p> {/* Placeholder value for Air Quality */}
        
        </div> {/* Left-Column end */}

        <div id="middle-column"> {/* Middle Column Container - Displays general weather condition, description, and wind data */}
          
          <div id="condition-container"> {/* Conditions container to combine Weather condition and description */}
            
            <p id="condition"><strong>Condition: </strong>{weatherData.weather}</p> {/* General weather condition (e.g., Clear, Rain) */}
            <p id="description"><strong>Description: </strong>{weatherData.description}</p> {/* Detailed weather description */}
          
          </div> {/* Condition-Container end */}

          {/* Weather image section removed */}

          <div id="wind-container"> {/* Wind container to combine wind speed, direction, and gust */}
            
            {/* Wind statistics display in MPH and Degrees (due to 'units=imperial' in the URL) */}
            <p id="wind-speed"><strong>Wind Speed: </strong>{weatherData.wind_speed} {speedSymbol}</p> {/* Wind speed in mph */}
            <p id="wind-direction"><strong>Wind Direction: </strong>{weatherData.wind_direction}°</p> {/* Wind direction in degrees */}
            <p id="wind-gust"><strong>Wind Gust: </strong>{weatherData.wind_gust} {speedSymbol}</p> {/* Wind gust speed in mph */}
          
          </div> {/* Wind-Container end */}
        
        </div> {/* Middle-Column end */}

        <div id="right-column">{/* Right Column Container - Displays temperature-related data */}
          
          {/* Temperature Stats display in Fahrenheit (due to 'units=imperial' in the URL) */}
          <p id="temperature"><strong>Current Temperature:</strong> {weatherData.temperature}{tempSymbol}</p> {/* Displays Current temperature */}
          <p><strong>Feels Like:</strong> {weatherData.feels_like}{tempSymbol}</p> {/* Displays Feels like temperature */}
          <p><strong>Today's High:</strong> {weatherData.temp_max}{tempSymbol}</p> {/* Displays Today's maximum temperature */}
          <p><strong>Today's Low:</strong> {weatherData.temp_min}{tempSymbol}</p> {/* Displays Today's minimum temperature */}
        
        </div> {/* Right-Column end */}
      
      </div> {/* Columns-Container end */}
    </div>
  );
}

// Export the function for app.js use
export default WeatherConditionsPage;