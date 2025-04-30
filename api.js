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

// Proxy pour l'inscription
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

// Proxy pour la connexion
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

// Proxy pour récupérer tous les tickets
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

// Proxy pour récupérer un ticket spécifique
app.get('/tickets/:id', async (req, res) => {
    try {
        const ticketId = req.params.id;
        const response = await axios.get(`${BACKEND_URL}/tickets/${ticketId}`, {
            headers: {
                'Authorization': req.headers.authorization
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Erreur Proxy (ticket GET) :", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Erreur API Proxy (ticket GET)" });
    }
});

// Proxy pour mettre à jour le statut d'un ticket
app.put('/tickets/:id', async (req, res) => {
    try {
        const ticketId = req.params.id;
        console.log("Proxy PUT - Ticket ID:", ticketId);

        const response = await axios.put(`${BACKEND_URL}/tickets/${ticketId}`, req.body, {
            headers: {
                'Authorization': req.headers.authorization,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Erreur Proxy (tickets PUT) :", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Erreur API Proxy (tickets PUT)" });
    }
});

// Proxy pour créer un nouveau ticket
app.post('/tickets', async (req, res) => {
    try {
        console.log("Proxy POST - Création d'un ticket");

        // Vérification de l'URL utilisée
        const url = `${BACKEND_URL}/tickets`;
        console.log("URL envoyée à adjudicator:", url);

        const response = await axios.post(url, req.body, {
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

// Proxy pour supprimer un ticket
app.delete('/tickets/:id', async (req, res) => {
    try {
        const ticketId = req.params.id;
        console.log("Proxy DELETE - Ticket ID:", ticketId);

        // Vérification de l'URL utilisée
        const url = `${BACKEND_URL}/tickets/${ticketId}`;

        const response = await axios.delete(url, {
            headers: {
                'Authorization': req.headers.authorization
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Erreur Proxy (tickets DELETE) :", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Erreur API Proxy (tickets DELETE)" });
    }
});

// Proxy pour récupérer les messages d'un ticket
app.get('/tickets/:id/messages', async (req, res) => {
    try {
        const ticketId = req.params.id;
        console.log("Proxy GET - Ticket ID:", ticketId);

        const url = `${BACKEND_URL}/tickets/${ticketId}/messages`;
        console.log("URL envoyée à adjudicator pour GET:", url);

        const response = await axios.get(url, {
            headers: {
                'Authorization': req.headers.authorization
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Erreur Proxy (messages GET) :", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Erreur API Proxy (messages GET)" });
    }
});

// Proxy pour envoyer un message
app.post('/tickets/:id/messages', async (req, res) => {
    try {
        const ticketId = req.params.id;

        const url = `${BACKEND_URL}/tickets/${ticketId}/messages`;

        const response = await axios.post(url, req.body, {
            headers: {
                'Authorization': req.headers.authorization,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Erreur Proxy (messages POST) :", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Erreur API Proxy (messages POST)" });
    }
});

// Proxy pour récupérer tous les utilisateurs
app.get('/users', async (req, res) => {
    try {
        const url = `${BACKEND_URL}/users`;
        const response = await axios.get(url, {
            headers: {
                Authorization: req.headers.authorization
            }
        });

        // ✅ Important : on renvoie directement les données brutes
        res.json(response.data);
    } catch (error) {
        console.error("Erreur proxy GET /users :", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Erreur API Proxy (GET /users)" });
    }
});

// Page de test pour vérifier si le proxy fonctionne
app.get('/', (req, res) => {
    res.send('Le proxy API fonctionne correctement.');
});

// Lancer le serveur Proxy
app.listen(56162, () => {
    console.log("🚀 Proxy API en cours d'exécution sur le port 56162");
});
