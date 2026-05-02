/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core dark backgrounds
        darkBg:    "#040814",
        navBg:     "#070d1a",
        cardBg:    "#0b1420",
        cardBorder:"#1a2744",

        // Accent blues
        accent:    "#3b82f6",
        accentHover:"#2563eb",
        accentLight:"#60a5fa",
        accentGlow: "rgba(59,130,246,0.25)",

        // Text
        textPrimary:   "#f0f4ff",
        textSecondary: "#6b7fa8",
        textMuted:     "#3d5080",

        // Status colors
        success: "#10b981",
        warning: "#f59e0b",
        danger:  "#ef4444",

        // Chart colors
        chart1: "#3b82f6",
        chart2: "#8b5cf6",
        chart3: "#06b6d4",
        chart4: "#10b981",
        chart5: "#f59e0b",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:    "0 4px 32px rgba(0,0,0,0.5)",
        glow:    "0 0 24px rgba(59,130,246,0.3)",
        glowSm:  "0 0 12px rgba(59,130,246,0.2)",
        inner:   "inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      borderRadius: {
        xl2: "1rem",
        xl3: "1.25rem",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}