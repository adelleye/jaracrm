import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1A140A",
        paper: "#EFE7D2",
        line: "#D5C8A6",
        calm: "#E6DCC1",
        palm: "#0B4030",
        mint: "#D9E2D6",
        amber: "#B5481E",
        coral: "#B5481E"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(60, 40, 10, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
