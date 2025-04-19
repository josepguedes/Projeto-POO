import { loadUsers, addUser} from '../models/users.js';

document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('exampleInputUsername1').value;
    const email = document.getElementById('exampleInputEmail1').value;
    const password = document.getElementById('exampleInputPassword1').value;

    try {
        loadUsers();
        addUser(name, email, password);
        showMessage("User registered successfully")
        this.reset();
        setTimeout(() => {
            window.location.href = 'login.html'; // Redirecionar para login após registro
        }, 1500);
    } catch (error) {
        showMessage("This user already exists!")
        this.reset();
    }
});
function showMessage(message) {
    document.getElementById('message').innerText = message;
}



