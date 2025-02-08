import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon, LatLng, divIcon } from 'leaflet';
import { Compass, RefreshCw, CloudRain, AlertTriangle, Clock, ThermometerSun, Wind, Droplets } from 'lucide-react';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { Alarm } from '../App';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const CATEGORY_COLORS = {
  important: '#EF4444',
  work: '#3B82F6',
  shopping: '#10B981',
  pickup: '#F59E0B',
  other: '#6B7280',
};

const currentLocationIcon = divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
    <div class="w-3 h-3 bg-white rounded-full animate-ping absolute"></div>
    <div class="w-2 h-2 bg-white rounded-full"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const createAlarmIcon = (category: Alarm['category']) => divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center" style="background: ${CATEGORY_COLORS[category]}">
    <div class="w-2 h-2 bg-white rounded-full"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface MapProps {
  alarms: Alarm[];
  onUpdateTime: (id: string, time: string) => void;
}

interface WeatherInfo {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  timestamp: number;
  feelsLike: number;
  uvIndex: number;
}

interface WeatherError {
  message: string;
  retryAfter?: number;
}

const WEATHER_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const WEATHER_API_KEY = '08664519520f4182acd154355250402';
const RETRY_DELAY = 2000; // 2 seconds

async function fetchWeatherData(lat: number, lon: number, retries = 3): Promise<WeatherInfo> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=no`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) { // Rate limit exceeded
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
        throw { message: 'Rate limit exceeded', retryAfter: retryAfter * 1000 };
      }
      throw new Error(`Weather API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: Math.round(data.current.temp_c),
      condition: data.current.condition.text,
      description: data.current.condition.text,
      humidity: data.current.humidity,
      windSpeed: Math.round(data.current.wind_kph),
      timestamp: Date.now(),
      feelsLike: Math.round(data.current.feelslike_c),
      uvIndex: data.current.uv
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Weather request timed out');
    }

    if (retries > 0 && !(error as WeatherError).retryAfter) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWeatherData(lat, lon, retries - 1);
    }

    throw error;
  }
}

async function calculateTravelTime(start: LatLng, end: LatLng): Promise<string> {
  try {
    // Calculate straight-line distance first as a fallback
    const distance = start.distanceTo(end);
    const averageSpeed = 40; // Average speed in meters per second (roughly 144 km/h)
    const straightLineDuration = distance / averageSpeed;
    
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=false`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes[0]) {
        const duration = data.routes[0].duration;
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${minutes} min`;
      }
      
      // If OSRM response is invalid, fall back to straight-line calculation
      throw new Error('Invalid OSRM response');
      
    } catch (routingError) {
      // If OSRM fails, use straight-line distance calculation
      const hours = Math.floor(straightLineDuration / 3600);
      const minutes = Math.floor((straightLineDuration % 3600) / 60);
      
      if (hours > 0) {
        return `~${hours}h ${minutes}m`;
      }
      return `~${minutes} min`;
    }
  } catch (error) {
    console.error('Error calculating travel time:', error);
    return '~calculating';
  }
}

function InitialMapView() {
  const map = useMap();
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 13);
      },
      (error) => {
        console.error('Error getting initial location:', error);
      }
    );
  }, [map]);

  return null;
}

function LocationMarker({ onPositionFound }: { onPositionFound: (pos: LatLng) => void }) {
  const [position, setPosition] = useState<LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latlng = new LatLng(position.coords.latitude, position.coords.longitude);
        setPosition(latlng);
        onPositionFound(latlng);
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  }, [map, onPositionFound]);

  return position === null ? null : (
    <>
      <Marker position={position} icon={currentLocationIcon}>
        <Popup className="rounded-lg shadow-xl">
          <div className="font-semibold text-blue-600">You are here</div>
        </Popup>
      </Marker>
      <Circle
        center={position}
        radius={100}
        pathOptions={{ 
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.1,
          weight: 1
        }}
      />
    </>
  );
}

function LocationButton() {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleClick = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.flyTo([latitude, longitude], 13, {
          duration: 1.5,
          easeLinearity: 0.25
        });
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLocating(false);
      }
    );
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLocating}
      className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Return to my location"
    >
      <Compass className={`h-6 w-6 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
    </button>
  );
}

const Map: React.FC<MapProps> = ({ alarms, onUpdateTime }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherRetryTimeout, setWeatherRetryTimeout] = useState<NodeJS.Timeout | null>(null);
  const [nearbyAlerts, setNearbyAlerts] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);

  const updateWeather = async (position: LatLng) => {
    // Clear any existing retry timeout
    if (weatherRetryTimeout) {
      clearTimeout(weatherRetryTimeout);
      setWeatherRetryTimeout(null);
    }

    // Check cache validity
    if (weather && Date.now() - weather.timestamp < WEATHER_CACHE_DURATION) {
      return;
    }

    setWeatherError(null);
    
    try {
      const weatherData = await fetchWeatherData(position.lat, position.lng);
      setWeather(weatherData);
    } catch (error) {
      const weatherError = error as WeatherError;
      console.error('Weather fetch error:', weatherError);
      
      if (weatherError.retryAfter) {
        setWeatherError('Weather service is busy. Retrying soon...');
        const timeout = setTimeout(() => {
          updateWeather(position);
        }, weatherError.retryAfter);
        setWeatherRetryTimeout(timeout);
      } else {
        setWeatherError('Unable to fetch weather data. Please try again later.');
      }
    }
  };

  const handlePositionFound = async (position: LatLng) => {
    setCurrentLocation(position);
    
    // Update travel times for alarms
    for (const alarm of alarms) {
      const time = await calculateTravelTime(
        position,
        new LatLng(alarm.latitude, alarm.longitude)
      );
      onUpdateTime(alarm.id, time);
    }

    // Update weather data
    await updateWeather(position);

    // Update nearby alerts based on actual distance and weather conditions
    const alerts = alarms
      .filter(alarm => {
        const alarmPos = new LatLng(alarm.latitude, alarm.longitude);
        return position.distanceTo(alarmPos) < 5000; // Within 5km
      })
      .map(alarm => `${alarm.category.charAt(0).toUpperCase() + alarm.category.slice(1)} alert near ${alarm.name}`);
    
    setNearbyAlerts(alerts);
  };

  const handleUpdateLocation = () => {
    setIsUpdating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handlePositionFound(new LatLng(latitude, longitude))
          .finally(() => setIsUpdating(false));
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsUpdating(false);
      }
    );
  };

  // Cleanup weather retry timeout
  useEffect(() => {
    return () => {
      if (weatherRetryTimeout) {
        clearTimeout(weatherRetryTimeout);
      }
    };
  }, [weatherRetryTimeout]);

  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-[400px]">
          <MapContainer
            center={[0, 0]}
            zoom={2}
            className="h-full w-full"
            dragging={true}
            doubleClickZoom={true}
            scrollWheelZoom={true}
            attributionControl={true}
            zoomControl={true}
          >
            <InitialMapView />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker onPositionFound={handlePositionFound} />
            <LocationButton />
            {alarms.map((alarm) => (
              <React.Fragment key={alarm.id}>
                <Marker position={[alarm.latitude, alarm.longitude]} icon={createAlarmIcon(alarm.category)}>
                  <Popup className="rounded-lg shadow-xl">
                    <div className="min-w-[200px]">
                      <h3 className="font-semibold text-lg mb-1" style={{ color: CATEGORY_COLORS[alarm.category] }}>
                        {alarm.name}
                      </h3>
                      <p className="text-gray-600 mb-2">{alarm.message}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: CATEGORY_COLORS[alarm.category] }}>
                          {alarm.category.charAt(0).toUpperCase() + alarm.category.slice(1)}
                        </span>
                        {alarm.estimatedTime && (
                          <span className="text-sm text-gray-500">
                            {alarm.estimatedTime} away
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {alarm.latitude.toFixed(6)}, {alarm.longitude.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={[alarm.latitude, alarm.longitude]}
                  radius={500}
                  pathOptions={{
                    color: CATEGORY_COLORS[alarm.category],
                    fillColor: CATEGORY_COLORS[alarm.category],
                    fillOpacity: 0.08,
                    weight: 1
                  }}
                />
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
        <button
          onClick={handleUpdateLocation}
          disabled={isUpdating}
          className="w-full bg-blue-600 text-white px-4 py-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-400 flex items-center justify-center gap-2 border-t border-gray-100"
        >
          <RefreshCw className={`h-5 w-5 ${isUpdating ? 'animate-spin' : ''}`} />
          {isUpdating ? 'Updating Location...' : 'Update Current Location'}
        </button>
      </div>

      {currentLocation && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <CloudRain className="h-5 w-5" />
              Location Insights
            </h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {weatherError ? (
              <div className="p-4">
                <div className="text-amber-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {weatherError}
                </div>
              </div>
            ) : weather ? (
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <ThermometerSun className="h-4 w-4" />
                  Weather Conditions
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2 bg-blue-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-900">{weather.temperature}°C</div>
                    <div className="text-blue-600 capitalize">{weather.description}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Feels like {weather.feelsLike}°C • UV Index: {weather.uvIndex}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Wind className="h-4 w-4" />
                      Wind Speed
                    </div>
                    <div className="text-xl font-semibold text-gray-900">
                      {weather.windSpeed} km/h
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Droplets className="h-4 w-4" />
                      Humidity
                    </div>
                    <div className="text-xl font-semibold text-gray-900">
                      {weather.humidity}%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Last updated: {new Date(weather.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="p-4 text-gray-500">
                Loading weather data...
              </div>
            )}

            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Nearby Alerts
              </h3>
              {nearbyAlerts.length > 0 ? (
                <ul className="space-y-2">
                  {nearbyAlerts.map((alert, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      {alert}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No alerts in your area</p>
              )}
            </div>

            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Last updated
                </span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
