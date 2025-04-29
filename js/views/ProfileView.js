import { loadUsers, updateUser } from '../models/users.js';

document.addEventListener('DOMContentLoaded', function() {
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
    if (!loggedUser) {
        window.location.href = 'login.html';
        return;
    }

    // Load user data
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const profileImage = document.getElementById('profileImage');
    const userNameDisplay = document.getElementById('userNameDisplay');

    nameInput.value = loggedUser.name;
    emailInput.value = loggedUser.email;

    if (userNameDisplay && loggedUser.name) {
        userNameDisplay.textContent = `Olá, ${loggedUser.name}!`;
    }
    
    if (loggedUser.profImg) {
        profileImage.src = loggedUser.profImg;
    }

    
    // Handle profile image upload
    document.getElementById('avatarInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImage.src = e.target.result;
                loggedUser.profImg = e.target.result;
                sessionStorage.setItem('loggedUser', JSON.stringify(loggedUser));
            }
            reader.readAsDataURL(file);
        }
    });

    // Handle form submission
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        
        try {
            loadUsers();

            if (newPassword) {
                // Verify current password matches
                if (!currentPassword) {
                    throw new Error('Por favor, insira a password atual');
                }
                
                if (currentPassword !== loggedUser.password) {
                    throw new Error('Password atual incorreta');
                }
            }

            updateUser(
                nameInput.value,
                emailInput.value,
                newPassword || loggedUser.password,
                profileImage.src,
                loggedUser.favourits
            );
            
            // Update session storage and display name
            loggedUser.name = nameInput.value;
            loggedUser.email = emailInput.value;
            userNameDisplay.textContent = `Olá, ${nameInput.value}!`;
            
            if (newPassword) {
                loggedUser.password = newPassword;
            }
            sessionStorage.setItem('loggedUser', JSON.stringify(loggedUser));
            
            showMessage('Perfil atualizado com sucesso!', 'success');
        } catch (error) {
            showMessage(error.message, 'danger');
        }
    });

    
    document.querySelector('.cancel-btn').addEventListener('click', function() {
        window.location.href = '../index.html';
    });
});

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `alert alert-${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}
