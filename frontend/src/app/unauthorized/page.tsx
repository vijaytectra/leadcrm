'use client';

import React from 'react';
import { ShieldAlert, Home, ArrowLeft, Lock } from 'lucide-react';

export default function UnauthorizedPage() {
  const [requestId, setRequestId] = React.useState('');

  React.useEffect(() => {
    setRequestId(Math.random().toString(36).substring(7).toUpperCase());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl w-full">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-red-100 p-8 md:p-12">
          {/* Icon with animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-red-500 to-orange-600 rounded-full p-6">
                <ShieldAlert className="w-16 h-16 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Error code */}
          <div className="text-center mb-6">
            <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-2">
              403
            </h1>
            <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
              <Lock className="w-5 h-5" />
              <p className="text-xl md:text-2xl font-semibold">Unauthorized Access</p>
            </div>
          </div>

          {/* Description */}
          <div className="text-center mb-8">
            <p className="text-gray-600 text-lg mb-4">
              You don&apos;t have permission to access this resource. This area is restricted to authorized users only.
            </p>
            <p className="text-gray-500 text-sm">
              If you believe this is an error, please contact your administrator or try logging in with appropriate credentials.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.history.back()}
              className="group flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 hover:border-red-300 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              Go Back
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>
          </div>

          {/* Additional info */}
          <div className="mt-8 pt-6 border-t border-red-100">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <a href="/contact" className="hover:text-red-600 transition-colors duration-300 hover:underline">
                Contact Support
              </a>
              <span className="text-gray-300">•</span>
              <a href="/help" className="hover:text-red-600 transition-colors duration-300 hover:underline">
                Help Center
              </a>
              <span className="text-gray-300">•</span>
              <a href="/login" className="hover:text-red-600 transition-colors duration-300 hover:underline">
                Login
              </a>
            </div>
          </div>
        </div>

        {/* Error code reference */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Error Code: AUTH_403{requestId && ` • Request ID: ${requestId}`}
          </p>
        </div>
      </div>
    </div>
  );
}