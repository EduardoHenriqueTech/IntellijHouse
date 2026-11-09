import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Em desenvolvimento (npm run dev, porta 5173) as chamadas à API são repassadas ao back-end.
// Em produção o back-end serve o build direto da pasta backend/public, na mesma origem.
const API = "http://localhost:3000";
const rotasDaApi = ["/dispositivos", "/assistente", "/rotina", "/historico", "/docs", "/saude"];

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: Object.fromEntries(rotasDaApi.map((rota) => [rota, { target: API, changeOrigin: true }])),
  },
  build: {
    outDir: "../backend/public",
    emptyOutDir: true,
  },
});
