import React from "react";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center">
      <div className="animate-spin" style={{ animationDuration: '4s' }}>
        {/* Red circular sign */}
        <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-lg flex items-center justify-center border-4 border-red-800">
          <span className="text-white text-3xl font-bold">BID!</span>
        </div>
        
        {/* Wooden stick */}
        <div className="w-2 h-24 bg-gradient-to-b from-amber-700 to-amber-900 rounded-full mx-auto shadow-md"></div>
        
        {/* Hand holding the stick */}
        
      </div>
    </div>
  );
};

export default LoadingScreen;