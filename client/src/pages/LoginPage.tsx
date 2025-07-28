import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";
import { authApi } from "../services/api";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await authApi.login(formData);
      login(response.user, response.token);
      navigate("/dashboard");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-950 p-2 sm:p-4"
      data-theme="sleek"
    >
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-200">Welcome Back</h1>
          <p className="text-slate-400">
            Sign in to access your TaskMate dashboard.
          </p>
        </div>
        <div className="card bg-slate-900 border border-slate-800">
          <div className="card-body">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-error text-sm py-2">
                  <span>{error}</span>
                </div>
              )}
              <input
                name="email"
                type="email"
                required
                className="input input-bordered w-full bg-slate-950"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              <input
                name="password"
                type="password"
                required
                className="input input-bordered w-full bg-slate-950"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Sign In"
                )}
              </button>
              <p className="text-center text-sm text-slate-400 pt-2">
                No account?{" "}
                <Link
                  to="/register"
                  className="link link-primary font-semibold"
                >
                  Sign up
                </Link>
              </p>
              <p className="text-center text-xs mt-2">
                <Link to="/" className="link link-secondary">
                  ← Back to Home
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
