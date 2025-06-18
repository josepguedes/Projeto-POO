import { loadDestinations } from '../models/destinations.js';

const favoritesGrid = document.querySelector('.favorites-grid');
let allDestinos = [];

// Função para renderizar os favoritos
async function renderFavorites() {
    if (!favoritesGrid) return;

    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === loggedUser?.id);

    if (!user || !user.favourits || user.favourits.length === 0) {
        favoritesGrid.innerHTML = `<div class="text">Nenhum voo favorito encontrado.</div>`;
        return;
    }

    if (allDestinos.length === 0) {
        allDestinos = await loadDestinations();
    }

    favoritesGrid.innerHTML = user.favourits.map(flight => {
        const destinoObj = allDestinos.find(d => d.CodigoDestino === flight.arrival?.code);
        const imageUrl = destinoObj?.ImagemDestino || 'https://cdn.visitportugal.com/sites/default/files/styles/destinos_galeria/public/mediateca/N26021.jpg?itok=yJUnjR2p';

        return `
        <div class="favorite-card" data-flight-id="${flight.id}">
            <button class="favorite-btn active" title="Remover dos favoritos">
                <i class="fas fa-heart"></i>
            </button>
            <div class="destination-image">
                <img src="${imageUrl}" alt="${flight?.arrival?.city || 'Destino'}">
            </div>
            <div class="card-content">
                <div class="destination-info">
                    <h3>${flight?.arrival?.city || 'Destino'}</h3>
                    <div class="route-info">
                        <span>${flight?.departure?.code || ''}</span>
                        <i class="fas fa-plane"></i>
                        <span>${flight?.arrival?.code || ''}</span>
                    </div>
                </div>
                <div class="flight-details">
                    <div class="detail">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${flight?.departure?.date ? new Date(flight.departure.date).toLocaleDateString('pt-PT') : 'N/A'}</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-users"></i>
                        <span>${flight.people || 1} Passageiro(s)</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-plane-departure"></i>
                        <span>${flight?.airline?.name || 'N/A'}</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-clock"></i>
                        <span>${flight.flightTime || 'N/A'}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="price">
                        <small>a partir de</small>
                        <span>${flight.price ? `${flight.price.toFixed(2)}€` : '--'}</span>
                    </div>
                    <button class="btn btn-primary buy-btn">Comprar</button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// Event listener para remover dos favoritos e comprar
if (favoritesGrid) {
    favoritesGrid.addEventListener('click', function (e) {
        const card = e.target.closest('.favorite-card');
        if (!card) return;

        const flightId = card.getAttribute('data-flight-id');
        if (!flightId) return;

        const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === loggedUser?.id);
        if (userIndex === -1) return;

        // Lógica para remover dos favoritos
        if (e.target.closest('.favorite-btn')) {
            users[userIndex].favourits = users[userIndex].favourits.filter(fav => fav.id != flightId);
            localStorage.setItem('users', JSON.stringify(users));
            sessionStorage.setItem('loggedUser', JSON.stringify(users[userIndex]));
            alert('Voo removido dos favoritos!');
            renderFavorites();
        }

        // botao de comprar
        if (e.target.closest('.buy-btn')) {
            const flight = users[userIndex].favourits.find(f => f.id == flightId);
            if (flight) {
                const searchInfo = {
                    origemNome: flight.departure.city,
                    destinoNome: flight.arrival.city,
                    dataIda: null,
                    dataChegada: null,
                    passageiros: 1,
                    tipoTurismo: null
                };
                sessionStorage.setItem('searchInfo', JSON.stringify(searchInfo));
                window.location.href = '../html/flight.html';
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', renderFavorites);