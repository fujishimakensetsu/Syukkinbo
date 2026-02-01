import React from 'react';

export default function Loading({ fullScreen = false, message = '読み込み中...' }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-slate-600 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      {message && (
        <p className="text-slate-400 text-sm">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
}
