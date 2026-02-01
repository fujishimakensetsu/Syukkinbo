import React from 'react';
import { EmailVerification } from '../components/auth';

export default function EmailVerificationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <EmailVerification />
    </div>
  );
}
