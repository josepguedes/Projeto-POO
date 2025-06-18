import { loadDestinations } from '../models/destinations.js';
import { loadTypes } from '../models/type.js';
import { loadFlights } from '../models/flights.js';
import { loadUsers } from '../models/users.js';


//Carregar dados iniciais
const searchForm = document.getElementById('Pesquisar');
const destinos = await loadDestinations();
const tipos = await loadTypes();


//Renderizar formulário de pesquisa
searchForm.innerHTML = `
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <h1 class="text-center mb-4">Viva as melhores experiências, no maior conforto, ao melhor preço.</h1>
                <div class="form-container">
                    <form id="mainSearchForm">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <select class="form-select" id="localIda" style="color: #000;" required>
                                    <option selected disabled>Local de Partida</option>
                                    ${destinos.map(destino => `<option value="${destino.id}" style="color: #000;">${destino.Destino}</option>`).join('')}
                                </select>
                            </div>
                            <div class="col-md-6">
                                <select class="form-select" id="localChegada" style="color: #000;" required>
                                    <option selected disabled>Local de Chegada</option>
                                    ${destinos.map(destino => `<option value="${destino.id}" style="color: #000;">${destino.Destino}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="dataIda" class="form-label" style="color: #000;">Data de Partida</label>
                                <input type="date" class="form-control" id="dataIda">
                            </div>
                            <div class="col-md-6">
                                <label for="dataChegada" class="form-label" style="color: #000;">Data de Chegada</label>
                                <input type="date" class="form-control" id="dataChegada">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <input type="number" class="form-control" id="numeroPessoas" placeholder="Número de pessoas">
                            </div>
                        </div>
                        <div class="mb-3">
                            <select class="form-select" id="tipoTurismo">
                                <option selected disabled>Escolha o tipo de turismo</option>
                                ${tipos.map(tipo => `<option value="${tipo.id}">${tipo.Nome}</option>`).join('')}
                            </select>
                        </div>
                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary">Pesquisar</button>
                        </div>
                    </form>
                    <div class="text-center mt-4">
                        <p class="text-muted">Não sabe para onde quer ir?</p>
                        <a href="./html/quiz.html" class="btn btn-outline-danger">
                            <i class="fas fa-compass me-2"></i>
                            Descobre o teu perfil de viajante
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;


// Evento de submit do formulário de pesquisa
document.getElementById('mainSearchForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const origemId = document.getElementById('localIda').value;
    const destinoId = document.getElementById('localChegada').value;
    const dataIda = document.getElementById('dataIda').value;
    const dataChegada = document.getElementById('dataChegada').value;
    const passageiros = document.getElementById('numeroPessoas').value;
    const turismoId = document.getElementById('tipoTurismo').value;

    if (!origemId || !destinoId) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Procurar o nome pelo id no array destinos
    const origemObj = destinos.find(d => d.id == origemId);
    const destinoObj = destinos.find(d => d.id == destinoId);
    const turismoObj = tipos.find(t => t.id == turismoId);

    const origemNome = origemObj ? origemObj.Destino : '';
    const destinoNome = destinoObj ? destinoObj.Destino : '';
    const turismoNome = turismoObj ? turismoObj.Nome : '';

    // Salva no sessionStorage
    sessionStorage.setItem('searchInfo', JSON.stringify({
        origemNome,
        destinoNome,
        dataIda,
        dataChegada,
        passageiros,
        tipoTurismo: turismoNome
    }));

    // Redireciona para a página de voos
    window.location.href = './html/flight.html';
});


//Renderizar cards de destinos/voos
const destinationsCard = document.getElementById('flightCardsContainer');
const priceFilter = document.getElementById('price-filter');
const priceValue = document.getElementById('price-value');

let allFlights = [];
let allDestinos = [];
let uniqueCheapestFlights = []; // voo mais barato por destino

function createFlightCardHTML(flight) {
    const destinoObj = allDestinos.find(d => d.CodigoDestino === flight.arrival?.code);
    const origemObj = allDestinos.find(d => d.CodigoDestino === flight.departure?.code);

    const imageUrl = destinoObj?.ImagemDestino || 'https://cdn.visitportugal.com/sites/default/files/styles/destinos_galeria/public/mediateca/N26021.jpg?itok=yJUnjR2p';
    const altText = destinoObj?.Destino || flight.arrival?.city || 'Destino';

    const dataPartidaFormatada = flight.departure?.date ? new Date(flight.departure.date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', weekday: 'short' }) : 'N/A';

    return `
    <div class="col-lg-4 col-md-6 mb-4">
        <div class="card h-100" data-flight-id="${flight.id}">
            <button class="favorite-btn">
                <i class="fas fa-star"></i>
            </button>
            <img src="${imageUrl}" class="card-img-top" alt="${altText}" style="height: 200px; object-fit: cover;">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title mb-0"><strong>${destinoObj?.Destino || flight.arrival?.city || 'Destino Desconhecido'}</strong></h5>
                <small class="text-muted">${destinoObj?.Pais || 'País Desconhecido'}</small>
                <div class="flight-info mt-3">
                    <div class="d-flex align-items-center mb-2">
                        <div class="flight-date">
                            <i class="fas fa-plane me-2" style="color: #D90429"></i>
                            <span>${dataPartidaFormatada}</span>
                        </div>
                        <small class="ms-2">${origemObj?.CodigoDestino || 'N/A'} - ${destinoObj?.CodigoDestino || 'N/A'}</small>
                    </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-auto pt-3">
                    <div class="price-info">
                        <small class="text-muted">a partir de</small>
                        <div class="price">${flight.price ? flight.price.toFixed(2) + ' €' : '--'}</div>
                    </div>
                    <button class="btn btn-primary">Comprar</button>
                </div>
            </div>
        </div>
    </div>
    `;
}

// filtrar os voos e tal
function filterAndRenderFlights() {
    if (!priceFilter || !priceValue || !destinationsCard) return;

    const maxPrice = parseFloat(priceFilter.value);
    priceValue.textContent = `${maxPrice.toFixed(2)}€`;

    const filteredFlights = uniqueCheapestFlights
        .filter(flight => flight.price <= maxPrice)
        .sort((a, b) => b.price - a.price) // Ordenacao
        .slice(0, 6); // Seleciona os 6 primeiros

    if (filteredFlights.length > 0) {
        destinationsCard.innerHTML = filteredFlights.map(createFlightCardHTML).join('');
    } else {
        destinationsCard.innerHTML = `<div class="col-12 text-center"><p>Nenhuma oferta de voo encontrada para este preço.</p></div>`;
    }
}

// Função principal para configurar a secção de ofertas
async function setupFlightDeals() {
    allDestinos = await loadDestinations();
    allFlights = await loadFlights();

    if (!allFlights || allFlights.length === 0) {
        if (destinationsCard) destinationsCard.innerHTML = `<div class="col-12 text-center"><h1>Não há voos disponíveis no momento.</h1></div>`;
        if (priceFilter) priceFilter.closest('.row').style.display = 'none';
        return;
    }

    // Agrupa os voos por destino e encontra o mais barato para cada um
    const cheapestFlightsMap = new Map();
    allFlights.forEach(flight => {
        const destCode = flight.arrival?.code;
        if (destCode && typeof flight.price === 'number') {
            const existingFlight = cheapestFlightsMap.get(destCode);
            if (!existingFlight || flight.price < existingFlight.price) {
                cheapestFlightsMap.set(destCode, flight);
            }
        }
    });
    uniqueCheapestFlights = Array.from(cheapestFlightsMap.values());

    const prices = uniqueCheapestFlights.map(f => f.price).filter(p => p != null);
    if (prices.length === 0) {
        if (destinationsCard) destinationsCard.innerHTML = `<div class="col-12 text-center"><p>Nenhuma oferta de voo disponível.</p></div>`;
        if (priceFilter) priceFilter.closest('.row').style.display = 'none';
        return;
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = (minPrice + maxPrice) / 2;

    if (priceFilter) {
        priceFilter.min = Math.floor(minPrice);
        priceFilter.max = Math.ceil(maxPrice);
        priceFilter.value = avgPrice; // Começa no preço médio
        priceFilter.addEventListener('input', filterAndRenderFlights);
    }

    filterAndRenderFlights();
}

// Event listener para adicionar aos favoritos
if (destinationsCard) {
    destinationsCard.addEventListener('click', async function (e) {
        const card = e.target.closest('.card');
        if (!card) return;

        const flightId = card.dataset.flightId;
        if (!flightId) return;

        // botao de compra
        if (e.target.closest('.btn-primary')) {
            const flight = uniqueCheapestFlights.find(f => f.id == flightId);
            if (!flight) return;

            const searchInfo = {
                origemNome: flight.departure.city,
                destinoNome: flight.arrival.city,
                dataIda: null,
                dataChegada: null,
                passageiros: 1,
                tipoTurismo: null
            };

            sessionStorage.setItem('searchInfo', JSON.stringify(searchInfo));
            window.location.href = './html/flight.html';
            return;
        }

        // botao de favorito
        if (e.target.closest('.favorite-btn')) {
            const favBtn = e.target.closest('.favorite-btn');
            const user = JSON.parse(sessionStorage.getItem('loggedUser'));
            if (!user) {
                alert('Faça login para adicionar aos favoritos.');
                window.location.href = './html/login.html';
                return;
            }

            const flight = allFlights.find(f => f.id == flightId);
            if (!flight) return;

            await loadUsers();
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex === -1) return;

            const userObj = users[userIndex];
            if (!Array.isArray(userObj.favourits)) userObj.favourits = [];

            const exists = userObj.favourits.some(fav => fav.id == flight.id);
            if (exists) {
                alert('Este voo já está nos seus favoritos.');
                return;
            }

            userObj.favourits.push(flight);
            localStorage.setItem('users', JSON.stringify(users));
            sessionStorage.setItem('loggedUser', JSON.stringify(userObj));

            alert('Voo adicionado aos favoritos!');
            favBtn.classList.add('active');
        }
    });
}

// Inicia a secção de ofertas
setupFlightDeals();