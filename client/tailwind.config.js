/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // You can add custom animations here if needed later
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        taskmate: {
          // A single, strong accent color for interactive elements
          primary: "#3b82f6", // A professional, cool blue
          "primary-content": "#ffffff",

          // Base colors for the UI
          "base-100": "#0f172a", // Main background (Dark Slate)
          "base-200": "#1e293b", // Card & Modal background
          "base-300": "#334155", // Hover & Border color
          "base-content": "#cbd5e1", // Primary text color (Light Gray)

          // A slightly brighter text for headings
          neutral: "#f1f5f9",

          // Functional colors
          info: "#0ea5e9",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",

          // Define a consistent, modern border radius
          "--rounded-box": "0.75rem", // for cards, modals, etc.
          "--rounded-btn": "0.5rem", // for buttons
        },
      },
    ],
    darkTheme: "taskmate", // Set our custom theme as the default
  },
};
