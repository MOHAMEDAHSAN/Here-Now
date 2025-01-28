import React from 'react';
import { MapPin, Trash2, Clock } from 'lucide-react';
import type { Alarm } from '../App';

const CATEGORY_COLORS = {
  important: 'bg-red-500',
  work: 'bg-blue-500',
  shopping: 'bg-green-500',
  pickup: 'bg-yellow-500',
  other: 'bg-gray-500',
} as const;

const CATEGORY_LABELS = {
  important: 'Important',
  work: 'Work',
  shopping: 'Shopping',
  pickup: 'Pick Up',
  other: 'Other',
} as const;

interface Props {
  alarms: Alarm[];
  onDelete: (id: string) => void;
}

const AlarmList: React.FC<Props> = ({ alarms, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-600">
        <h2 className="text-xl font-semibold text-white">Active Alarms</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {alarms.map((alarm) => (
          <div key={alarm.id} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">{alarm.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{alarm.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${CATEGORY_COLORS[alarm.category]}`}>
                      {CATEGORY_LABELS[alarm.category]}
                    </span>
                    <span className="inline-flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {alarm.estimatedTime || 'Calculating...'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {alarm.latitude.toFixed(6)}, {alarm.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDelete(alarm.id)}
                className="text-red-500 hover:text-red-700 focus:outline-none"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
        {alarms.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No alarms set
          </div>
        )}
      </div>
    </div>
  );
};

export default AlarmList;