let users = [];


//Load Users from LocalStorage
export function loadUsers() {
    if (localStorage.getItem('users')) {
        users = []; // Limpar array antes de carregar
        const getUsers = JSON.parse(localStorage.getItem('users'))
        for (let user of getUsers) {
            users.push(new User(user.name, user.email, user.password, user.profImg, user.favourits, user.isAdmin));
        }
    } else {
        users = [];

        const defaultAdmin = new User(
            "Admin",
            "admin@admin.com",
            "admin123",
            "../../img/default_Avatar.jpg",
            [],
            true
        );
        users.push(defaultAdmin);
        localStorage.setItem('users', JSON.stringify(users));
    }
}

//Add User 
export function addUser(name, email, password, profImg, favourits, isAdmin = false) {
    try {
        const existingUser = users.find(user => user.email === email || user.name === name);
        if (existingUser) {
            console.log("Duplicate found:", existingUser);
            throw new Error('This user already exists!');
        } else {
            users.push(new User(name, email, password, profImg, favourits, isAdmin));
            localStorage.setItem('users', JSON.stringify(users));
            console.log('User added successfully!');
        }
    } catch (error) {
        console.error("AddUser Error:", error.message);
        throw error;
    }
}

//Remove User
export function removeUser(id) {
    try {
        if (users.find(user => user.id === id)) {
            users = users.filter(user => user.id !== id)
            localStorage.setItem('users', JSON.stringify(users))
            console.log('User removed successfully!');
        } else {
            throw new Error('User not found!')
        }
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

//Update User
export function updateUser(name, email, password, profImg, favourits) {
    try {
        // Get logged user id from session
        const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
        const id = loggedUser.id;

        if (users.find(user => user.id === id)) {
            users = users.map(user => {
                if (user.id === id) {
                    user.name = name;
                    user.email = email;
                    user.password = password;
                    user.profImg = profImg;
                    user.favourits = favourits;
                    user.isAdmin = loggedUser.isAdmin;
                }
                return user;
            });
            localStorage.setItem('users', JSON.stringify(users));
            console.log('User updated successfully!');
        } else {
            throw new Error('User not found!');
        }
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

//Give user ID
export function getnextId() {
    if (users.length === 0) {
        return 1
    } else {
        return users[users.length - 1].id + 1
    }
}


//Logged User
export function loggedUser(email, password) {
    try {
        const user = users.find(user => user.email === email && user.password === password)
        if (user) {
            sessionStorage.setItem('loggedUser', JSON.stringify(user))
            console.log('User logged successfully!');
        } else {

            console.log(users);

            throw new Error('User not found!')
        }
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

//Loggout User
export function loggoutUser() {
    sessionStorage.removeItem('loggedUser')
    console.log('User logged out successfully!');
}


//Check if user is logged
export function isLogged() {
    return sessionStorage.getItem("loggedUser") ? true : false;
}

//Check if user is admin
export function isAdmin() {
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
    return loggedUser && loggedUser.isAdmin ? true : false;
}

class User {
    constructor(name, email, password, profImg = "../../img/default_Avatar.jpg", favourits = [], isAdmin = false) {
        this.id = getnextId();
        this.name = name;
        this.email = email;
        this.password = password;
        this.profImg = profImg;
        this.favourits = favourits;
        this.isAdmin = isAdmin;
    }
}