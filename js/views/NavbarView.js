import { isLogged, loggoutUser } from '../models/users.js';

document.addEventListener('DOMContentLoaded', function () {
    // Seleciona todas as sections com um ID
    const sections = Array.from(document.querySelectorAll('section[id]')).map(section => ({
        title: section.getAttribute('data-title') || section.id.replace(/-/g, ' '),
        id: section.id
    }));

    // Obtém o menu dropdown onde as secções serão adicionadas
    const sectionsMenu = document.querySelector('#pageSectionsDropdown + .dropdown-menu');

    // Garante que o menu esteja vazio antes de adicionar os itens
    sectionsMenu.innerHTML = '';

    // Adiciona cada secção ao dropdown
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
                window.location.reload(); // Reload page after logout
            });
        }

        if (loggedUser.profImg) {
            navProfileImage.src = loggedUser.profImg;
        }
        if (loggedUser.name) {
            navUserName.textContent = loggedUser.name;
        }

        document.getElementById('loggedInMenu').style.display = 'block';
        document.getElementById('loggedOutMenu').style.display = 'none';
    } else {
        document.getElementById('loggedInMenu').style.display = 'none';
        document.getElementById('loggedOutMenu').style.display = 'block';
    }
});


