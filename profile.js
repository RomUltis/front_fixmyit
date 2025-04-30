document.addEventListener("DOMContentLoaded", () => {
    // Vérification du rôle de l'utilisateur
    fetch('/users', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        // Si l'utilisateur est admin, on affiche la section administration
        if (data.role === 'admin') {
            document.getElementById("adminSection").style.display = "block";
            fetchAllUsers();
        }
    })
    .catch(error => console.error('Erreur:', error));

    // Gestion du changement de profil
    const form = document.getElementById("changeProfileForm");
    form.addEventListener("submit", function (e) {
        e.preventDefault();  // Empêche le rechargement de la page

        const pseudo = document.getElementById("pseudo").value;
        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;

        fetch('/profil', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ pseudo, currentPassword, newPassword })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Mise à jour réussie !");
                // Optionnel : Réinitialisation du formulaire
                form.reset();
            } else {
                alert(data.message || "Une erreur est survenue.");
            }
        })
        .catch(error => console.error('Erreur:', error));
    });
});

// Récupération de tous les utilisateurs (admin uniquement)
function fetchAllUsers() {
    fetch('/users', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(users => {
        const userList = document.getElementById("userList");
        userList.innerHTML = "";

        users.forEach(user => {
            userList.innerHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        <button class="action-btn" onclick="resetPassword(${user.id})">Réinitialiser</button>
                        <button class="action-btn" onclick="deleteUser(${user.id})">Supprimer</button>
                    </td>
                </tr>`;
        });
    })
    .catch(error => console.error('Erreur:', error));
}

// Réinitialisation du mot de passe (admin)
function resetPassword(userId) {
    const newPassword = prompt("Nouveau mot de passe :");
    if (!newPassword) return;

    fetch(`/users/${userId}/password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ newPassword })
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error('Erreur:', error));
}

// Suppression d'un utilisateur (admin)
function deleteUser(userId) {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    fetch(`/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchAllUsers();
    })
    .catch(error => console.error('Erreur:', error));
}

// Effacer le placeholder quand on commence à écrire
document.querySelectorAll(".input-group input").forEach(input => {
    input.addEventListener("focus", () => {
        input.setAttribute("data-placeholder", input.getAttribute("placeholder"));
        input.setAttribute("placeholder", "");
    });

    input.addEventListener("blur", () => {
        if (input.value === "") {
            input.setAttribute("placeholder", input.getAttribute("data-placeholder"));
        }
    });
});
