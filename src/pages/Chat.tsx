import React from 'react';

export default function Chat() {
  return (
    <div className="p-6 max-w-6xl mx-auto h-[600px] flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="flex-1 bg-white rounded-xl shadow-sm p-6 flex items-center justify-center">
        <p className="text-slate-500">Select a conversation to start chatting.</p>
      </div>
    </div>
  );
}
