const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());

const corsOptions = {
    origin: [
        "http://192.168.0.43:56160", 
        "http://88.160.181.4:56160", 
        "http://88.160.181.4:56161", 
        "http://88.160.181.4:56162"
    ],
    methods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const BACKEND_URL = "http://88.160.181.4:56161";

// 📌 Proxy pour l'inscription
app.post('/register', async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/register`, req.body, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Erreur Proxy (register) :", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Erreur API Proxy (register)" });
    }
});

// 📌 Proxy pour la connexion
app.post('/login', async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/login`, req.body, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Erreur Proxy (login) :", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Erreur API Proxy (login)" });
    }
});

// 📌 Proxy pour récupérer les tickets
app.get('/tickets', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/tickets`, {
            headers: {
                'Authorization': req.headers.authorization
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Erreur Proxy (tickets GET) :", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Erreur API Proxy (tickets GET)" });
    }
});

// 📌 Proxy pour la création de tickets
app.post('/tickets', async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/tickets`, req.body, {
            headers: {
                'Authorization': req.headers.authorization,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Erreur Proxy (tickets POST) :", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Erreur API Proxy (tickets POST)" });
    }
});

// ✅ Page de test pour vérifier si le proxy fonctionne
app.get('/', (req, res) => {
    res.send('Le proxy API fonctionne correctement.');
});

// Lancer le serveur Proxy
app.listen(56162, () => {
    console.log("🚀 Proxy API en cours d'exécution sur le port 56162");
});
