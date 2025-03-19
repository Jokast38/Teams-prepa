import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditUser = () => {
  const { id } = useParams(); // Récupère l'ID de l'utilisateur depuis l'URL
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [loading, setLoading] = useState(false); // Indicateur de chargement pour la récupération des données

  // Récupère les informations de l'utilisateur à modifier
  useEffect(() => {
    console.log("ID récupéré depuis l'URL :", id); // Vérifiez l'ID ici
    const fetchUser = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:3003/users/${id}`);
        console.log("Données utilisateur récupérées :", data); // Vérifiez les données ici
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
        });
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        toast.error("Utilisateur introuvable.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, [id]);

  const mutation = useMutation({
    mutationFn: async (updatedUser: typeof formData) => {
      console.log("Données envoyées pour la mise à jour :", updatedUser); // Vérifiez les données ici
      return axios.put(`http://localhost:3003/users/${id}`, updatedUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] }); // Recharge la liste des utilisateurs
      toast.success("Utilisateur mis à jour avec succès !"); // Affiche un toast de confirmation
      setTimeout(() => {
        navigate("/"); // Redirige vers la page d'accueil après un délai
      }, 2000); // Délai de 2 secondes pour laisser le toast s'afficher
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
      toast.error("Une erreur est survenue lors de la mise à jour.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Modifier l'utilisateur
      </h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg px-6 py-8 shadow-md max-w-md mx-auto"
      >
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Prénom</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full p-2 border rounded text-gray-800 dark:text-gray-200 dark:bg-gray-700"
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
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          disabled={mutation.isLoading} // Désactive le bouton pendant la mutation
        >
          {mutation.isLoading ? "Mise à jour..." : "Mettre à jour"}
        </button>
      </form>
      <ToastContainer /> {/* Conteneur pour afficher les toasts */}
    </div>
  );
};

export default EditUser;