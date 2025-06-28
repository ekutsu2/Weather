# API_URL constants to avoid having to write the urls repeatedly
API_URLS = {
  "WEATHER": "https://api.openweathermap.org/data/2.5/weather",
  "FORECAST": "https://api.openweathermap.org/data/3.0/onecall",
  "NAME": "https://api.openweathermap.org/geo/1.0/reverse",
  "COORDINATES": "https://api.openweathermap.org/geo/1.0/direct"
}

# API_KEY constants to avoid having to write the keys repeatedly
API_KEYS = {
  "OPENWEATHERMAP": "Replace with your OpenWeatherMap API key",
  "GOOGLE_MAPS": "Replace with your Google Maps API key"
}

# BACKEND_URL constants, specifically for name and coordinate conversions to help 
# with API requirement changes and to avoid having to write urls repeatedly
BACKEND_URLS = {
    "NAME": "http://127.0.0.1:5003",
    "COORDINATES": "http://127.0.0.1:5004"
}

# BACKEND_ENDPOINT constants, specifically for name and coordinate conversions to help 
# with API requirement changes and to avoid having to write endpoints repeatedly
BACKEND_ENDPOINTS = {
    "NAME": "/name",
    "COORDINATES": "/coordinates"
}