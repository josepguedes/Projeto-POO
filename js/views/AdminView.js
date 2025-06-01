import { loadUsers } from '../models/users.js';


function displayUsers() {
    loadUsers();
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <h2 class="mb-4">Gestão de Utilizadores</h2>
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Tipo</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.isAdmin ? '<span class="badge bg-danger">Admin</span>' : '<span class="badge bg-primary">Utilizador</span>'}</td>
                            <td>
                                <button class="btn btn-sm btn-warning" onclick="editUser(${user.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', function () {
    // Get logged admin user
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
    if (!loggedUser || !loggedUser.isAdmin) {
        window.location.href = '../index.html';
        return;
    }

    // Display admin name
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) {
        userNameDisplay.textContent = `Olá, ${loggedUser.name}!`;
    }

    // Create main content area if it doesn't exist
    const mainContent = document.createElement('div');
    mainContent.id = 'mainContent';
    mainContent.className = 'container mt-4';
    document.querySelector('.profile-main').appendChild(mainContent);

    // Handle sidebar navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.getAttribute('data-section') === 'profile') {
                displayUsers();
            }
            // Add active class to clicked item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Initial load of users
    displayUsers();
});