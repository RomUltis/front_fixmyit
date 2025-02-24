document.addEventListener('DOMContentLoaded', function() {
    const API_URL = "http://88.160.181.4:56162";
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
        window.location.href = 'login.html';
    }

    // Récupération des tickets depuis l'API
    fetch(`${API_URL}/tickets`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(tickets => {
        console.log('Tickets reçus depuis l\'API:', tickets);  // 🔥 Debug: Vérifie les données reçues
        document.getElementById('total-tickets').textContent = tickets.length;
        document.getElementById('resolved-tickets').textContent = tickets.filter(t => t.status === 'Terminé').length;

        const ticketsList = document.getElementById('tickets-list');
        ticketsList.innerHTML = '';

        // Affichage des tickets avec statut et couleur selon l'état
        const statusColors = {
            'En attente': 'orange',
            'En cours': 'blue',
            'Terminé': 'green'
        };

        tickets.forEach(ticket => {
            // Affiche tous les tickets, sans filtrage par rôle
            const row = document.createElement('tr');
            const color = statusColors[ticket.status] || 'grey';
            row.innerHTML = `
                <td style="color: #fff;">${ticket.id}</td>
                <td style="color: #fff;">${ticket.user_id}</td>
                <td style="color: #fff;">${ticket.description}</td>
                <td style="color: ${color}; font-weight: bold;">${ticket.status}</td>
                <td><button class='action-btn'>Voir</button></td>
            `;
            ticketsList.appendChild(row);
        });
    })
    .catch(err => console.error('Erreur lors du chargement des tickets:', err));

    // Création d'un ticket
    document.getElementById('create-ticket-btn').addEventListener('click', function() {
        const description = document.getElementById('ticket-description').value;

        fetch(`${API_URL}/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ description })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Ticket créé avec succès !");
                location.reload();
            } else {
                alert(data.message);
            }
        })
        .catch(err => console.error('Erreur lors de la création du ticket:', err));
    });
});
