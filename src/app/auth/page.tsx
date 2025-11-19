'use client'

import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function AuthPages() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit:', { email, password, fullName });
  };

  return (
    <div className="min-h-screen bg-[#FFF8DC] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements - Replace with your images */}
      <div className="absolute bottom-40 -left-50 opacity-80 pointer-events-none select-none" >
        <Image
          src="/image/illus auth1.png"
          alt="Decoration"
          width={400}
          height={400}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Illustration - Right side - Replace with your image */}
      <div className="absolute bottom-5 right-10 hidden lg:block">
        <Image
          src="/image/illus auth2.png"
          alt="Person illustration"
          width={280}
          height={280}
          className="w-auto h-auto"
        />
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md bg-white border-4 border-gray-800 rounded-lg p-8"
        style={{ boxShadow: '12px 12px 0 rgba(0,0,0,1)' }}>
        
        {/* Toggle Tabs */}
        <div className="flex mb-8 border-4 border-gray-800">
          <button
            onClick={() => setIsSignIn(true)}
            className={`flex-1 py-3 font-bold text-sm transition-all ${
              isSignIn 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => setIsSignIn(false)}
            className={`flex-1 py-3 font-bold text-sm transition-all ${
              !isSignIn 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            SIGN UP
          </button>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {isSignIn ? 'Welcome Back!' : 'Create Account'}
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          {isSignIn 
            ? 'Hey, Enter your details to sign in to your account' 
            : 'Hey, Enter your details to create your account'}
        </p>

        <div className="space-y-4">
          {!isSignIn && (
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-800 focus:outline-none focus:border-gray-900 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-800 focus:outline-none focus:border-gray-900 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 border-2 border-gray-800 focus:outline-none focus:border-gray-900 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isSignIn && (
            <div className="text-right">
              <a href="#" className="text-xs text-gray-600 hover:text-gray-900">
                Having trouble in sign in?
              </a>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-3 font-bold text-gray-800 transition-all duration-150"
            style={{
              backgroundColor: '#FFD93D',
              border: '3px solid #000',
              boxShadow: '6px 6px 0 rgba(0,0,0,1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(3px, 3px)';
              e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,0,0,1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = '6px 6px 0 rgba(0,0,0,1)';
            }}
          >
            {isSignIn ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        <p className="text-center mt-6 text-xs text-gray-600">
          {isSignIn ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsSignIn(!isSignIn)}
            className="font-bold text-gray-800 hover:underline"
          >
            {isSignIn ? 'Request Now' : 'Sign In'}
          </button>
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-600">
        Copyright @Aspire 2024 | Privacy Policy
      </div>
    </div>
  );
}