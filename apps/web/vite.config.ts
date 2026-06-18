import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@hardwood/utils": path.resolve(__dirname, "../../packages/utils/src/index.ts"),
    },
  },
});