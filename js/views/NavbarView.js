import { isLogged } from '../models/users.js';

document.addEventListener('DOMContentLoaded', function() {
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


    const isLoggedIn = false;
    document.getElementById(isLoggedIn ? 'loggedInMenu' : 'loggedOutMenu').style.display = 'block';
});
