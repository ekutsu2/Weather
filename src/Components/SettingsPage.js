import React, { useState, useEffect } from "react";
import "./SettingsPage.css";

function SettingsPage({ setTheme, theme, setUnits, units, setDefaultLocation, defaultLocation }) {
  const [locationSetting, setLocationSetting] = useState(defaultLocation)

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "theme") {
      setTheme(value);
    } else if (name === "units") {
      setUnits(value);
    } else {
      setDefaultLocation(locationSetting);
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      
      <div className="settings-section">
        <h3>Display Settings</h3>
        
        <div className="setting-item">
          <label htmlFor="theme">Theme:</label>
          <select 
            id="theme" 
            name="theme" 
            value={theme}
            onChange={handleChange}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h3>Weather Settings</h3>
        
        <div className="setting-item">
          <label htmlFor="units">Temperature Units:</label>
          <select 
            id="units" 
            name="units" 
            value={units} 
            onChange={handleChange}
          >
            <option value="imperial">Fahrenheit (°F)</option>
            <option value="metric">Celsius (°C)</option>
          </select>
        </div>
        
        <div className="setting-item">
          <label htmlFor="defaultCity">Default City:</label>
          <input 
            type="text" 
            id="defaultCity" 
            name="defaultCity" 
            value={locationSetting} 
            onChange={(e) => setLocationSetting(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleChange(e);
              }
            }} 
            placeholder="Enter city name"
          />
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;