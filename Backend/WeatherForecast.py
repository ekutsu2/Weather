from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import time
from Utils.BackendUtils import API_URLS, API_KEYS, BACKEND_URLS, BACKEND_ENDPOINTS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


# ------ Initializing Cashe Details ------

# Cache to store recent forecast data searches 
forecast_cache = {}
# Cashe expiration time set to 30 minutes to avoid making too many calls but get updated
# information if enough time has passed
CACHE_EXPIRATION = 1800

# Backend Endpoint "/forecast"
@app.route('/forecast', methods=['GET'])
def get_forecast():
    
    # ------ Getting the request details ------

    # Get the city and unit parameters from the url
    city = request.args.get("city")
    units = request.args.get('units')
    
    # If city or units are not specified, return an error
    if not city or not units:
        return jsonify({"error": "Both city and units parameters are required to make forecast backend call"}), 400
    
    # Record the current time
    current_time = time.time()


    # ------ Checking the Cache ------

    # Check cache to see if any of the cashed data is for the city the user is requesting
    if city in forecast_cache:
        # Record the cashed information for that city
        cached_data = forecast_cache[city]
        # If the difference between the current time and the time stamp of the data is 
        # less than the cashe expiration time, check to make sure the units match
        if current_time - cached_data["timestamp"] < CACHE_EXPIRATION:
            # If the requested units match the cashed data units, return the cashed data
            if units == cached_data["units"]:
                app.logger.info(f"RESPONSE LOG: Returning cached weather forecast for {city}")
                return jsonify(cached_data["data"]) 
        else:
            # If the cashed data has expired, delete it to avoid comparing it in future searches
            del forecast_cache[city]


    # ------ Making a Coordinate Conversion Backend Call ------

    # Construct the url to make the backend call to convert the city name to coordinates
    url = f"{BACKEND_URLS['COORDINATES']}{BACKEND_ENDPOINTS['COORDINATES']}?city={city}"
    # Make the backend call
    coordinate_response = requests.get(url)
    
    # Check to make sure the call was successfull
    try:
        coordinate_response.raise_for_status()
    
    except requests.exceptions.RequestException as e:
        # Return an error if the call was not successful
        return jsonify({"error": f"Error fetching coordinates from backend: {e}"}), 500

    # Convert response from backend call to json format
    coordinate_data = coordinate_response.json()
    
    # If no data was returned, return an error
    if not coordinate_data:
        return jsonify({"error": "City not found"}), 404
    
    # Record the latitude and longitude from the backend call response 
    # Response is stored as a string. Convert to float
    lat = coordinate_data[0]['lat']
    lon = coordinate_data[0]['lon']
    
    
    # ------ Making the API Call ------

    # Construct the url to make the api call
    url = f"{API_URLS['FORECAST']}?lat={lat}&lon={lon}&exclude=minutely,hourly,alerts,current&appid={API_KEYS['OPENWEATHERMAP']}&units={units}"
    # Make a request to the url for the forecast information
    forecast_response = requests.get(url)

    # If the request was successful
    if forecast_response.status_code == 200:
        # Convert response data to json
        forecast_data = forecast_response.json()
        # Record the data in the cashe
        forecast_cache[city] = {"timestamp": current_time, "data": forecast_data, "units": units}
        app.logger.info(f"RESPONSE LOG: Returning fetched weather forecast data from API for {city}")
        # Return the fetched data
        return jsonify(forecast_data)
    else:
        # If the response was not successful, return an error 
        return jsonify({"error": "Failed to fetch weather data from API"}), forecast_response.status_code

# Run this file on port 5001
if __name__ == '__main__':
    app.run(port=5002, debug=True)
