import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Importation de BrowserRouter, Routes et Route
import UserList from './components/UserList'; // Importation de UserList
import UserForm from './components/UserForm'; // Importation de UserForm
import EditUser from './components/EditUser'; // Assurez-vous que ce composant existe
import Dashboard from './components/Dashboard'; // Importation du Dashboard
import AuthUser from './components/AuthUser'; // Importation de AuthUser
import Hero from './components/Hero'; // Importation de Hero
import Footer from './components/Footer'; // Importation de Footer
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route pour la page d'accueil */}
        <Route
          path="/"
          element={
            <>
              <Hero />
            </>
          }
        />
        {/* Route pour afficher UserForm et UserList ensemble */}
        <Route
          path="/admin"
          element={
            <>
              <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <header className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestion des Utilisateurs</h1>
                  <p className="text-gray-600 dark:text-gray-400">Ajoutez et affichez les utilisateurs facilement</p>
                </header>
                <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Formulaire pour ajouter un utilisateur */}
                  <UserForm />
                {/* Liste des utilisateurs */}
                  <UserList />
                  </div>
                </section>
              </div>
            </>
          }
        />

        {/* Route pour la modification d'un utilisateur */}
        <Route
          path="/edit/:id"
          element={
            <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
              <header className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestion des Utilisateurs</h1>
                <p className="text-gray-600 dark:text-gray-400">Modification</p>
              </header>
              <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <EditUser />
              </section>
            </div>
          }
        />

        {/* Route pour le Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />} // Assurez-vous que le composant est bien importé et utilisé
        />

        {/* Route pour l'authentification */}
        <Route
          path="/auth"
          element={
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <AuthUser />
            </section>
          }
        />
      </Routes>
        <Footer />
    </Router >
  );
}

export default App;