import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess }) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('admin@udm.edu.ph');
  const [password, setPassword] = useState('admin123');
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Authentication failed.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to authentication server.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setForgotSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-gradient-to-tr from-[#002B49] to-[#0056B3] text-yellow-400 rounded-2xl shadow-md">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            UNIVERSIDAD DE MANILA
          </h2>
          <p className="text-xs font-semibold text-blue-900">
            Campus Safety & IoT Vape Detection System
          </p>
        </div>

        {/* Login Form */}
        {!isForgotMode ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotMode(true)}
                  className="text-blue-600 hover:underline font-semibold text-[11px]"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#002B49] hover:bg-[#003B66] text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm mt-2"
            >
              <span>Login as Safety Administrator</span>
              <ArrowRight className="w-4 h-4 text-yellow-400" />
            </button>

            <p className="text-[11px] text-center text-slate-400 pt-2">
              Demo Credentials: <span className="font-mono text-slate-700 font-bold">admin@udm.edu.ph</span> / <span className="font-mono text-slate-700 font-bold">admin123</span>
            </p>
          </form>
        ) : (
          /* Forgot Password Flow */
          <div className="space-y-4 text-xs">
            {!forgotSubmitted ? (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  <span>Reset Password</span>
                </div>
                <p className="text-slate-500">
                  Enter your UDM administrator email address to receive password reset instructions.
                </p>

                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotMode(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Back to Login
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-3 py-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-800 text-sm">Reset Request Sent!</p>
                <p className="text-slate-500">
                  Password reset instructions have been sent to <span className="font-mono font-bold text-slate-800">{email}</span>.
                </p>
                <button
                  onClick={() => {
                    setIsForgotMode(false);
                    setForgotSubmitted(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
