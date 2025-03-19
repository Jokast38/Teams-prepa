import { useState } from "react";
import axios from "axios";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const UserForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newUser: typeof formData) => {
      return axios.post("http://localhost:3003/users", newUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setFormData({ firstName: "", lastName: "", email: "" }); // Réinitialisation du formulaire
      setErrors({ firstName: "", lastName: "", email: "" });
      setError(null);
    },
    onError: (err) => {
      setError("Une erreur est survenue. Veuillez réessayer.");
      console.error("Erreur:", err);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validation en temps réel
    if (name === "firstName" && value.trim() === "") {
      setErrors((prev) => ({ ...prev, firstName: "Le prénom est obligatoire." }));
    } else if (name === "lastName" && value.trim() === "") {
      setErrors((prev) => ({ ...prev, lastName: "Le nom est obligatoire." }));
    } else if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrors((prev) => ({ ...prev, email: "L'email n'est pas valide." }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-lg px-6 py-8 ring shadow-xl ring-gray-900/5 max-w-md mx-auto"
    >
      <div>
        <span className="inline-flex items-center justify-center rounded-md bg-indigo-500 p-2 shadow-lg">
          <svg
            className="h-6 w-6 stroke-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </span>
      </div>
      <h2 className="text-gray-900 dark:text-white mt-5 text-lg font-bold text-center">
        Ajouter un utilisateur
      </h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="mb-4">
        <input
          type="text"
          name="firstName"
          placeholder="Prénom"
          value={formData.firstName}
          onChange={handleChange}
          className={`border p-2 w-full rounded text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
            errors.firstName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          }`}
        />
        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
      </div>

      <div className="mb-4">
        <input
          type="text"
          name="lastName"
          placeholder="Nom"
          value={formData.lastName}
          onChange={handleChange}
          className={`border p-2 w-full rounded text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
            errors.lastName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          }`}
        />
        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
      </div>

      <div className="mb-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={`border p-2 w-full rounded text-gray-800 dark:text-gray-200 dark:bg-gray-700 ${
            errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          }`}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <button
        type="submit"
        className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        disabled={mutation.status === "pending"}
      >
        {mutation.status === "pending" ? "Ajout en cours..." : "Ajouter"}
      </button>
    </form>
  );
};

export default UserForm;