import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Sirf LOCAL development ke liye proxy kaam karta hai
    // Production (Render) mein VITE_API_BASE env variable use hota hai
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
