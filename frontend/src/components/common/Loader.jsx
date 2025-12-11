import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ fullScreen = true, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin mr-3" />
      <span className="text-gray-600">{message}</span>
    </div>
  );
};

export default Loader;