import React from 'react';
import Header from './Header';

export default function Layout({ children, currentUser, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header currentUser={currentUser} onLogout={onLogout} />
      <main className="max-w-7xl mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
