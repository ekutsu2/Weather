from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import time
import json
import os
from Utils.BackendUtils import API_KEYS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Cache for search suggestions to reduce API calls
suggestions_cache = {}
CACHE_EXPIRATION = 86400  # 24 hours

# Common cities for fallback when API is unavailable or for initial suggestions
COMMON_CITIES = [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", 
    "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
    "London", "Tokyo", "Paris", "Berlin", "Sydney", "Beijing", 
    "Moscow", "Cairo", "Rome", "Toronto", "Madrid", "Mumbai"
]

@app.route('/suggestions', methods=['GET'])
def get_suggestions():
    """
    Return city suggestions based on partial input.
    This endpoint supports the autocomplete feature of the search bar.
    """
    query = request.args.get('query', '')
    
    # If query is empty or too short, return common cities
    if not query or len(query) < 2:
        return jsonify(COMMON_CITIES[:10])
    
    # Check cache first
    current_time = time.time()
    if query in suggestions_cache:
        cached_data = suggestions_cache[query]
        # Return cached data if it's still valid
        if current_time - cached_data["timestamp"] < CACHE_EXPIRATION:
            return jsonify(cached_data["data"])
        else:
            # Remove expired cache entry
            del suggestions_cache[query]
    
    try:
        # Use the OpenWeatherMap Geocoding API to find city suggestions
        geocoding_url = f"https://api.openweathermap.org/geo/1.0/direct?q={query}&limit=10&appid={API_KEYS.get('OPENWEATHERMAP')}"
        response = requests.get(geocoding_url)
        
        if response.status_code != 200:
            # Fallback to common cities filtered by query
            filtered_cities = [city for city in COMMON_CITIES if query.lower() in city.lower()]
            return jsonify(filtered_cities[:10])
        
        data = response.json()
        
        # Extract city names from the response
        suggestions = []
        for item in data:
            city_name = item.get('name', '')
            country = item.get('country', '')
            state = item.get('state', '')
            
            # Format the suggestion as "City, State, Country" if state exists
            # Otherwise, format as "City, Country"
            if state:
                suggestion = f"{city_name}, {state}, {country}"
            else:
                suggestion = f"{city_name}, {country}"
                
            suggestions.append(suggestion)
        
        # Cache the results
        suggestions_cache[query] = {
            "timestamp": current_time,
            "data": suggestions
        }
        
        return jsonify(suggestions)
        
    except Exception as e:
        app.logger.error(f"Error fetching suggestions: {str(e)}")
        # Fallback to common cities filtered by query
        filtered_cities = [city for city in COMMON_CITIES if query.lower() in city.lower()]
        return jsonify(filtered_cities[:10])

@app.route('/recent-searches', methods=['GET', 'POST'])
def handle_recent_searches():
    """
    GET: Returns the user's recent searches
    POST: Adds a new search to the user's recent searches
    
    In a real application, this would be tied to user accounts.
    For simplicity, we'll store recent searches in a file.
    """
    recent_searches_file = 'recent_searches.json'
    
    # Create the file if it doesn't exist
    if not os.path.exists(recent_searches_file):
        with open(recent_searches_file, 'w') as f:
            json.dump([], f)
    
    if request.method == 'GET':
        try:
            with open(recent_searches_file, 'r') as f:
                recent_searches = json.load(f)
            return jsonify(recent_searches)
        except Exception as e:
            app.logger.error(f"Error reading recent searches: {str(e)}")
            return jsonify([])
            
    elif request.method == 'POST':
        try:
            # Get the search query from the request
            data = request.json
            query = data.get('query', '')
            
            if not query:
                return jsonify({"error": "No search query provided"}), 400
            
            # Read existing searches
            with open(recent_searches_file, 'r') as f:
                recent_searches = json.load(f)
            
            # Add the new search to the beginning of the list
            # Remove it first if it already exists to avoid duplicates
            if query in recent_searches:
                recent_searches.remove(query)
            
            # Add to the beginning
            recent_searches.insert(0, query)
            
            # Keep only the 10 most recent searches
            recent_searches = recent_searches[:10]
            
            # Save the updated list
            with open(recent_searches_file, 'w') as f:
                json.dump(recent_searches, f)
                
            return jsonify({"message": "Search added to recent searches", "recent_searches": recent_searches})
            
        except Exception as e:
            app.logger.error(f"Error updating recent searches: {str(e)}")
            return jsonify({"error": f"Failed to update recent searches: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(port=5006, debug=True)