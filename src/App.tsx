
import { useState } from 'react';
import Map from './components/Map';
import AlarmList from './components/AlarmList';
import AddAlarmForm from './components/AddAlarmForm';
import Footer from './components/Footer';
import logoImage from '/newicon.png';

export interface Alarm {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  message: string;
  category: 'important' | 'work' | 'shopping' | 'pickup' | 'other';
  estimatedTime?: string;
}

function App() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  const handleAddAlarm = (latitude: number, longitude: number, name: string, message: string, category: Alarm['category']) => {
    const newAlarm: Alarm = {
      id: Math.random().toString(36).substr(2, 9),
      latitude,
      longitude,
      name,
      message,
      category
    };
    setAlarms([...alarms, newAlarm]);
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id));
  };

  const updateAlarmTime = (id: string, estimatedTime: string) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === id ? { ...alarm, estimatedTime } : alarm
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=2000')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 opacity-90"></div>
        <div className="container mx-auto px-4 py-8 relative">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-lg border border-white border-opacity-20 transform hover:rotate-3 transition-transform duration-300 p-0">
              <img src={logoImage} alt="Here&Now Logo" className="w-16 h-16" />
            </div>
            <div>
              <h1 className="text-6xl font-black tracking-tighter" style={{ 
                textShadow: `
                  2px 2px 0 #4A90E2,
                  4px 4px 0 #357ABD,
                  6px 6px 0 #2868A9,
                  8px 8px 0px #1B5696
                `,
                fontFamily: 'system-ui'
              }}>Here&Now</h1>
              <p className="text-sm italic font-light mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                Never miss a moment, place, or time
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white backdrop-blur-lg bg-opacity-80 rounded-2xl shadow-xl border border-blue-100 p-6 transform hover:-translate-y-1 transition-all duration-300">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Alarm</h2>
              <AddAlarmForm onSubmit={handleAddAlarm} />
            </div>
            <AlarmList alarms={alarms} onDelete={handleDeleteAlarm} />
          </div>
          <div className="bg-white backdrop-blur-lg bg-opacity-80 rounded-2xl shadow-xl border border-blue-100 overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
            <Map alarms={alarms} onUpdateTime={updateAlarmTime} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
