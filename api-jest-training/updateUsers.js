const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Connectez-vous à MongoDB
const mongoURI = "mongodb+srv://jokast38:Jok%4062106835@jokastclusteripssi.0ur0y.mongodb.net/pmu-prepa?retryWrites=true&w=majority";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const updateUsers = async () => {
  try {
    const defaultPassword = "password123"; // Mot de passe par défaut
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Mettez à jour tous les utilisateurs
    await User.updateMany({}, { $set: { password: hashedPassword } });

    console.log("Tous les utilisateurs ont été mis à jour avec un mot de passe haché.");
    mongoose.connection.close();
  } catch (error) {
    console.error("Erreur lors de la mise à jour des utilisateurs :", error);
    mongoose.connection.close();
  }
};

updateUsers();