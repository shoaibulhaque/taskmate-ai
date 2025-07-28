import React from "react";
import { Link } from "react-router-dom";
import { FaTasks, FaBolt, FaBrain } from "react-icons/fa";

const LandingPage: React.FC = () => {
  return (
    <div
      className="bg-base-100 text-base-content min-h-screen flex flex-col"
      data-theme="taskmate"
    >
      {/* Header */}
      <header className="border-b border-base-300 shadow-sm sticky top-0 z-50 bg-base-100">
        <nav className="container mx-auto px-2 sm:px-4 md:px-6 py-4 flex flex-wrap justify-between items-center gap-2">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            TaskMate
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
            <Link
              to="/login"
              className="hover:underline hover:text-primary transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn btn-primary rounded-full px-4 sm:px-6"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-grow w-full">
        <section className="container mx-auto px-2 sm:px-4 md:px-6 py-12 md:py-20 text-center animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-primary leading-tight break-words">
            Focus on What <span className="text-secondary">Matters</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-base-content max-w-3xl mx-auto">
            TaskMate is your intelligent productivity partner, designed to help
            you organize, prioritize, and get things done effortlessly.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="btn btn-primary btn-lg rounded-full px-6 sm:px-8 shadow-lg hover:scale-105 transition-transform"
            >
              Start Organizing
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-base-200 py-10 sm:py-16 md:py-20">
          <div className="container mx-auto px-2 sm:px-4 md:px-6">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">
                A Smarter Way to Manage Tasks
              </h2>
              <p className="text-base-content text-base sm:text-lg">
                Clean. Simple. Powerful — just what you need.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
              {/* Feature Cards */}
              {[
                {
                  Icon: FaTasks,
                  title: "Effortless Organization",
                  desc: "Simple and clean task management for your daily workflow.",
                },
                {
                  Icon: FaBolt,
                  title: "Real-Time Sync",
                  desc: "Tasks update instantly across all your devices.",
                },
                {
                  Icon: FaBrain,
                  title: "AI-Powered Assistance",
                  desc: "Let AI break down complex tasks and provide smart suggestions.",
                },
              ].map(({ Icon, title, desc }, i) => (
                <div
                  key={i}
                  className="p-6 sm:p-8 bg-base-100 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 text-center flex flex-col items-center"
                >
                  <Icon className="text-4xl sm:text-5xl text-primary mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">
                    {title}
                  </h3>
                  <p className="text-base-content text-sm sm:text-base">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-base-300 mt-auto">
        <div className="container mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 text-center text-base-content text-xs sm:text-sm">
          <p>© {new Date().getFullYear()} TaskMate. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
