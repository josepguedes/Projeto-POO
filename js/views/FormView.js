import { loadUsers, addUser, loggedUser } from '../models/users.js';

function switchToLoginForm() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function switchToRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}





document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('Email1').value;
    const password = document.getElementById('Password1').value;
    try {
        loadUsers();
        loggedUser(email, password);
        showMessage("Logged in successfully!")
    } catch (error) {
        showMessage("User not found!")
    }
});

document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('exampleInputUsername1').value;
    const email = document.getElementById('exampleInputEmail1').value;
    const password = document.getElementById('exampleInputPassword1').value;
    console.log(name, email, password);

    try {
        loadUsers();
        addUser(name, email, password);
        showMessage("User registered successfully")
        this.reset();
    } catch (error) {
        showMessage("This user already exists!")
        this.reset();
    }
});

function showMessage(message) {
    document.getElementById('message').innerText = message;
}



