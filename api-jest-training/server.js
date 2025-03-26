const express = require("express");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Enable CORS for all routes
app.use(cors({
    origin: '*',
}));

// Connect to MongoDB Atlas
const mongoURI = "mongodb+srv://jokast38:Jok%4062106835@jokastclusteripssi.0ur0y.mongodb.net/pmu-prepa?retryWrites=true&w=majority";
mongoose.connect(mongoURI);

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Nouveau champ pour le mot de passe
});

const User = mongoose.model("User", userSchema);

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Liste des utilisateurs ayant aimé le post
    comments: [
        {
            author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Auteur du commentaire
            content: { type: String, required: true }, // Contenu du commentaire
            createdAt: { type: Date, default: Date.now }, // Date du commentaire
        },
    ],
});

const Post = mongoose.model("Post", postSchema);


// Middleware pour vérifier le jeton JWT
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Access denied" });
    }

    try {
        const decoded = jwt.verify(token, "your_jwt_secret");
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};


//register
app.post(
    "/auth/register",
    [
        body("firstName").isString().withMessage("First name must be a string"),
        body("lastName").isString().withMessage("Last name must be a string"),
        body("email").isEmail().withMessage("Email must be valid"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, email, password } = req.body;

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword,
            });

            await newUser.save();
            res.status(201).json({ message: "User registered successfully" });
        } catch (error) {
            console.error("Error registering user:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

//login
app.post(
    "/auth/login",
    [
        body("email").isEmail().withMessage("Email must be valid"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            const token = jwt.sign({ userId: user._id }, "your_jwt_secret", { expiresIn: "1h" });
            res.json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName } });
        } catch (error) {
            console.error("Error logging in:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

// Endpoint pour récupérer les informations de l'utilisateur connecté
app.get("/auth/me", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        res.json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération des informations utilisateur :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});


// Créer un post
app.post("/posts", authenticate, async (req, res) => {
    const { title, content } = req.body;

    try {
        const newPost = new Post({
            title,
            content,
            author: req.user.userId, // Récupère l'ID de l'utilisateur connecté
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//Récupérer tous les posts
app.get("/posts", async (req, res) => {
    try {
        const posts = await Post.find().populate("author", "firstName lastName email");
        res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Liker ou retirer un like d'un post
app.post("/posts/:id/like", authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Vérifie si l'utilisateur a déjà liké le post
        const userId = req.user.userId;
        const hasLiked = post.likes.includes(userId);

        if (hasLiked) {
            // Retirer le like
            post.likes = post.likes.filter((like) => like.toString() !== userId);
        } else {
            // Ajouter le like
            post.likes.push(userId);
        }

        await post.save();
        res.json({ likes: post.likes.length });
    } catch (error) {
        console.error("Error liking post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Ajouter un commentaire à un post
app.post("/posts/:id/comment", authenticate, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: "Content is required" });
    }

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = {
            author: req.user.userId,
            content,
            createdAt: new Date(),
        };

        post.comments.push(comment);
        await post.save();

        res.status(201).json(post.comments);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Récupérer les commentaires d'un post
app.get("/posts/:id/comments", async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findById(id).populate("comments.author", "firstName lastName email");
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Vérifiez que chaque commentaire a un auteur valide
        const comments = post.comments.map((comment) => ({
            _id: comment._id,
            content: comment.content,
            createdAt: comment.createdAt,
            author: comment.author || null, // Si l'auteur est null, renvoyez null
        }));

        res.json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Supprimer un commentaire
app.delete("/posts/:postId/comments/:commentId", authenticate, async (req, res) => {
    const { postId, commentId } = req.params;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Vérifie si l'utilisateur est l'auteur du commentaire ou du post
        if (
            comment.author.toString() !== req.user.userId &&
            post.author.toString() !== req.user.userId
        ) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        comment.remove();
        await post.save();

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint pour écraser le mot de passe et le remplacer par "password123"
app.put("/auth/reset-password/:id", authenticate, async (req, res) => {
    const { id } = req.params;

    // Vérifiez si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        // Hacher le mot de passe par défaut "password123"
        const hashedPassword = await bcrypt.hash("password123", 10);

        // Mettre à jour le mot de passe de l'utilisateur
        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Mot de passe réinitialisé à 'password123'" });
    } catch (error) {
        console.error("Erreur lors de la réinitialisation du mot de passe :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

// Modifier le mot de passe d'un utilisateur
app.put("/auth/change-password", authenticate, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        // Récupérer l'utilisateur connecté
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        // Vérifier si l'ancien mot de passe est correct
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Ancien mot de passe incorrect" });
        }

        // Hacher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe de l'utilisateur
        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Mot de passe modifié avec succès" });
    } catch (error) {
        console.error("Erreur lors de la modification du mot de passe :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

// Récupérer tous les utilisateurs
app.get("/users", authenticate, async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Exclut le champ `password` des résultats
        const formattedUsers = users.map((user) => ({
            id: user._id.toString(), // Remappe `_id` en `id`
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        }));
        res.json(formattedUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Récupérer un utilisateur
app.get("/users/:id", authenticate, async (req, res) => {
    const { id } = req.params;

    // Vérifiez si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Remappe `_id` en `id` pour le frontend
        const userWithId = { ...user.toObject(), id: user._id.toString() };
        delete userWithId._id;

        res.json(userWithId);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Ajouter un utilisateur
app.post(
    "/users",
    // Validation des entrées
    body("firstName").isString().withMessage("First name must be a string"),
    body("lastName").isString().withMessage("Last name must be a string"),
    body("email").isEmail().withMessage("Email must be valid"),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
        });
        await newUser.save();
        res.status(201).json(newUser);
    }
);
// Modifier
app.put("/users/:id", authenticate, async (req, res) => {
    const { id } = req.params;

    // Vérifiez si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
            },
            { new: true } // Retourne l'utilisateur mis à jour
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Remappe `_id` en `id` pour le frontend
        const userWithId = { ...updatedUser.toObject(), id: updatedUser._id.toString() };
        delete userWithId._id;

        res.json(userWithId);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Supprimer un utilisateur
app.delete("/users/:id", authenticate, async (req, res) => {
    const { id } = req.params;

    // Vérifiez si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }

    try {
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé " });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;