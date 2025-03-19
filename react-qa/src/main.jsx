import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Importation de React Query
import './index.css';
import App from './App.jsx';

// Création d'une instance de QueryClient
const queryClient = new QueryClient();

// Ajout de la gestion du mode sombre
const setDarkMode = () => {
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDarkMode) {
    document.documentElement.classList.add('dark'); // Ajoute la classe `dark` au <html>
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Appliquer le mode sombre au chargement
setDarkMode();

// Écouter les changements de préférence du mode sombre
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setDarkMode);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Fournir le QueryClient à l'application */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);