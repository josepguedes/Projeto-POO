document.addEventListener('DOMContentLoaded', function() {
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
    if (!loggedUser) {
        window.location.href = 'login.html';
        return;
    }

    // Display user name
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay && loggedUser.name) {
        userNameDisplay.textContent = `Olá, ${loggedUser.name}!`;
    }
    
    // Display profile image if exists
    const profileImage = document.getElementById('profileImage');
    if (profileImage && loggedUser.profImg) {
        profileImage.src = loggedUser.profImg;
    }
});