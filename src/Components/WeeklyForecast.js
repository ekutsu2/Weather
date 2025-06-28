import React, { useState, useEffect } from "react";
import "./WeeklyForecast.css";
import { BACKEND_BASE_URLS, BACKEND_ENDPOINTS } from "../utils/frontEndUtils";

function getWeatherBackground(weatherCondition) {
  if (!weatherCondition) return "sunnyGif";
  const condition = weatherCondition.toLowerCase();
  if (condition.includes("cloud") || condition.includes("fog") || condition.includes("mist")) return "cloudyGif";
  if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("shower")) return "rainGif";
  if (condition.includes("snow") || condition.includes("sleet") || condition.includes("hail")) return "snowGif";
  if (condition.includes("thunder") || condition.includes("storm") || condition.includes("lightning")) return "thunderstormsGif";
  if (condition.includes("clear") || condition.includes("sun") || condition.includes("fair")) return "sunnyGif";
  return "sunnyGif";
}

function WeeklyForecast({ searchLocation, units, embedded }) {
  const [forecast, setForecast] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (units === 'metric') {
    var tempSymbol = '°C';
    var speedSymbol = 'km/h';
  } else {
    var tempSymbol = '°F';
    var speedSymbol = 'mph';
  }

  // Handler for toggling detailed day view
  const handleDayClick = (index) => {
    setSelectedDayIndex(prevIndex => prevIndex === index ? null : index);
  };


  const fetchUserLocationForecast = async (days) => {
    try {
      let response = await fetch(`${BACKEND_BASE_URLS.WEATHER_FORECAST}${BACKEND_ENDPOINTS.WEATHER_FORECAST}?city=${searchLocation}&units=${units}`);

      
      console.log(`Backend Forecast URL: ${BACKEND_BASE_URLS.WEATHER_FORECAST}${BACKEND_ENDPOINTS.WEATHER_FORECAST}?city=${searchLocation}&units=${units}`)
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      let data = await response.json();

      setForecast(prepareForecastData(data, days))
      setLoading(false);
    } catch (error) {
      console.error("Error fetching location-based forecast:", error);
      setError("Failed to fetch forecast data.");
      setLoading(false);
    }
  };

  function prepareForecastData(apiResponse, count) {
    if (!apiResponse || !apiResponse.daily) {
      return [];
    }
  
    // Limit to the requested number of days
    return apiResponse.daily.slice(0, count).map((day) => {
      return {
        date: new Date(day.dt * 1000).toLocaleDateString(), // Convert timestamp to readable date
        dayOfWeek: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        temperature: {
          high: day.temp.max.toFixed(1),
          low: day.temp.min.toFixed(1),
          morning: day.temp.morn.toFixed(1),
          day: day.temp.day.toFixed(1),
          evening: day.temp.eve.toFixed(1),
          night: day.temp.night.toFixed(1),
        },
        feels_like: {
          day: day.feels_like.day.toFixed(1),
          night: day.feels_like.night.toFixed(1),
        },
        weather: {
          main: day.weather[0].main,
          description: day.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`, // Weather icon URL
        },
        // Additional data for detailed view
        humidity: day.humidity,
        wind_speed: day.wind_speed,
        wind_deg: day.wind_deg,
        pressure: day.pressure,
        uvi: day.uvi,
        pop: (day.pop * 100).toFixed(0), // Probability of precipitation as percentage
        rain: day.rain || 0,
        sunrise: new Date(day.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(day.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    });
  }

  useEffect(() => {
    if (embedded) {
      fetchUserLocationForecast(5);
    } else {
      fetchUserLocationForecast(7);
    }
  }, [searchLocation, units, embedded]);

  if (loading) return <div className="loading-message">Loading forecast data...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!forecast.length) return <div className="no-data-message">No forecast data available</div>;

  const containerClass = embedded ? "forecast-gap" : "weather-details-container";

  return (
    <div id={containerClass}>
      {!embedded && (
        <div id="header-forecast-container">
          <div id="header-forecast-background">
            <h2>Seven Day Forecast for {searchLocation}</h2>
          </div>
          
        </div>
      )}

      {/* Conditional rendering based on view mode */}
      {/* Compact view */}
      <div id={`forecast-compact-view-${containerClass}`}>
        {forecast.map((day, index) => (
          <div key={index} id={`forecast-day-${containerClass}`}
            className={`${getWeatherBackground(day.weather.main)}`}>
            {!embedded ? (
              <div id={`text-background-${containerClass}`} 
                onClick={() => !embedded && handleDayClick(index)}  
                style={{
                  backgroundColor: index == selectedDayIndex ? 'rgba(185, 185, 185, 0.7)' : '',
                  cursor: embedded ? 'default' : 'pointer'
                }}>
                <p id={`forecast-date-${containerClass}`}>{day.dayOfWeek}, {day.date}</p>
                <img src={day.weather.icon} alt="Weather Icon" />
                <p id={`forecast-condition-${containerClass}`}>{day.weather.main}</p>
                <p id={`forecast-description-${containerClass}`}>{day.weather.description}</p>
                <div id="forecast-day-temp-container">
                  <p id={`forecast-temp-low-${containerClass}`}>{Math.round(day.temperature.low)}{tempSymbol}</p>
                  <p id={`forecast-temp-high-${containerClass}`}>{Math.round(day.temperature.high)}{tempSymbol}</p>
                </div>
              </div>) : (
              <div id={`text-background-${containerClass}`}>
                <p id={`forecast-date-${containerClass}`}>{day.dayOfWeek}, {day.date}</p>
                <div id="forecast-day-column-container">
                  <div id="left-day-column">
                    <img src={day.weather.icon} alt="Weather Icon" />
                  </div>
                  <div id="right-day-column">
                    <p id={`forecast-condition-${containerClass}`}>{day.weather.main}</p>
                    <p id={`forecast-description-${containerClass}`}>{day.weather.description}</p>
                  </div>
                </div>
                <div id="forecast-day-temp-container">
                  <p id={`forecast-temp-low-${containerClass}`}>{Math.round(day.temperature.low)}{tempSymbol}</p>
                  <p id={`forecast-temp-high-${containerClass}`}>{Math.round(day.temperature.high)}{tempSymbol}</p>
                </div>
              </div>
            )}
            
          </div>
        ))}
      </div>
          
      {/* Detailed section toggle */}
      {!embedded && selectedDayIndex !== null && (
        <div className="forecast-day-content">
          <div className="temperature-section">
            <h4>Temperature</h4>
            <div className="condition-detailed-container">
              <div className="temp-high-low">
                <p><strong>High:</strong> {forecast[selectedDayIndex].temperature.high}{tempSymbol}</p>
                <p><strong>Low:</strong> {forecast[selectedDayIndex].temperature.low}{tempSymbol}</p>
              </div>

              <div className="temp-morning-day">
                <p><strong>Morning:</strong> {forecast[selectedDayIndex].temperature.morning}{tempSymbol}</p>
                <p><strong>Day:</strong> {forecast[selectedDayIndex].temperature.day}{tempSymbol}</p>
              </div>

              <div className="temp-evening-night">
                <p><strong>Evening:</strong> {forecast[selectedDayIndex].temperature.evening}{tempSymbol}</p>
                <p><strong>Night:</strong> {forecast[selectedDayIndex].temperature.night}{tempSymbol}</p>
              </div>

              <div className="temp-feels-like">
                <p><strong>Feels Like (Day):</strong> {forecast[selectedDayIndex].feels_like.day}{tempSymbol}</p>
                <p><strong>Feels Like (Night):</strong> {forecast[selectedDayIndex].feels_like.night}{tempSymbol}</p>
              </div>
            </div>

          </div>
          
          <div className="conditions-section">
            <h4>Conditions</h4>
            <div className="condition-detailed-container">
              <p><strong>Humidity:</strong> {forecast[selectedDayIndex].humidity}%</p>
              <p><strong>Wind:</strong> {forecast[selectedDayIndex].wind_speed} {speedSymbol}</p>
              <p><strong>Pressure:</strong> {forecast[selectedDayIndex].pressure} hPa</p>
              <p><strong>UV Index:</strong> {forecast[selectedDayIndex].uvi}</p>
              <p><strong>Precipitation Chance:</strong> {forecast[selectedDayIndex].pop}%</p>
              {forecast[selectedDayIndex].rain > 0 && <p><strong>Rain:</strong> {forecast[selectedDayIndex].rain} mm</p>}
            </div>
          </div>
          
          <div className="sun-section">
            <h4>Sun</h4>
            <div className="condition-detailed-container">
              <p><strong>Sunrise:</strong> {forecast[selectedDayIndex].sunrise}</p>
              <p><strong>Sunset:</strong> {forecast[selectedDayIndex].sunset}</p>
            </div>

          </div>
        </div>
      )}

      {!embedded && selectedDayIndex === null && (
        <div className="forecast-day-content"></div>
      )}
    </div>
  );
}

export default WeeklyForecast;