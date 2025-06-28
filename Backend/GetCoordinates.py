from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import time
from Utils.BackendUtils import API_URLS, API_KEYS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


# ------ Initializing Cashe Details ------

# Cashe to hold saved city coordinates based on previous city name searches
coord_cache = {}
# Cashe Expiration time set to 1 Day (since coordinates of a city likely won't change)
CACHE_EXPIRATION = 86400

# Backend Endpoint "/coordinates"
@app.route('/coordinates', methods=['GET'])
def get_city_coordinates():
    
    # ------ Getting the request details ------

    # Get the city request from the url
    city = request.args.get('city')

    # Return an error if the city was not specified
    if not city:
        return jsonify({"error": "City parameter is required to make coordinate backend call"}), 400

    # Record the current time
    current_time = time.time()


    # ------ Checking the Cache ------

    # Check to see if any of the recorded request's city names match the requested city name 
    if city in coord_cache:
        # Get the data of that request
        coord_data = coord_cache[city]
        # If the difference between the current time and the time stamp of the data is 
        # less than the cashe expiration time, return the cashed data
        if current_time - coord_data["timestamp"] < CACHE_EXPIRATION:
            app.logger.info(f"RESPONSE LOG: Returning cached coordinate data for {city}")
            return jsonify(coord_data["data"])
        else:
            # Delete any expired data so we don't keep checking it against future searches
            del coord_cache[city]


    # ------ Making the API Call ------

    # Construct the api request url if no previous requests match the requested city name (or request expired)
    url = f"{API_URLS['COORDINATES']}?q={city}&appid={API_KEYS['OPENWEATHERMAP']}"
    # Make the request
    coordinate_response = requests.get(url)

    # If the request was successful
    if coordinate_response.status_code == 200:
        # Convert the data to json format
        coordinate_data = coordinate_response.json()
        # Add the data and the time stamp to the cashe
        coord_cache[city] = {"timestamp": current_time, "data": coordinate_data}
        app.logger.info(f"RESPONSE LOG: Returning retrieved API coordinate data for {city}")
        # Return retrieved coordinate data
        return jsonify(coordinate_data)
    else:
        # Return an error message if the request was not successful
        return jsonify({"error": "Failed to fetch coordinate data from API"}), coordinate_response.status_code

# Run this python file on port 5004
if __name__ == '__main__':
    app.run(port=5004, debug=True)