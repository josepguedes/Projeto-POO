import { getDestinationsByTourismType, loadDestinations } from '../models/destinations.js';
import { loadFlights } from '../models/flights.js';
import { loadUsers } from '../models/users.js';

let allFlightsData = []; // Armazena os voos para evitar recarregamentos

function getTopTourismType(scores) {
    if (!scores || Object.keys(scores).length === 0) {
        return null;
    }
    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
}

export async function renderRecommendedDestinations(scores) {
    const recommendedContainer = document.getElementById('recommended-destinations-container');
    if (!recommendedContainer) {
        console.error('Container para destinos recomendados não encontrado.');
        return;
    }

    const topType = getTopTourismType(scores);
    if (!topType) {
        recommendedContainer.innerHTML = '<p class="text-center">Não foi possível determinar o seu perfil de viajante.</p>';
        return;
    }

    try {
        await loadDestinations();
        allFlightsData = await loadFlights(); // Carrega e armazena os voos
        const destinations = await getDestinationsByTourismType(topType);

        if (!destinations || destinations.length === 0) {
            recommendedContainer.innerHTML = `
                <h2 class="text-center mb-4">Destinos Recomendados para Si</h2>
                <p class="text-center">De momento, não temos destinos que correspondam ao seu perfil de <strong>${topType}</strong>.</p>
            `;
            return;
        }

        const destinationsWithFlights = destinations.map(dest => {
            const flightsToDest = allFlightsData.filter(f => f.arrival?.code === dest.CodigoDestino && f.price);
            const cheapestFlight = flightsToDest.length > 0
                ? flightsToDest.reduce((min, f) => f.price < min.price ? f : min)
                : null;
            return { ...dest, cheapestFlight };
        });

        const destinationCards = destinationsWithFlights.map(dest => {
            const flightId = dest.cheapestFlight ? dest.cheapestFlight.id : null;
            const cardData = flightId ? `data-flight-id="${flightId}"` : '';

            return `
            <div class="destination-card" ${cardData}>
                <div class="card h-100">
                    ${flightId ? `
                    <button class="favorite-btn">
                        <i class="fas fa-star"></i>
                    </button>` : ''}
                    <img src="${dest.ImagemDestino ? `${dest.ImagemDestino}` : '../img/homeBg.jpg'}" class="card-img-top" alt="${dest.Destino}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${dest.Destino}</h5>
                        <p class="card-text text-muted small flex-grow-1">${dest.Descricao ? dest.Descricao.substring(0, 80) + '...' : 'Sem descrição disponível.'}</p>
                        <button class="btn btn-primary mt-auto" onclick='setFlightSearchFromQuiz(${JSON.stringify(dest).replace(/'/g, "&apos;")})'>Ver Ofertas</button>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        recommendedContainer.innerHTML = `
            <h2 class="text-center mb-4">Destinos Recomendados para Si</h2>
            <div class="recommended-destinations-list">
                ${destinationCards}
            </div>
        `;

    } catch (error) {
        console.error('Erro ao renderizar destinos recomendados:', error);
        recommendedContainer.innerHTML = '<p class="text-center">Ocorreu um erro ao carregar as recomendações.</p>';
    }
}

window.setFlightSearchFromQuiz = function(dest) {
    const today = new Date();
    const dataIda = today.toISOString().split('T')[0];
    const dataChegada = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    fetch('/js/data/destinations.json')
        .then(response => response.json())
        .then(data => {
            const destinos = data.destenys;
            const portoDestino = destinos.find(d => d.Destino === "Porto" || d.CodigoDestino === "OPO");
            
            sessionStorage.setItem('searchInfo', JSON.stringify({
                origemNome: portoDestino ? portoDestino.Destino : "Porto",
                destinoNome: dest.Destino,
                dataIda,
                dataChegada,
                passageiros: 2,
                tipoTurismo: dest.TipoTurismo
            }));
            
            window.location.href = "../html/flight.html";
        })
        .catch(error => {
            console.error('Erro ao carregar destinos:', error);
            sessionStorage.setItem('searchInfo', JSON.stringify({
                origemNome: "Porto",
                destinoNome: dest.Destino,
                dataIda,
                dataChegada,
                passageiros: 2,
                tipoTurismo: dest.TipoTurismo
            }));
            
            window.location.href = "../html/flight.html";
        });
}

// event listener para os botões de favorito
const recommendedContainer = document.getElementById('recommended-destinations-container');
if (recommendedContainer) {
    recommendedContainer.addEventListener('click', async (e) => {
        const favBtn = e.target.closest('.favorite-btn');
        if (!favBtn) return;

        const card = favBtn.closest('.destination-card');
        const flightId = card.dataset.flightId;
        if (!flightId) return;

        const user = JSON.parse(sessionStorage.getItem('loggedUser'));
        if (!user) {
            alert('Faça login para adicionar aos favoritos.');
            window.location.href = './login.html';
            return;
        }

        const flight = allFlightsData.find(f => f.id == flightId);
        if (!flight) {
            console.error("Voo não encontrado para adicionar aos favoritos.");
            return;
        }

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
    });
}