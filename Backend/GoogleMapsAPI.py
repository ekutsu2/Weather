from flask import Flask, jsonify, request
from flask_cors import CORS
from config import API_KEYS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Cache for storing the API key to avoid unnecessary lookups
maps_api_key = None

@app.route('/google-maps-key', methods=['GET'])
def get_google_maps_key():
    """
    Return the Google Maps API key from a secure server-side location
    This prevents exposing the key in client-side code
    """
    global maps_api_key
    
    # Using cached key if available
    if maps_api_key:
        return jsonify({"apiKey": maps_api_key})
    
    # Get the API key from the backend utils
    # Assuming API_KEYS has a 'GOOGLE_MAPS' entry
    # If not, we'll need to add it or use a different key
    try:
        maps_api_key = API_KEYS.get('GOOGLE_MAPS', 'Replace with your Google Maps API key')
        
        # Check if we have a valid key
        if not maps_api_key or maps_api_key == '':
            return jsonify({"error": "Google Maps API key is not configured"}), 500
            
        return jsonify({"apiKey": maps_api_key})
    except Exception as e:
        app.logger.error(f"Error getting Google Maps API key: {str(e)}")
        return jsonify({"error": "Failed to retrieve Google Maps API key"}), 500

@app.route('/geocode', methods=['GET'])
def geocode_location():
    """
    Proxy for Google's Geocoding API to convert addresses to coordinates
    This hides the API key from client-side code
    """
    location = request.args.get('location')
    
    if not location:
        return jsonify({"error": "Location parameter is required"}), 400
    
    global maps_api_key
    
    # Get the API key if not already cached
    if not maps_api_key:
        maps_api_key = API_KEYS.get('GOOGLE_MAPS')
        if not maps_api_key:
            app.logger.error('Google Maps API key not found in config')
            return jsonify({'error': 'Google Maps API key not configured'}), 500
    
    import requests
    
    # Make request to Google's Geocoding API
    geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={location}&key={maps_api_key}"
    
    try:
        response = requests.get(geocode_url)
        
        if response.status_code != 200:
            app.logger.error(f"Geocoding API error: {response.status_code}")
            return jsonify({"error": "Failed to geocode location"}), response.status_code
        
        geocode_data = response.json()
        
        # Return the geocoded data to the client
        return jsonify(geocode_data)
    except Exception as e:
        app.logger.error(f"Error geocoding location: {str(e)}")
        return jsonify({"error": f"Failed to geocode location: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(port=5005, debug=True)