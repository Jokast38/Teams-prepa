import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importation de useNavigate
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuthUser = () => {
  const [isLogin, setIsLogin] = useState(true); // État pour basculer entre login et register
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loginAttempts, setLoginAttempts] = useState(0); // Compteur des tentatives de connexion
  const [showForgotPassword, setShowForgotPassword] = useState(false); // Affiche le lien "Mot de passe oublié"
  const [resetEmail, setResetEmail] = useState(""); // Email pour la réinitialisation du mot de passe
  const [isResettingPassword, setIsResettingPassword] = useState(false); // État pour afficher le formulaire de réinitialisation

  const navigate = useNavigate(); // Hook pour rediriger l'utilisateur

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Requête pour la connexion
        const response = await axios.post("http://localhost:3003/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        // Stocker le token dans le localStorage
        const token = response.data.token;
        localStorage.setItem("token", token);

        console.log("Login successful:", response.data);
        toast.success("Connexion réussie !");
        setTimeout(() => {
          navigate("/dashboard"); // Redirige vers le tableau de bord après la connexion
        }, 1000); // Délai pour laisser le toast s'afficher
      } else {
        // Requête pour l'inscription
        const response = await axios.post("http://localhost:3003/auth/register", {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        });
        console.log("Registration successful:", response.data);
        toast.success("Inscription réussie !");
        setTimeout(() => {
          setIsLogin(true); // Bascule vers le formulaire de connexion après l'inscription
        }, 1000);
      }
    } catch (error) {
      console.error("Erreur :", error);
      toast.error("Mot de passe ou email erroné. Veuillez réessayer.");
      setLoginAttempts((prev) => prev + 1); // Incrémente le compteur des tentatives

      // Affiche le lien "Mot de passe oublié" après 3 tentatives échouées
      if (loginAttempts + 1 >= 3) {
        setShowForgotPassword(true);
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Requête pour réinitialiser le mot de passe
      const response = await axios.put(`http://localhost:3003/auth/reset-password/${resetEmail}`);
      console.log("Password reset successful:", response.data);
      toast.success("Mot de passe réinitialisé avec succès. Utilisez 'password123' pour vous connecter.");
      setTimeout(() => {
        setIsResettingPassword(false); // Retourne au formulaire de connexion
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de la réinitialisation :", error);
      toast.error("Erreur lors de la réinitialisation du mot de passe. Vérifiez l'email.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <ToastContainer /> {/* Conteneur pour afficher les toasts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full">
        {isResettingPassword ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
              Réinitialiser le mot de passe
            </h2>
            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full p-2 border rounded text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                  placeholder="Entrez votre email"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 transition"
              >
                Réinitialiser
              </button>
            </form>
            <button
              onClick={() => setIsResettingPassword(false)}
              className="mt-4 text-blue-500 hover:underline"
            >
              Retour à la connexion
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
              {isLogin ? "Connexion" : "Inscription"}
            </h2>
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Prénom</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full p-2 border rounded text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                      placeholder="Entrez votre prénom"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Nom</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full p-2 border rounded text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                      placeholder="Entrez votre nom"
                    />
                  </div>
                </>
              )}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                  placeholder="Entrez votre email"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                  placeholder="Entrez votre mot de passe"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 transition"
              >
                {isLogin ? "Se connecter" : "S'inscrire"}
              </button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-500 hover:underline ml-1"
                >
                  {isLogin ? "Créer un compte" : "Se connecter"}
                </button>
              </p>
              {showForgotPassword && (
                <p className="mt-4 text-red-500">
                  <button
                    type="button"
                    onClick={() => setIsResettingPassword(true)}
                    className="text-blue-500 hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthUser;