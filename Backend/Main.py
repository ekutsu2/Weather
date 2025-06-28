from flask import Flask
from flask_cors import CORS  # Import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Backend Endpoint "/" (Not meant to be called directly. Used to automatically run the backend .py files)
@app.route("/")
def home():
    # Success message when the server successfully starts
    return "SERVER LOG: Main.py is running! "

# An array of python file paths using os to get the relative file paths for different machines
# 5001, 5002, 5003, 5004, 5005, and 5006 are the ports the files run on
scripts = [
    (os.path.join(os.path.dirname(__file__), 'SavedSearches.py'), 5001),
    (os.path.join(os.path.dirname(__file__), 'WeatherForecast.py'), 5002),
    (os.path.join(os.path.dirname(__file__), 'GetCityName.py'), 5003),
    (os.path.join(os.path.dirname(__file__), 'GetCoordinates.py'), 5004),
    (os.path.join(os.path.dirname(__file__), 'GoogleMapsAPI.py'), 5005),
    (os.path.join(os.path.dirname(__file__), 'SuggestedSearches.py'), 5006)
]

# Array of running processes
processes = []
# Starts a subprocess for each python file in the scripts array using python3.11
for script, port in scripts:
    process = subprocess.Popen(["python3.11", script])
    processes.append(process)


try:
    # Keeps all processes running
    for process in processes:
        process.wait()
except KeyboardInterrupt:
    # Shuts down all python files when the user uses a keyboard interupt to stop the program
    print("Shutting down all services...")
    for process in processes:
        process.terminate()

# Runs this file on port 5000
if __name__ == "__main__":
    app.run(debug=True)