import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 flex items-center justify-center"
      data-theme="taskmate"
    >
      <div className="text-center">
        <div className="relative">
          {/* Main spinner */}
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>

          {/* Inner spinner */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-14 h-14 border-4 border-secondary/20 border-b-secondary rounded-full animate-spin"></div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold gradient-text">TaskMate</h2>
          <p className="text-neutral/70 font-medium">
            Loading your productivity hub...
          </p>

          {/* Loading dots */}
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-secondary rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-accent rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
