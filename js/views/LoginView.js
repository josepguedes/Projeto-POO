import { loadUsers, loggedUser } from '../models/users.js';


document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('Email1').value;
    const password = document.getElementById('Password1').value;
    try {
        loadUsers();
        loggedUser(email, password);
        showMessage("Logged in successfully!")
        window.location.href = '../index.html'; // Redrect to the main page after login
    } catch (error) {
        showMessage("User not found!")
    }
});

function showMessage(message) {
    document.getElementById('message').innerText = message;
}