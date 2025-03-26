import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon, HeartIcon, ChatBubbleLeftEllipsisIcon, PlusIcon } from "@heroicons/react/24/outline";
// Fonction pour récupérer les posts
const fetchPosts = async () => {
    const { data } = await axios.get("http://localhost:3003/posts");
    return data;
};

// Fonction pour créer un post
const createPost = async (postData: { title: string; content: string }) => {
    const token = localStorage.getItem("token"); // Récupère le token JWT
    if (!token) {
        throw new Error("Utilisateur non authentifié");
    }
    const { data } = await axios.post("http://localhost:3003/posts", postData, {
        headers: {
            Authorization: `Bearer ${token}`, // Ajoute le token dans les headers
        },
    });
    return data;
};

// Fonction pour récupérer les informations de l'utilisateur connecté
const fetchUserInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Utilisateur non authentifié");
    }
    const { data } = await axios.get("http://localhost:3003/auth/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return data;
};

// Fonction pour récupérer les commentaires d'un post
const fetchComments = async (postId: string) => {
    const { data } = await axios.get(`http://localhost:3003/posts/${postId}/comments`);
    return data;
};


const Dashboard = () => {
    const queryClient = useQueryClient();
    const [newPost, setNewPost] = useState({ title: "", content: "" });
    const [comment, setComment] = useState(""); // État pour le contenu du commentaire
    const [activePostId, setActivePostId] = useState<string | null>(null); // État pour le post actif
    const [showPostForm, setShowPostForm] = useState(false); // État pour afficher/masquer le formulaire
    const navigate = useNavigate();
    // Récupération des posts
    const { data: posts, isLoading, error } = useQuery({
        queryKey: ["posts"],
        queryFn: fetchPosts,
    });

    // Récupération des informations de l'utilisateur connecté
    const { data: userInfo } = useQuery({
        queryKey: ["userInfo"],
        queryFn: fetchUserInfo,
    });

    // Mutation pour créer un post
    const mutation = useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            toast.success("Post créé avec succès !");
            queryClient.invalidateQueries({ queryKey: ["posts"] }); // Recharge les posts après la création
            setNewPost({ title: "", content: "" }); // Réinitialise le formulaire
        },
        onError: (err: any) => {
            if (err.response?.status === 401) {
                toast.error("Vous devez être connecté pour créer un post.");
            } else {
                toast.error("Erreur lors de la création du post.");
            }
        },
    });

    const handleEditClick = (id: string) => {
        console.log("ID de l'utilisateur cliqué :", id);
        navigate(`/edit/${id}`); // Redirige manuellement vers la page de modification
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewPost({ ...newPost, [name]: value });
    };

    // Fonction pour liker un post
    const likePost = async (postId: string) => {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Utilisateur non authentifié");
        }
        const { data } = await axios.post(`http://localhost:3003/posts/${postId}/like`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data;
    };


    // Mutation pour liker un post
    const likeMutation = useMutation({
        mutationFn: likePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] }); // Recharge les posts après un like
        },
        onError: () => {
            toast.error("Erreur lors du like.");
        },
    });

    const handleLike = (postId: string) => {
        likeMutation.mutate(postId);
    };

    // Fonction pour ajouter un commentaire
    const addComment = async ({ postId, content }: { postId: string; content: string }) => {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Utilisateur non authentifié");
        }
        const { data } = await axios.post(
            `http://localhost:3003/posts/${postId}/comment`,
            { content },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return data;
    };



    // Mutation pour ajouter un commentaire
    const commentMutation = useMutation({
        mutationFn: addComment,
        onSuccess: () => {
            toast.success("Commentaire ajouté avec succès !");
            queryClient.invalidateQueries({ queryKey: ["posts"] }); // Recharge les posts après un commentaire
            queryClient.invalidateQueries({ queryKey: ["comments", activePostId] }); // Recharge les commentaires du post actif
            setComment(""); // Réinitialise le champ de commentaire
        },
        onError: () => {
            toast.error("Erreur lors de l'ajout du commentaire.");
        },
    });

    const handleComment = (postId: string) => {
        if (!comment.trim()) {
            toast.error("Le commentaire ne peut pas être vide.");
            return;
        }
        commentMutation.mutate({ postId, content: comment });
    };

    const handleToggleComments = (postId: string) => {
        setActivePostId(activePostId === postId ? null : postId); // Affiche ou masque les commentaires
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.title || !newPost.content) {
            toast.error("Veuillez remplir tous les champs.");
            return;
        }
        mutation.mutate(newPost);
    };

    const handleSignOut = () => {
        localStorage.removeItem("token"); // Supprime le token JWT
        navigate("/"); // Redirige vers la route /hero
    };


    if (isLoading) return <p>Chargement des posts...</p>;
    if (error) return <p>Erreur lors du chargement des posts.</p>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Navbar */}
            <Disclosure as="nav" className="bg-gray-800">
                {({ open }) => (
                    <>
                        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                            <div className="relative flex h-16 items-center justify-between">
                                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                    {/* Mobile menu button */}
                                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                        <span className="sr-only">Open main menu</span>
                                        {open ? (
                                            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                        ) : (
                                            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                        )}
                                    </Disclosure.Button>
                                </div>
                                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                    <div className="flex flex-shrink-0 items-center">
                                        <img
                                            className="h-8 w-auto"
                                            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                                            alt="Your Company"
                                        />
                                    </div>
                                    <div className="hidden sm:ml-6 sm:block">
                                        <div className="flex space-x-4">
                                            <a
                                                href="#"
                                                className="bg-gray-900 text-white rounded-md px-3 py-2 text-sm font-medium"
                                                aria-current="page"
                                            >
                                                Dashboard
                                            </a>

                                        </div>
                                    </div>
                                    <div className="hidden sm:ml-6 sm:block">
                                        <div className="flex space-x-4">
                                            {userInfo?.firstName === "Admin" &&
                                                userInfo?.lastName === "Admin" &&
                                                userInfo?.email === "admin@test.com" && (
                                                    <a
                                                        href="/admin"
                                                        className="bg-gray-900 text-white rounded-md px-3 py-2 text-sm font-medium"
                                                        aria-current="page"
                                                    >
                                                        Admin
                                                    </a>
                                                )}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                    <span>{`${userInfo?.firstName}`}</span>

                                    {/* Profile dropdown */}
                                    <Menu as="div" className="relative ml-3">
                                        <div>
                                            <Menu.Button className="user-menu-button flex rounded-full bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                                <span className="sr-only">Profil</span>
                                                <img
                                                    className="h-8 w-8 rounded-full"
                                                    src={`https://ui-avatars.com/api/?name=${userInfo?.firstName}+${userInfo?.lastName}&background=random`}
                                                    alt={`${userInfo?.firstName} ${userInfo?.lastName}`}
                                                />
                                            </Menu.Button>
                                        </div>
                                        <Transition
                                            as={React.Fragment}
                                            enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">                                                <Menu.Item>
                                                {({ active }) => (
                                                    <a
                                                        href="#"
                                                        className={`block px-4 py-2 text-sm ${active ? "bg-gray-100" : ""
                                                            }`}
                                                    >
                                                        {userInfo?.firstName} {userInfo?.lastName}
                                                    </a>
                                                )}
                                            </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <a
                                                            onClick={() => handleEditClick(user.id)}
                                                            href="#"
                                                            className={`block px-4 py-2 text-sm ${active ? "bg-gray-100" : ""
                                                                }`}
                                                        >
                                                            Settings
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <a
                                                            onClick={() => setShowPostForm(true)}
                                                            className={`block px-4 py-2 text-sm ${active ? "bg-gray-100" : ""
                                                                }`}
                                                        >
                                                            Ajouter un post
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <a
                                                            onClick={handleSignOut}
                                                            className={`block px-4 py-2 text-sm ${active ? "bg-gray-100" : ""
                                                                }`}
                                                        >
                                                            Sign out
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Disclosure>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <ToastContainer />
                <div className="space-y-4">
                    {posts.map((post: any) => (
                        <div
                            key={post._id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col space-y-4"
                        >
                            <div className="flex items-center space-x-4">
                                <img
                                    className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-700"
                                    src={`https://ui-avatars.com/api/?name=${post.author.firstName}+${post.author.lastName}&background=random`}
                                    alt={`${post.author.firstName} ${post.author.lastName}`}
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {post.author.firstName} {post.author.lastName}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{post.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{post.content}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                {/* Bouton Like */}
                                <button
                                    id="like_button"
                                    onClick={() => handleLike(post._id)}
                                    className="like_button" // Applique la classe CSS pour le bouton like
                                >
                                    <HeartIcon className="h-5 w-5" />
                                    <span>{post.likes.length}</span>
                                </button>

                                {/* Bouton Commentaire */}
                                <button
                                    id="comments_button"
                                    onClick={() => handleToggleComments(post._id)}
                                    className="comments_button" // Applique la classe CSS pour le bouton commentaire
                                >
                                    <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
                                    <span>{post.comments.length}</span>
                                </button>
                            </div>
                            {activePostId === post._id && (
                                <div className="mt-4">
                                    {/* Liste des commentaires */}
                                    <CommentsList postId={post._id} />
                                    {/* Formulaire pour ajouter un commentaire */}
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full p-2 border rounded text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                                        placeholder="Écrivez un commentaire..."
                                    />
                                    <button
                                        onClick={() => handleComment(post._id)}
                                        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                                    >
                                        Publier
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bouton "+" pour afficher le formulaire */}
            <button
                onClick={() => setShowPostForm(true)}
                className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition"
            >
                <PlusIcon className="h-6 w-6" />
            </button>

            {/* Formulaire pour créer un post */}
            {showPostForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-96 relative">
                        {/* Bouton pour fermer le formulaire */}
                        <button
                            onClick={() => setShowPostForm(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>

                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Créer un post</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-2">Titre</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={newPost.title}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                                    placeholder="Entrez le titre du post"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 mb-2">Contenu</label>
                                <textarea
                                    name="content"
                                    value={newPost.content}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded text-gray-800 dark:text-gray-200 dark:bg-gray-700"
                                    placeholder="Entrez le contenu du post"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPostForm(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                                >
                                    Publier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Composant pour afficher les commentaires
const CommentsList = ({ postId }: { postId: string }) => {
    const { data: comments, isLoading, error } = useQuery({
        queryKey: ["comments", postId],
        queryFn: () => fetchComments(postId),
    });

    if (isLoading) return <p>Chargement des commentaires...</p>;
    if (error) return <p>Erreur lors du chargement des commentaires.</p>;

    // Vérifiez si `comments` est défini et s'il s'agit d'un tableau
    if (!comments || !Array.isArray(comments)) {
        return <p>Aucun commentaire disponible.</p>;
    }

    return (
        <div className="space-y-2">
            {comments.map((comment: any) => {
                const authorName = comment.author
                    ? `${comment.author.firstName || "Utilisateur"} ${comment.author.lastName || ""}`
                    : "Utilisateur inconnu";

                return (
                    <div key={comment._id} className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                            <span className="font-semibold">{authorName}:</span> {comment.content}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};


export default Dashboard;