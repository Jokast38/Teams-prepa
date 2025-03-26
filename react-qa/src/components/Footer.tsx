import { useEffect } from "react";

export default function Footer() {
  // Synchroniser le mode sombre avec les préférences du navigateur
  useEffect(() => {
    const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (darkModePreference) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-6">
      <div className="container mx-auto px-4 text-center">
        {/* Informations de copyright */}
        <p className="text-sm">
          © {new Date().getFullYear()} Your Company. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}