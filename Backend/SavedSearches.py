from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
from Utils.BackendUtils import API_URLS, API_KEYS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) 


# ------ Initializing Cashe Details ------

# Cache to store recent weather data searches
weather_cache = {}
# Cashe expiration time set to 30 minutes to avoid making too many calls but get updated
# information if enough time has passed
CACHE_EXPIRATION = 1800

# Backend Endpoint "/saved_searches"
@app.route("/saved_searches", methods=["GET"])
def get_weather():
    
    # ------ Getting the request details ------

    # Get the city and unit parameters from the url
    city = request.args.get("city")
    units = request.args.get('units')
    
    # If city or units are not specified, return an error
    if not city or not units:
        return jsonify({"error": "Both city and units parameters are required to make weather conditions backend call"}), 400
    
    # Record the current time
    current_time = time.time()


    # ------ Checking the Cache ------

    # Check cache to see if any of the cashed data is for the city the user is requesting
    if city in weather_cache:
        # Record the cashed information for that city
        cached_data = weather_cache[city]
        # If the difference between the current time and the time stamp of the data is 
        # less than the cashe expiration time, check to make sure the units match
        if current_time - cached_data["timestamp"] < CACHE_EXPIRATION:
            # If the requested units match the cashed data units, return the cashed data
            if units == cached_data["units"]:
                app.logger.info(f"RESPONSE LOG: Returning cached weather conditions for {city}")
                return jsonify(cached_data["data"])
        else:
            # If the cashed data has expired, delete it to avoid comparing it in future searches
            del weather_cache[city]


    # ------ Making the API Call ------


    # Use city name parameter for city searches
    url = f"{API_URLS['WEATHER']}?q={city}&appid={API_KEYS['OPENWEATHERMAP']}&units={units}"
    # Make a request to the url for the weather information
    response = requests.get(url)

    # If the request was successful
    if response.status_code == 200:
        # Convert response data to json
        weather_data = response.json()
        # Record the data in the cashe
        weather_cache[city] = {"timestamp": current_time, "data": weather_data, "units": units}
        app.logger.info(f"RESPONSE LOG: Returning fetched API weather conditions for {city}")
        # Return the fetched data
        return jsonify(weather_data)
    else:
        # If the response was not successful, return an error 
        return jsonify({"error": "Failed to fetch weather data from API"}), response.status_code

# Run this file on port 5001
if __name__ == "__main__":
    app.run(port=5001, debug=True)