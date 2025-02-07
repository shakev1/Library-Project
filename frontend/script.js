const API_URL = 'http://localhost:5000/api';
let currentCustomerId = null;

// DOM Elements
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
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
        if (response.status === 200) {
            loginContainer.classList.add('hidden');
            dashboardContainer.classList.remove('hidden');
            loadDashboard();
        }
    } catch (error) {
        alert('Invalid credentials');
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        await axios.post(`${API_URL}/logout`);
        dashboardContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
        loginForm.reset();
    } catch (error) {
        console.error('Logout failed:', error);
    }
});

// Dashboard Loading
async function loadDashboard() {
    await Promise.all([
        loadGames(),
        loadLoans()
    ]);
}

// Games Management
async function loadGames() {
    try {
        const response = await axios.get(`${API_URL}/games`);
        displayGames(response.data);
    } catch (error) {
        console.error('Error loading games:', error);
        alert('Failed to load games');
    }
}

function displayGames(games) {
    gamesList.innerHTML = '';
    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.innerHTML = `
            <div>
                <h3>${game.title}</h3>
                <p>Genre: ${game.genre}</p>
                <p>Price: $${game.price}</p>
                <p>Quantity: ${game.quantity}</p>
                <p>Status: ${game.loan_status ? 'Loaned' : 'Available'}</p>
            </div>
            <div>
                ${!game.loan_status ? 
                    `<button onclick="loanGame(${game.id})" class="loan-btn">Loan Game</button>` : 
                    ''
                }
                <button onclick="deleteGame(${game.id})" class="delete-btn">Delete</button>
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
        await axios.post(`${API_URL}/games`, gameData);
        addGameForm.reset();
        loadGames();
    } catch (error) {
        console.error('Error adding game:', error);
        alert('Failed to add game');
    }
});

async function deleteGame(gameId) {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
        await axios.delete(`${API_URL}/games/${gameId}`);
        loadGames();
    } catch (error) {
        console.error('Error deleting game:', error);
        alert('Failed to delete game');
    }
}

// Customer Management
addCustomerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const customerData = {
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value
    };

    try {
        const response = await axios.post(`${API_URL}/customers`, customerData);
        currentCustomerId = response.data.id;
        addCustomerForm.reset();
        alert(`Customer ${customerData.name} registered successfully`);
    } catch (error) {
        console.error('Error registering customer:', error);
        alert('Failed to register customer');
    }
});

// Loans Management
async function loadLoans() {
    try {
        const response = await axios.get(`${API_URL}/loans`);
        displayLoans(response.data);
    } catch (error) {
        console.error('Error loading loans:', error);
        alert('Failed to load loans');
    }
}

function displayLoans(loans) {
    loansList.innerHTML = '';
    loans.forEach(loan => {
        const loanCard = document.createElement('div');
        loanCard.className = 'loan-card';
        loanCard.innerHTML = `
            <div>
                <h3>${loan.game_title}</h3>
                <p>Customer: ${loan.customer_name}</p>
                <p>Loan Date: ${new Date(loan.loan_date).toLocaleDateString()}</p>
            </div>
        `;
        loansList.appendChild(loanCard);
    });
}

async function loanGame(gameId) {
    if (!currentCustomerId) {
        alert('Please register a customer first');
        return;
    }

    try {
        await axios.post(`${API_URL}/loans`, {
            game_id: gameId,
            customer_id: currentCustomerId
        });
        currentCustomerId = null; // Reset current customer after loan
        await Promise.all([loadGames(), loadLoans()]);
        alert('Game loaned successfully');
    } catch (error) {
        console.error('Error creating loan:', error);
        alert('Failed to loan game');
    }
}

// Initialize dashboard if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    if (document.cookie.includes('session')) {
        loginContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        loadDashboard();
    }
});