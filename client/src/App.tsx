import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store";
import {
  socketService,
  requestNotificationPermission,
} from "./services/socket";

// Components (we'll create these next)
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import Navbar from "./components/Navbar";
import LoadingSpinner from "./components/LoadingSpinner";

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

function App() {
  const { isAuthenticated, user, setLoading } = useAuthStore();

  useEffect(() => {
    // Request notification permission on app load
    requestNotificationPermission();

    // Initialize auth state from localStorage
    const token = localStorage.getItem("token");
    if (token && !user) {
      setLoading(true);
      // In a real app, you'd validate the token with the server
      // For now, we'll just check if token exists
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 > Date.now()) {
          // Token is still valid
          const userData = {
            id: payload.userId,
            username: payload.username || "User",
            email: payload.email || "user@example.com",
          };
          useAuthStore.getState().setUser(userData);
        } else {
          // Token expired
          useAuthStore.getState().logout();
        }
      } catch (error) {
        console.error("Invalid token:", error);
        useAuthStore.getState().logout();
      }
      setLoading(false);
    }
  }, [user, setLoading]);

  useEffect(() => {
    // Connect to Socket.io when user is authenticated
    if (isAuthenticated && user) {
      socketService.connect(user.id);
    } else {
      socketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, user]);

  return (
    <Router>
      <div
        className="min-h-screen bg-base-100 text-base-content"
        data-theme="taskmate"
      >
        {isAuthenticated && <Navbar />}

        <main className={isAuthenticated ? "pt-16" : ""}>
          <Routes>
            {/* Landing Page */}
            <Route
              path="/"
              element={
                !isAuthenticated ? (
                  <LandingPage />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />

            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
