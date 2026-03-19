import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const NotificationPreferencesPage = () => {
  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    axiosInstance.get('/notifications/preferences')
      .then(res => setPreferences(res.data));
  }, []);

  const updatePreference = async (channel: string, enabled: boolean) => {
    const newPrefs = { ...preferences, channels: { ...preferences.channels, [channel]: enabled } };
    setPreferences(newPrefs);
    await axiosInstance.put('/notifications/preferences', newPrefs);
  };

  if (!preferences) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Notification Preferences</h2>
      <div className="space-y-4">
        {Object.entries(preferences.channels).map(([channel, enabled]) => (
          <div key={channel} className="flex items-center justify-between p-4 border rounded">
            <span className="capitalize">{channel}</span>
            <input 
              type="checkbox" 
              checked={enabled as boolean} 
              onChange={(e) => updatePreference(channel, e.target.checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
