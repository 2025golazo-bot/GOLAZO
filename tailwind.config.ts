import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5e9bc4",
          dark: "#4a7fa3",
          light: "#8ab8d6",
          50: "#eef5fa",
        },
        accent: {
          DEFAULT: "#FFE8AB",
          dark: "#f0cf6e",
        },
        ink: "#1f2937",
      },
      fontFamily: {
        sans: [
          "'Hiragino Sans'",
          "'Noto Sans JP'",
          "'Yu Gothic'",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(31, 41, 55, 0.08), 0 1px 2px rgba(31, 41, 55, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
