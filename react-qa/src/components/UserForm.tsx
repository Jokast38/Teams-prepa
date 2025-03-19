import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importation de useNavigate
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate(); // Hook pour rediriger l'utilisateur

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
        navigate("/dashbord"); // Redirige vers la page de connexion après l'inscription
      }, 1000);
    } catch (error) {
      console.error("Erreur :", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Inscription
        </h2>
        <form onSubmit={handleSubmit}>
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
            S'inscrire
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default UserForm;