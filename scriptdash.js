document.addEventListener('DOMContentLoaded', function() {
    const API_URL = "http://88.160.181.4:56162";
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }    

    if (!token) {
        window.location.href = 'login.html';
    }

// Récupération des tickets et génération du tableau
fetch(`${API_URL}/tickets`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
.then(response => response.json())
.then(tickets => {
    console.log('Tickets reçus depuis l\'API:', tickets);

    document.getElementById('total-tickets').textContent = tickets.length;
    document.getElementById('resolved-tickets').textContent = tickets.filter(t => t.status === 'Terminé').length;

    const ticketsList = document.getElementById('tickets-list');
    ticketsList.innerHTML = '';

    const statusColors = {
        'En attente': '#ff9800',
        'En cours': '#2196f3',
        'Terminé': '#4caf50'
    };

    tickets.forEach(ticket => {
    const row = document.createElement('tr');
    const color = statusColors[ticket.status] || 'grey';

    const userName = escapeHTML(ticket.user_name ? ticket.user_name : 'Utilisateur inconnu');
    const description = escapeHTML(ticket.description ? ticket.description : 'Pas de description');

    const role = localStorage.getItem('role');
    const deleteButton = (role === 'admin') ? 
        `<button class='action-btn delete-btn' data-id="${ticket.id}" style="background: #ff4d4d;">Supprimer</button>` : 
        '';

    const technicianName = escapeHTML(ticket.technician_name ? ticket.technician_name : 'Non assigné');

    row.innerHTML = `
        <td>${ticket.id}</td>
        <td>${userName}</td>
        <td>${description}</td>
        <td style="color: ${color}; font-weight: bold;">${ticket.status}</td>
        <td>${technicianName}</td>
        <td>
            <button class='action-btn voir-btn' data-id="${ticket.id}">Voir</button>
            ${deleteButton}
        </td>
    `;            
    ticketsList.appendChild(row);
});

    // Ajout des événements pour les boutons "Voir"
    document.querySelectorAll('.voir-btn').forEach(button => {
        button.addEventListener('click', function() {
            const ticketId = this.getAttribute('data-id');
            afficherDetailsTicket(ticketId);
        });
    });

    // Ajout des événements pour les boutons "Supprimer"
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const ticketId = this.getAttribute('data-id');
            supprimerTicket(ticketId);
        });
    });
})
.catch(err => console.error('Erreur lors du chargement des tickets:', err));


    // Fonction pour afficher les détails d'un ticket
    function afficherDetailsTicket(ticketId) {
        fetch(`${API_URL}/tickets/${ticketId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(ticket => {
            document.getElementById('modal-ticket-id').textContent = ticket.id;
            document.getElementById('modal-ticket-user').textContent = ticket.user_name;
            document.getElementById('modal-ticket-description').textContent = ticket.description || 'Pas de description';
            document.getElementById('modal-ticket-status').value = ticket.status;

            document.getElementById('ticketModal').classList.add('show');

            console.log("Rôle utilisateur:", userRole);

            if (userRole === 'admin') {
                document.getElementById('modal-ticket-status').disabled = false;
                document.getElementById('update-status-btn').style.display = 'block';
            } else if (userRole === 'user') {
                document.getElementById('modal-ticket-status').disabled = true;
                document.getElementById('update-status-btn').style.display = 'none';
            } else {
                console.error("Rôle inconnu :", userRole);
            }

            // Attacher l'événement sur le bouton après avoir affiché la modale
            document.getElementById('update-status-btn').onclick = function() {
                const nouveauStatut = document.getElementById('modal-ticket-status').value;
                mettreAJourStatut(ticketId, nouveauStatut);
            };
        })
        .catch(err => console.error('Erreur lors de l\'affichage du ticket:', err));
    }

    // Fonction globale pour mettre à jour le statut du ticket
    window.mettreAJourStatut = function(ticketId, nouveauStatut, technicianId = null) {
        const url = `${API_URL}/tickets/${ticketId}`;
    
        fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: nouveauStatut,
                technician_id: technicianId
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            alert('Ticket mis à jour avec succès !');
            document.getElementById('ticketModal').classList.remove('show');
            location.reload();
        })
        .catch(err => console.error('Erreur lors de la mise à jour du ticket :', err));
    };    

    // Fermeture de la modale
    document.getElementById('closeModal').addEventListener('click', function() {
        document.getElementById('ticketModal').classList.remove('show');
    });

    // Affichage du bouton "Créer un ticket" pour les utilisateurs lambda
    const role = localStorage.getItem('role');
    const createTicketBtn = document.getElementById('creer-ticket-btn');

    // ✅ Affichage conditionnel selon le rôle
    if (role === 'user') {
        createTicketBtn.style.display = 'block';
    } else {
        createTicketBtn.style.display = 'none';
    }

    // Ouverture de la modale de création
    createTicketBtn.addEventListener('click', function() {
    document.getElementById('createTicketModal').classList.add('show');
    });

    // Fermeture de la modale de création
    document.getElementById('closeCreateModal').addEventListener('click', function() {
    document.getElementById('createTicketModal').classList.remove('show');
    });
    // Création d'un nouveau ticket
document.getElementById('create-ticket-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.getElementById('ticket-title').value;
    const description = document.getElementById('ticket-description').value;

    fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title,
            description: description
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('Ticket créé avec succès !');
        document.getElementById('createTicketModal').classList.remove('show');
        location.reload(); // Recharge la page pour afficher le nouveau ticket
    })
    .catch(err => console.error('Erreur lors de la création du ticket:', err));
});

// Fonction pour supprimer un ticket
window.supprimerTicket = function(ticketId) {
    // Demander une confirmation avant de supprimer
    const confirmation = confirm("Êtes-vous sûr de vouloir supprimer ce ticket ?");
    if (!confirmation) return;

    fetch(`${API_URL}/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        alert('Ticket supprimé avec succès !');
        location.reload(); // Recharge la page pour afficher la mise à jour
    })
    .catch(err => console.error('Erreur lors de la suppression du ticket:', err));
};

// Fonction pour charger les messages d'un ticket
function chargerMessages(ticketId) {
    const url = `${API_URL}/tickets/${ticketId}/messages`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.innerHTML = '';

        const userId = parseInt(localStorage.getItem('userId'));

        data.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            
            if (message.sender_id == userId) {
                messageDiv.classList.add('user');
            } else {
                messageDiv.classList.add('admin');
            }

            // NE PAS utiliser innerHTML avec contenu utilisateur non échappé
            const sender = document.createElement("strong");
            sender.textContent = message.sender_name;

            const msg = document.createElement("p");
            msg.textContent = message.message; // safe car textContent

            const time = document.createElement("span");
            time.className = "timestamp";
            time.textContent = new Date(message.timestamp).toLocaleTimeString();

            messageDiv.appendChild(sender);
            messageDiv.appendChild(msg);
            messageDiv.appendChild(time);

            messagesContainer.appendChild(messageDiv);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    })
    .catch(err => console.error('Erreur lors du chargement des messages:', err));
}

// Appel initial de chargement des messages
function initialiserChargementMessages(ticketId) {
    chargerMessages(ticketId);
    setInterval(() => {
        chargerMessages(ticketId);
    }, 5000); // Rafraîchit toutes les 5 secondes
}

// Chargement des messages quand on ouvre la modale de détail du ticket
function afficherDetailsTicket(ticketId) {
    fetch(`${API_URL}/tickets/${ticketId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(ticket => {
        document.getElementById('modal-ticket-id').textContent = ticket.id;
        document.getElementById('modal-ticket-user').textContent = ticket.user_name;
        document.getElementById('modal-ticket-description').textContent = ticket.description;
        document.getElementById('modal-ticket-status').value = ticket.status;

        document.getElementById('ticketModal').classList.add('show');

        if (userRole === 'admin') {
            document.getElementById('modal-ticket-status').disabled = false;
            document.getElementById('update-status-btn').style.display = 'block';
            document.getElementById('modal-ticket-technician').disabled = false;

            // Charger les techniciens
            fetch(`${API_URL}/users`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(users => {
                const select = document.getElementById('modal-ticket-technician');
                select.innerHTML = '<option value="">Non assigné</option>';
                users
                    .filter(u => u.role === 'admin')
                    .forEach(user => {
                        const option = document.createElement('option');
                        option.value = user.id;
                        option.textContent = user.username;
                        if (parseInt(ticket.technician_id) === parseInt(user.id)) {
                            option.selected = true;
                        }
                        select.appendChild(option);
                    });
            });
        } else {
            document.getElementById('modal-ticket-status').disabled = true;
            document.getElementById('update-status-btn').style.display = 'none';
            document.getElementById('modal-ticket-technician').disabled = true;
        }

        initialiserChargementMessages(ticketId);

        document.getElementById('update-status-btn').onclick = function () {
            const nouveauStatut = document.getElementById('modal-ticket-status').value;
            const technicianId = document.getElementById('modal-ticket-technician').value || null;
            mettreAJourStatut(ticketId, nouveauStatut, technicianId);
        };
    })
    .catch(err => console.error('Erreur lors de l\'affichage du ticket:', err));
}

// Fonction pour envoyer un message
window.envoyerMessage = function(ticketId) {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();

    if (message === '') return;

    fetch(`${API_URL}/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        messageInput.value = '';
        chargerMessages(ticketId);
    })
    .catch(err => console.error('Erreur lors de l\'envoi du message:', err));
};

// Ajout de l'événement d'envoi de message
document.getElementById('send-message-btn').addEventListener('click', function() {
    const ticketId = document.getElementById('modal-ticket-id').textContent;
    envoyerMessage(ticketId);
});

// Envoi du message avec la touche Entrée
document.getElementById('message-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Empêche le retour à la ligne
        const ticketId = document.getElementById('modal-ticket-id').textContent;
        envoyerMessage(ticketId);
    }
});
});
