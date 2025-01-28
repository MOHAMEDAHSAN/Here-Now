import React, { useState } from 'react';
import { Crosshair } from 'lucide-react';
import type { Alarm } from '../App';

interface Props {
  onSubmit: (latitude: number, longitude: number, name: string, message: string, category: Alarm['category']) => void;
}

interface Location {
  lat: string;
  lon: string;
  display_name: string;
  importance: number;
  distance?: number;
}

const CATEGORIES = [
  { value: 'important', label: 'Important', color: 'bg-red-500' },
  { value: 'work', label: 'Work', color: 'bg-blue-500' },
  { value: 'shopping', label: 'Shopping', color: 'bg-green-500' },
  { value: 'pickup', label: 'Pick Up', color: 'bg-yellow-500' },
  { value: 'other', label: 'Other', color: 'bg-gray-500' },
] as const;

const AddAlarmForm: React.FC<Props> = ({ onSubmit }) => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [areaName, setAreaName] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<Alarm['category']>('other');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleAreaSearch = async (query: string) => {
    if (query.length < 3) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=10`
      );
      const data: Location[] = await response.json();
      
      // Sort results by distance if user location is available
      if (userLocation) {
        data.forEach(location => {
          location.distance = calculateDistance(
            userLocation.lat,
            userLocation.lon,
            parseFloat(location.lat),
            parseFloat(location.lon)
          );
        });
        
        data.sort((a, b) => {
          if (!a.distance || !b.distance) return 0;
          return a.distance - b.distance;
        });
      }
      
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching locations:', error);
    }
  };

  const handleLocationSelect = (location: Location) => {
    setLatitude(location.lat);
    setLongitude(location.lon);
    setAreaName(location.display_name);
    setSearchResults([]);
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude.toString());
          setLongitude(longitude.toString());
          setUserLocation({ lat: latitude, lon: longitude });
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setAreaName(data.display_name);
          } catch (error) {
            console.error('Error getting location name:', error);
          }
          
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(Number(latitude), Number(longitude), areaName, message || '(No message)', category);
    setLatitude('');
    setLongitude('');
    setAreaName('');
    setMessage('');
    setCategory('other');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Area/Location Name
        </label>
        <div className="relative">
          <input
            type="text"
            value={areaName}
            onChange={(e) => {
              setAreaName(e.target.value);
              handleAreaSearch(e.target.value);
            }}
            className="w-full pl-4 pr-20 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search for a location..."
            required
          />
          <button
            type="button"
            onClick={getCurrentLocation}
            className="absolute right-2 top-2 p-1 text-gray-400 hover:text-blue-500"
            title="Use current location"
          >
            <Crosshair className="h-5 w-5" />
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleLocationSelect(result)}
                className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Alarm['category'])}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        >
          {CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Message (optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Enter a message for this location..."
        />
      </div>

      <button
        type="submit"
        disabled={isGettingLocation}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-400"
      >
        {isGettingLocation ? 'Getting Location...' : 'Add Alarm'}
      </button>
    </form>
  );
};

export default AddAlarmForm;
