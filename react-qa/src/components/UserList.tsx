import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTrash } from "react-icons/fa"; // Importation de l'icône poubelle
import { Link } from "react-router-dom"; // Importation de Link pour la navigation

interface User {
    id: string; // Assurez-vous que l'ID est une chaîne (MongoDB utilise des ObjectId)
    firstName: string;
    lastName: string;
    email: string;
}


const fetchUsers = async (): Promise<User[]> => {
    const token = localStorage.getItem("token"); // Récupère le token JWT depuis le localStorage
    if (!token) {
        throw new Error("Utilisateur non authentifié");
    }

    const { data } = await axios.get("http://localhost:3003/users", {
        headers: {
            Authorization: `Bearer ${token}`, // Ajoute le token JWT dans les en-têtes
        },
    });

    return data.map((user) => ({
        id: user.id, // Utilise `id` directement
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
    }));
};


const deleteUser = async (id: string) => {
    const token = localStorage.getItem("token"); // Récupère le token JWT depuis le localStorage
    if (!token) {
        throw new Error("Utilisateur non authentifié");
    }

    await axios.delete(`http://localhost:3003/users/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`, // Ajoute le token JWT dans les en-têtes
        },
    });
};
const UserList = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data, error, isLoading } = useQuery<User[]>({
        queryKey: ["users"],
        queryFn: fetchUsers,
    });

    const mutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] }); // Recharge la liste des utilisateurs
        },
        onError: (error) => {
            console.error("Erreur lors de la suppression :", error);
        },
    });


    const handleEditClick = (id: string) => {
        console.log("ID de l'utilisateur cliqué :", id);
        navigate(`/edit/${id}`); // Redirige manuellement vers la page de modification
    };

    if (isLoading) {
        return (
            <div className="loading">
                <div className="spinner-wrapper">
                    <span className="spinner-text text-blue-500 font-semibold">Chargement des utilisateurs...</span>
                    <span className="spinner"></span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500">
                <p>Erreur lors du chargement des utilisateurs.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
                Liste des utilisateurs
            </h2>
            {/* Conteneur avec scroll */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg max-h-[600px] overflow-y-auto">
                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data?.map((user: User) => (
                        <li
                            key={user.id}
                            className="flex justify-between gap-x-6 py-5 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                            {/* Avatar et informations utilisateur */}
                            <div className="flex min-w-0 gap-x-4">
                                <img
                                    alt={`${user.firstName} ${user.lastName}`}
                                    src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`}
                                    className="h-12 w-12 flex-none rounded-full bg-gray-50 dark:bg-gray-700"
                                />
                                <div className="min-w-0 flex-auto">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            {/* Actions utilisateur */}
                            <div className="flex items-center gap-x-4">
                                <Link
                                    to={`/edit/${user.id}`} // Redirige vers la page de modification
                                    className="text-blue-500 hover:text-blue-700 transition"
                                    title="Modifier l'utilisateur"
                                    onClick={() => handleEditClick(user.id)}> {/* Passe l'ID de l'utilisateur à modifier */}
                                    Modifier
                                </Link>
                                <button
                                   onClick={() => {
                                    console.log("ID de l'utilisateur à supprimer :", user.id); // Vérifie l'ID
                                    mutation.mutate(user.id);
                                }}
                                className="text-white hover:text-gray-300 transition"
                                title="Supprimer l'utilisateur"
                                >
                                    <FaTrash className="h-5 w-5" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div >
    );
};

export default UserList;