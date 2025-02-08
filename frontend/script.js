const API_URL = 'http://localhost:5000/api';
let currentCustomerId = null;

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const addGameForm = document.getElementById('add-game-form');
const addCustomerForm = document.getElementById('add-customer-form');
const logoutBtn = document.getElementById('logout-btn');
const gamesList = document.getElementById('games-list');
const loansList = document.getElementById('loans-list');

// Authentication
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post(`${API_URL}/login`, { username, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            showDashboard();
            loadGames();
            loadLoans();
        }
    } catch (error) {
        alert('Invalid credentials. Please try again.');
    }
});

// Dashboard Display
function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
}

// Games Management
async function loadGames() {
    try {
        const response = await axios.get(`${API_URL}/games`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        displayGames(response.data);
    } catch (error) {
        console.error('Error loading games:', error);
    }
}

function displayGames(games) {
    gamesList.innerHTML = '';
    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.innerHTML = `
            <h3>${game.title}</h3>
            <p>Genre: ${game.genre}</p>
            <p>Price: $${game.price}</p>
            <p>Available: ${game.quantity}</p>
            <div class="card-actions">
                <button onclick="editGame(${game.id})">Edit</button>
                <button onclick="deleteGame(${game.id})">Delete</button>
                <button onclick="loanGame(${game.id})">Loan</button>
            </div>
        `;
        gamesList.appendChild(gameCard);
    });
}

addGameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const gameData = {
        title: document.getElementById('game-title').value,
        genre: document.getElementById('game-genre').value,
        price: parseFloat(document.getElementById('game-price').value),
        quantity: parseInt(document.getElementById('game-quantity').value)
    };

    try {
        await axios.post(`${API_URL}/games`, gameData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        addGameForm.reset();
        loadGames();
    } catch (error) {
        console.error('Error adding game:', error);
        alert('Failed to add game. Please try again.');
    }
});

// Customer Management
addCustomerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const customerData = {
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value
    };

    try {
        const response = await axios.post(`${API_URL}/customers`, customerData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        currentCustomerId = response.data.id;
        addCustomerForm.reset();
        alert('Customer registered successfully!');
    } catch (error) {
        console.error('Error registering customer:', error);
        alert('Failed to register customer. Please try again.');
    }
});

// Loans Management
async function loadLoans() {
    try {
        const response = await axios.get(`${API_URL}/loans`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        displayLoans(response.data);
    } catch (error) {
        console.error('Error loading loans:', error);
    }
}

function displayLoans(loans) {
    loansList.innerHTML = '';
    loans.forEach(loan => {
        const loanCard = document.createElement('div');
        loanCard.className = 'loan-card';
        loanCard.innerHTML = `
            <h3>Loan #${loan.id}</h3>
            <p>Game: ${loan.game.title}</p>
            <p>Customer: ${loan.customer.name}</p>
            <p>Due Date: ${new Date(loan.dueDate).toLocaleDateString()}</p>
            <div class="card-actions">
                <button onclick="returnGame(${loan.id})">Return Game</button>
            </div>
        `;
        loansList.appendChild(loanCard);
    });
}

// Game Actions
async function editGame(gameId) {
    // Implementation for editing a game
    const newTitle = prompt('Enter new title:');
    if (newTitle) {
        try {
            await axios.put(`${API_URL}/games/${gameId}`, { title: newTitle }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            loadGames();
        } catch (error) {
            console.error('Error updating game:', error);
            alert('Failed to update game. Please try again.');
        }
    }
}

async function deleteGame(gameId) {
    if (confirm('Are you sure you want to delete this game?')) {
        try {
            await axios.delete(`${API_URL}/games/${gameId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            loadGames();
        } catch (error) {
            console.error('Error deleting game:', error);
            alert('Failed to delete game. Please try again.');
        }
    }
}

async function loanGame(gameId) {
    if (!currentCustomerId) {
        alert('Please register a customer first.');
        return;
    }

    try {
        await axios.post(`${API_URL}/loans`, {
            gameId,
            customerId: currentCustomerId,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        loadGames();
        loadLoans();
    } catch (error) {
        console.error('Error creating loan:', error);
        alert('Failed to create loan. Please try again.');
    }
}

async function returnGame(loanId) {
    try {
        await axios.put(`${API_URL}/loans/${loanId}/return`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        loadGames();
        loadLoans();
    } catch (error) {
        console.error('Error returning game:', error);
        alert('Failed to return game. Please try again.');
    }
}

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    currentCustomerId = null;
    loginSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    loginForm.reset();
});

// Initial check for authentication
if (localStorage.getItem('token')) {
    showDashboard();
    loadGames();
    loadLoans();
}