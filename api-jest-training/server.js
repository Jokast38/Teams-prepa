const express = require("express");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

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
  email: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Récupérer tous les utilisateurs
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Récupérer un utilisateur
app.get("/users/:id", async (req, res) => {
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
app.put("/users/:id", async (req, res) => {
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
app.delete("/users/:id", async (req, res) => {
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