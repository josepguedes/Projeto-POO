import { isLogged, loggoutUser, isAdmin } from '../models/users.js';

document.addEventListener('DOMContentLoaded', function () {
    
    const sections = Array.from(document.querySelectorAll('section[id]')).map(section => ({
        title: section.getAttribute('data-title') || section.id.replace(/-/g, ' '),
        id: section.id
    }));

    
    const sectionsMenu = document.querySelector('#pageSectionsDropdown + .dropdown-menu');

    
    sectionsMenu.innerHTML = '';

    
    sections.forEach(section => {
        const li = document.createElement('li');
        li.innerHTML = `<a class="dropdown-item" href="#${section.id}">${section.title}</a>`;
        sectionsMenu.appendChild(li);
    });

    // Check if user is logged in
    const isLoggedIn = isLogged();

    if (isLoggedIn) {
        const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));

        // Update profile image and username in navbar
        const navProfileImage = document.getElementById('navProfileImage');
        const navUserName = document.getElementById('navUserName');

        // Add logout event listener to the logout button
        const logoutButton = document.querySelector('[data-logout]');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                loggoutUser();
                window.location.reload();
            });
        }

        if (loggedUser.profImg) {
            navProfileImage.src = loggedUser.profImg;
        }
        if (loggedUser.name) {
            navUserName.textContent = loggedUser.name;
        }

        // Get dropdown menu
        const dropdownMenu = document.querySelector('[aria-labelledby="userDropdown"]');

        // Clear existing menu items
        dropdownMenu.innerHTML = '';

        // Check if user is admin
        if (isAdmin()) {
            // Add admin-specific menu items
            dropdownMenu.innerHTML = `
                <li><a class="dropdown-item" href="/html/admin.html">Painel Admin</a></li>
                <li><a class="dropdown-item" href="/html/admin.html">Utilizadores</a></li>
                <li><a class="dropdown-item" href="/html/admin.html">Viagens</a></li>
                <li><a class="dropdown-item" href="/html/admin.html">Pedidos</a></li>
                <div class="dropdown-divider"></div>
                <li><a class="dropdown-item" href="#" data-logout style="color: #D90429">Terminar Sessão</a></li>
            `;
        } else {
            // Add regular user menu items
            dropdownMenu.innerHTML = `
                <li><a class="dropdown-item" href="/html/profile.html"">Perfil</a></li>
                <li><a class="dropdown-item" href="/html/favourites.html">Favoritos</a></li>
                <li><a class="dropdown-item" href="/html/reservations.html">Reservas</a></li>
                <div class="dropdown-divider"></div>
                <li><a class="dropdown-item" href="#" data-logout style="color: #D90429">Terminar Sessão</a></li>
            `;
        }

        // Reattach logout event listener since we recreated the menu
        dropdownMenu.querySelector('[data-logout]').addEventListener('click', (e) => {
            e.preventDefault();
            loggoutUser();
            window.location.reload();
        });

        document.getElementById('loggedInMenu').style.display = 'block';
        document.getElementById('loggedOutMenu').style.display = 'none';
    } else {
        document.getElementById('loggedInMenu').style.display = 'none';
        document.getElementById('loggedOutMenu').style.display = 'block';
    }
});


