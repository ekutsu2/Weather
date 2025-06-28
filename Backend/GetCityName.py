from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import time
from Utils.BackendUtils import API_URLS, API_KEYS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


# ------ Initializing Cashe Details ------

# Cashe to hold saved city names based on previous lat and lon searches
name_cache = {}
# Cashe Expiration time set to 1 Day (since the city name at a set of coordinates likely won't change)
CACHE_EXPIRATION = 86400
# Lat and lon need to both be in this threshold of range around the original call (roughly 10 miles in all directions)
LAT_LON_THRESHOLD = 0.15

# Backend Endpoint "/name"
@app.route('/name', methods=['GET'])
def get_city_name():
    
    # ------ Getting the request details ------

    # Get the lat and lon parameters from the url
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    # Return an error if lat and lon aren't specified
    if not lat or not lon:
        return jsonify({"error": "Latitude and Longitude parameters are required to make city name backend request"}), 400
    
    # Record the time of the call
    current_time = time.time()


    # ------ Checking the Cache ------

    # Loop through saved calls in cashe
    for (cached_lat, cached_lon), entry in name_cache.items():
        # Remove expired cache entries
        if current_time - entry["timestamp"] > CACHE_EXPIRATION:
            del name_cache[(cached_lat, cached_lon)]
            continue  # Skip to the next entry

        # Record the difference between the entry lat and lon and the requested lat and lon
        lat_diff = abs(float(entry["lat"]) - float(lat))
        lon_diff = abs(float(entry["lon"]) - float(lon))
        
        # If both lat and lon are within a roughly 10 mile range of the previously called lat and lon, return cashed data
        if lat_diff < LAT_LON_THRESHOLD and lon_diff < LAT_LON_THRESHOLD:
            app.logger.info(f"RESPONSE LOG: Returning city name for lat: {round(float(lat), 2)} and lon: {round(float(lon), 2)} from cashed name data")
            return entry["data"]


    # ------ Making the API Call ------

    # If no data was found in the cashe, construct the url to make the request
    url = f"{API_URLS['NAME']}?lat={lat}&lon={lon}&limit=1&appid={API_KEYS['OPENWEATHERMAP']}"
    # Make the request to the api
    name_response = requests.get(url)

    # If response was successfull
    if name_response.status_code == 200:
        # Convert response to JSON
        name_data = name_response.json()
        # Record data in the name cashe
        name_cache[(lat,lon)] = {"timestamp": current_time, "lat": lat, "lon": lon, "data": name_data}
        app.logger.info(f"RESPONSE LOG: Returning city name for lat: {round(float(lat), 2)} and lon: {round(float(lon), 2)} from API")
        # Return recorded data
        return jsonify(name_data)
    else:
        # Return error if response was not successfull
        return jsonify({"error": "Failed to fetch city name by lat and lon coordinates from API"}), name_response.status_code

# Run file on port 5003
if __name__ == '__main__':
    app.run(port=5003, debug=True)