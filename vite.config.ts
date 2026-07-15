import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Pas de proxy ici : la couche API construit des URL absolues vers
// VITE_API_URL, donc rien ne passait par lui. Il redirigeait en revanche
// /projects, /users, /auth… vers le backend — or ce sont aussi des routes du
// routeur React : tout lien direct ou rafraichissement sur /projects/<id>
// renvoyait du JSON backend au lieu de l'application, y compris en mode mock,
// ou aucun backend n'est censé tourner.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@features": path.resolve(__dirname, "./src/features"),
    },
  },
});
