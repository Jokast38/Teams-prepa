import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Importation de BrowserRouter, Routes et Route
import UserList from './components/UserList'; // Importation de UserList
import UserForm from './components/UserForm'; // Importation de UserForm
import EditUser from './components/EditUser'; // Assurez-vous que ce composant existe
import './App.css';

function App() {
  return (
    <Router>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 dark:text-gray-400">Ajoutez et affichez les utilisateurs facilement</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Routes>
            {/* Route pour afficher UserForm et UserList ensemble */}
            <Route
              path="/"
              element={
                <>
                  {/* Formulaire pour ajouter un utilisateur */}
                  <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <UserForm />
                  </section>

                  {/* Liste des utilisateurs */}
                  <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <UserList />
                  </section>
                </>
              }
            />

            {/* Route pour la modification d'un utilisateur */}
            <Route
              path="/edit/:id"
              element={
                <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <EditUser />
                </section>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;