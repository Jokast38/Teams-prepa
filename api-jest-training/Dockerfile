# Utiliser une image Node.js comme base
FROM node:18

# Définir le répertoire de travail dans le container
WORKDIR /app

# Copier le fichier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le projet dans le container
COPY . .

# Exposer le port de l'API
EXPOSE 3003

# Démarrer l'application
CMD ["node", "index.js"]
