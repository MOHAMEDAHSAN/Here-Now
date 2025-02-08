# Here&Now

## Overview
**Here&Now** is a web application designed to help users set **location-based alarms/reminders** to ensure they never miss an important moment, place, or time. The app provides additional features such as **weather reports and location insights**, making it a versatile tool for travelers, commuters, and anyone who wants to stay informed about their surroundings.

## Features
- **Location-Based Alarms**: Set reminders for specific locations so that you receive an alert when you arrive at or leave a place.
- **Weather Reports**: Get real-time weather updates for your selected locations using data from [WeatherAPI.com](https://www.weatherapi.com/).
- **Location Insights**: Gain useful information about a location, including nearby points of interest, using data from OpenStreetMap and OpenStreetsFree API.
- **Estimated Time to Reach**: Displays the estimated time required to reach the alarm distance.
- **Interactive Map Interface**: Easily select locations using an embedded map powered by OpenStreetMap.
- **User-Friendly UI**: A clean and intuitive design for effortless navigation and interaction.

## How to Use
1. **Add a New Alarm**:
   - Enter a location name or select it on the interactive map.
   - Provide latitude and longitude coordinates (optional, if manually selecting a location).
   - Choose a category for the alarm.
   - Add an optional message for the reminder.
   - Click "Add Alarm" to save it.

2. **Update Current Location**:
   - Click the "Update Current Location" button to refresh your real-time location.
   - View insights such as weather conditions and nearby places.

3. **View Weather and Location Insights**:
   - Access real-time weather reports for any selected location.
   - Get additional details about the area using OpenStreetMap data.

4. **Check Estimated Time to Reach**:
   - The app calculates and displays the estimated time required to reach your alarm distance.

## Deployment
Here&Now is currently deployed on **Vercel** and can be accessed at: 
👉 [https://here-now-five.vercel.app/](https://here-now-five.vercel.app/)

## Running Here&Now Locally
### Prerequisites
Make sure you have the following installed:
- **Git**
- **Node.js** (latest LTS version recommended)
- **npm** (comes with Node.js)
- **VS Code** or any preferred code editor

### Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/here-now.git
   ```
2. Navigate to the project folder:
   ```sh
   cd here-now
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add required API keys (WeatherAPI and OpenStreetsFree API) in the following format:
     ```env
     REACT_APP_WEATHER_API_KEY=your_weather_api_key
     REACT_APP_MAP_API_KEY=your_map_api_key
     ```
5. Start the development server:
   ```sh
   npm start
   ```
   or
   ```sh
   npm run dev
   ```
6. Open your browser and visit `http://localhost:3000/` to use the app.

## Tech Stack
- **Frontend**: React, JavaScript
- **Backend**: Node.js (if applicable for API handling)
- **APIs Used**:
  - WeatherAPI (for weather data)
  - OpenStreetsFree API (for location and GPS services)
- **Hosting**: Vercel

## Future Enhancements
- **Push Notifications**: Mobile and desktop notifications for location alarms.
- **Offline Mode**: Ability to cache and access recent alarms without an internet connection.
- **Custom Categories & Alerts**: More customization options for alarms.

## Contributing
If you'd like to contribute to **Here&Now**, feel free to fork the repository and submit a pull request. All contributions are welcome!

## License
This project is licensed under the **MIT License**.

---
🚀 *Never miss a moment, place, or time with Here&Now!*

