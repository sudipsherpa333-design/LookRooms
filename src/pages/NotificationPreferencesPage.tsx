import React, { useState, useEffect } from 'react';

export const NotificationPreferencesPage = () => {
  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/notifications/preferences')
      .then(res => res.json())
      .then(data => setPreferences(data));
  }, []);

  const updatePreference = async (channel: string, enabled: boolean) => {
    const newPrefs = { ...preferences, channels: { ...preferences.channels, [channel]: enabled } };
    setPreferences(newPrefs);
    await fetch('/api/v1/notifications/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPrefs)
    });
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
