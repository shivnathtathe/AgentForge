import os
import requests

def run():
    """
    Gets the current weather for Mumbai using the OpenWeatherMap API.

    Requires the OPENWEATHERMAP_API_KEY environment variable to be set.
    """
    api_key = os.getenv("OPENWEATHERMAP_API_KEY")
    if not api_key:
        return "OpenWeatherMap API key not found. Please set the OPENWEATHERMAP_API_KEY environment variable."

    city = "Mumbai"
    base_url = "https://api.openweathermap.org/data/2.5/weather?"

    try:
        # Complete URL
        complete_url = base_url + "appid=" + api_key + "&q=" + city + "&units=metric" # Use metric for Celsius

        # Get method of requests module
        response = requests.get(complete_url)

        # Convert response body to json()
        data = response.json()

        # Check if the request was successful
        if data["cod"] != "404":
            # Store the value of "main" key in variable y
            main_data = data["main"]

            # Store the value corresponding to the "temp" key
            current_temperature = main_data["temp"]

            # Store the value corresponding to the "description" key
            weather_description = data["weather"][0]["description"]

            # City name from response
            city_name_from_api = data.get("name", city)

            # Format the output
            result = (
                f"The current weather in {city_name_from_api} is {weather_description} "
                f"with a temperature of {current_temperature}°C."
            )
            return result
        else:
            return f"City '{city}' not found."

    except requests.exceptions.RequestException as e:
        return f"Error fetching weather data: {e}"
    except Exception as e:
        return f"An unexpected error occurred: {e}"

# Example of how you might run this (assuming environment variable is set)
# if __name__ == "__main__":
#     print(run())