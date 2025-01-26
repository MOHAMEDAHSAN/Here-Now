import React, { useEffect, useState } from 'react';
import { addAlarm, getAlarms } from '../api/alarms';

const AlarmComponent = () => {
  const [alarms, setAlarms] = useState<any[]>([]);

  // Fetch alarms when the component loads
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await getAlarms();
      if (error) {
        console.error('Error fetching alarms:', error);
      } else {
        setAlarms(data);
      }
    };
    fetchData();
  }, []);

  const createAlarm = async () => {
    const { data, error } = await addAlarm('Alarm Name', 'Alarm Message', 'Alarm Location');
    if (error) {
      console.error('Error creating alarm:', error);
    } else {
      console.log('Alarm created:', data);
    }
  };

  return (
    <div>
      <h1>Alarms</h1>
      <ul>
        {alarms.map((alarm) => (
          <li key={alarm.id}>
            {alarm.name} - {alarm.message} ({alarm.location})
          </li>
        ))}
      </ul>
      <button onClick={createAlarm}>Add Alarm</button>
    </div>
  );
};

export default AlarmComponent;
