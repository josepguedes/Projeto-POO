import { loadUsers, updateUser } from '../models/users.js';
import { getDestinationsByTourismType, loadDestinations } from '../models/destinations.js';
import { loadFlights } from '../models/flights.js';

document.addEventListener('DOMContentLoaded', function() {
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
    if (!loggedUser) {
        window.location.href = 'login.html';
        return;
    }

    // Load user data
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const profileImage = document.getElementById('profileImage');
    const userNameDisplay = document.getElementById('userNameDisplay');

    if (loggedUser) {
        nameInput.value = loggedUser.name;
        emailInput.value = loggedUser.email;
        profileImage.src = loggedUser.profImg || '../img/default_Avatar.jpg';
        userNameDisplay.textContent = `Olá, ${loggedUser.name}!`;

        // Exibir resultados do quiz se existirem
        if (loggedUser.quizScores) {
            displayQuizResults(loggedUser.quizScores);
        }
        // Iniciar o mapa de viagens
        setupTravelMap(loggedUser);
    }


    // Handle profile image upload
    document.getElementById('avatarInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImage.src = e.target.result;
                loggedUser.profImg = e.target.result;
                sessionStorage.setItem('loggedUser', JSON.stringify(loggedUser));
            }
            reader.readAsDataURL(file);
            showMessage(error.message, 'danger');
        }
    });

    // Handle form submission
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;

        try {
            loadUsers();

            if (newPassword) {
                // Verify current password matches
                if (!currentPassword) {
                    throw new Error('Por favor, insira a password atual');
                }

                if (currentPassword !== loggedUser.password) {
                    throw new Error('Password atual incorreta');
                }
            }

            updateUser(
                nameInput.value,
                emailInput.value,
                newPassword || loggedUser.password,
                profileImage.src,
                loggedUser.favourits,
                loggedUser.quizScores
            );

            // Update session storage and display name
            loggedUser.name = nameInput.value;
            loggedUser.email = emailInput.value;
            userNameDisplay.textContent = `Olá, ${nameInput.value}!`;

            if (newPassword) {
                loggedUser.password = newPassword;
            }
            sessionStorage.setItem('loggedUser', JSON.stringify(loggedUser));

            showMessage('Perfil atualizado com sucesso!', 'success');
        } catch (error) {
            showMessage(error.message, 'danger');
        }
    });


    document.querySelector('.cancel-btn').addEventListener('click', function() {
        window.location.href = '../index.html';
    });
});

async function displayQuizResults(scores) {
    const quizSection = document.getElementById('quiz-results-section');
    const scoresContainer = document.getElementById('scores-container');
    if (!quizSection || !scoresContainer) return;

    quizSection.style.display = 'block';

    const sortedScores = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .filter(([, score]) => score > 0);

    scoresContainer.innerHTML = sortedScores.map(([type, score]) => `
        <div class="col-md-4 col-sm-6 mb-3">
            <div class="card h-100 text-center border-danger">
                <div class="card-body d-flex flex-column justify-content-center">
                    <h5 class="card-title">${type}</h5>
                    <p class="display-4 text-danger mb-0">${score}</p>
                </div>
            </div>
        </div>
    `).join('');

    await renderProfileRecommendations(scores);
}

async function renderProfileRecommendations(scores) {
    const recommendedContainer = document.getElementById('recommended-destinations-container');
    if (!recommendedContainer) return;

    const getTopTourismType = (s) => Object.keys(s).reduce((a, b) => s[a] > s[b] ? a : b);
    const topType = getTopTourismType(scores);

    try {
        await loadDestinations();
        const allFlightsData = await loadFlights();
        const destinations = await getDestinationsByTourismType(topType);

        if (!destinations || destinations.length === 0) {
            recommendedContainer.innerHTML = `<p class="text-center">Não encontrámos recomendações para o seu perfil.</p>`;
            return;
        }

        const destinationsWithFlights = destinations.map(dest => {
            const flightsToDest = allFlightsData.filter(f => f.arrival?.code === dest.CodigoDestino && f.price);
            const cheapestFlight = flightsToDest.length > 0 ? flightsToDest.reduce((min, f) => f.price < min.price ? f : min) : null;
            return { ...dest, cheapestFlight };
        });

        const destinationCards = destinationsWithFlights.map(dest => {
            const flightId = dest.cheapestFlight ? dest.cheapestFlight.id : null;
            return `
            <div class="destination-card" data-flight-id="${flightId || ''}">
                <div class="card h-100">
                    ${flightId ? `<button class="favorite-btn"><i class="fas fa-star"></i></button>` : ''}
                    <img src="${dest.ImagemDestino || '../img/homeBg.jpg'}" class="card-img-top" alt="${dest.Destino}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${dest.Destino}</h5>
                        <p class="card-text text-muted small flex-grow-1">${dest.Descricao ? dest.Descricao.substring(0, 80) + '...' : 'Sem descrição.'}</p>
                        <button class="btn btn-primary mt-auto btn-ver-ofertas" data-destination='${JSON.stringify(dest).replace(/'/g, "&apos;")}'>Ver Ofertas</button>
                    </div>
                </div>
            </div>`;
        }).join('');

        recommendedContainer.innerHTML = `<div class="recommended-destinations-list">${destinationCards}</div>`;
        addRecommendationEventListeners(recommendedContainer, allFlightsData);
    } catch (error) {
        console.error('Erro ao renderizar recomendações no perfil:', error);
        recommendedContainer.innerHTML = '<p class="text-center">Ocorreu um erro ao carregar as recomendações.</p>';
    }
}

function addRecommendationEventListeners(container, allFlightsData) {
    container.addEventListener('click', async (e) => {
        const verOfertasBtn = e.target.closest('.btn-ver-ofertas');
        if (verOfertasBtn) {
            const dest = JSON.parse(verOfertasBtn.dataset.destination.replace(/&apos;/g, "'"));
            sessionStorage.setItem('searchInfo', JSON.stringify({
                origemNome: "Porto",
                destinoNome: dest.Destino,
                dataIda: null, dataChegada: null, passageiros: 1, tipoTurismo: dest.TipoTurismo
            }));
            window.location.href = "../html/flight.html";
            return;
        }

        const favBtn = e.target.closest('.favorite-btn');
        if (favBtn) {
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
            if (!flight) return;

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex === -1) return;

            const userObj = users[userIndex];
            if (!Array.isArray(userObj.favourits)) userObj.favourits = [];

            if (userObj.favourits.some(fav => fav.id == flight.id)) {
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

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `alert alert-${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

function setupTravelMap(user) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex === -1) return;

    if (!users[userIndex].visitedCountries) {
        users[userIndex].visitedCountries = [];
        localStorage.setItem('users', JSON.stringify(users));
    }
    let visitedCountries = users[userIndex].visitedCountries || [];

    // Cria o objeto de dados para o mapa (ex: {'PT': 1, 'ES': 1})
    const mapData = visitedCountries.reduce((acc, countryCode) => {
        acc[countryCode] = 1; // 1 == visitado
        return acc;
    }, {});

    const mapElement = $('#world-map');
    mapElement.empty();
    mapElement.vectorMap({
        map: 'world_mill_en',
        backgroundColor: '#a0d3f0',
        series: {
            regions: [{
                values: mapData,
                scale: ['#8D99AE', '#D90429'],
                normalizeFunction: 'polynomial'
            }]
        },
        onRegionTipShow: function(e, el, code){
            const mapObject = mapElement.vectorMap('get', 'mapObject');
            const countryName = mapObject.getRegionName(code);
            const status = visitedCountries.includes(code) ? 'Visitado' : 'Não Visitado';
            el.html(`${countryName} - ${status}`);
        },
        onRegionClick: function(event, code) {
            const mapObject = mapElement.vectorMap('get', 'mapObject');
            
            const index = visitedCountries.indexOf(code);
            if (index > -1) {
                // Já visitado, remove
                visitedCountries.splice(index, 1);
                delete mapData[code];
            } else {
                // Não visitado, adiciona
                visitedCountries.push(code);
                mapData[code] = 1;
            }

            // Atualiza as cores do mapa
            mapObject.series.regions[0].setValues(mapData);

            // Guarda as alterações no localStorage
            users[userIndex].visitedCountries = visitedCountries;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Atualiza também o sessionStorage para consistência na sessão atual
            const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
            loggedUser.visitedCountries = visitedCountries;
            sessionStorage.setItem('loggedUser', JSON.stringify(loggedUser));

            // Atualiza as estatísticas
            updateTravelStats(visitedCountries);
        }
    });

    updateTravelStats(visitedCountries);
}

function updateTravelStats(visitedCountries) {
    const statsContainer = document.getElementById('travel-stats');
    if (statsContainer) {
        const totalCountries = Object.keys(jvm.Map.maps['world_mill_en'].paths).length;
        const visitedCount = visitedCountries.length;
        const percentage = totalCountries > 0 ? (visitedCount / totalCountries) * 100 : 0;

        statsContainer.innerHTML = `
            <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-danger" role="progressbar" style="width: ${percentage}%" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div class="text-center mt-2">
                <strong>${visitedCount}</strong> de <strong>${totalCountries}</strong> países visitados (${percentage.toFixed(1)}%)
            </div>
        `;
    }
}