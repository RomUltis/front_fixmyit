const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());

// ✅ Configuration CORS pour autoriser les requêtes du frontend (56160)
const corsOptions = {
    origin: ["http://192.168.0.43:56160", "https://api.truccraft.com", "http://88.160.181.4:56160", "http://88.160.181.4:56161", "http://88.160.181.4:56162"], // 🔹 Autorise ton frontend
    methods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
};

app.use(cors(corsOptions)); // ✅ Active CORS
app.options("*", cors(corsOptions)); // ✅ Gère les requêtes prévol OPTIONS

const BACKEND_URL = "http://88.160.181.4:56161";

// 📌 Proxy pour l'inscription
app.post('/register', async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/register`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur API Proxy" });
    }
});

// 📌 Proxy pour la connexion
app.post('/login', async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/login`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur API Proxy" });
    }
});

app.get("/", (req, res) => {
    res.send("✅ API Proxy fonctionne !");
});


// Lancer le serveur Proxy
app.listen(56162, () => {
    console.log("🚀 API Proxy en cours d'exécution sur le port 56162");
});
