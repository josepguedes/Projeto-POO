import { loadFlights } from '../models/flights.js';
import { loadUsers, updateUser } from '../models/users.js';




// Função para adicionar ticket ao utilizador logado
function addTicketToUser(flight) {
    loadUsers();
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
    if (!loggedUser) {
        alert('É necessário iniciar sessão para comprar um voo.');
        return;
    }

    // Adiciona o voo aos tickets do utilizador
    loggedUser.tickets = loggedUser.tickets || [];
    loggedUser.tickets.push({ flightId: flight.id }); // <-- flightId é obrigatório

    // Atualiza o utilizador nos dados globais/localStorage
    updateUser(
        loggedUser.name,
        loggedUser.email,
        loggedUser.password,
        loggedUser.profImg,
        loggedUser.favourits,
        loggedUser.tickets
    );

    // Atualiza sessão
    sessionStorage.setItem('loggedUser', JSON.stringify(loggedUser));
    alert('Voo comprado com sucesso!');
}

async function renderFlights() {
    const flights = await loadFlights();
    const flightTicket = document.getElementById('flight-ticket');
    const searchInfo = JSON.parse(sessionStorage.getItem('searchInfo'));

    if (!flightTicket) return;

    if (!searchInfo || !searchInfo.origemNome || !searchInfo.destinoNome) {
        flightTicket.innerHTML = `<div class="col-12 text-center"><p>Por favor, preencha origem e destino para ver os voos disponíveis.</p></div>`;
        return;
    }

    // Apenas origem e destino são obrigatórios para dar match
    const filteredFlights = flights.filter(flight => {
        const matchOrigem = flight.departure.city === searchInfo.origemNome;
        const matchDestino = flight.arrival.city === searchInfo.destinoNome;
        return matchOrigem && matchDestino;
    });

    if (filteredFlights.length === 0) {
        flightTicket.innerHTML = `<div class="col-12 text-center"><p>Nenhum voo encontrado para os critérios selecionados.</p></div>`;
    } else {
        flightTicket.innerHTML = filteredFlights.map((flight, idx) => `
            <div class="flight-ticket" data-idx="${idx}">
                <div class="ticket-content">
                    <div class="main-content">
                        <div class="ticket-header">
                            <div class="logo-frame">
                                <img class="logo"
                                src="${flight.airline?.logo || ''}"
                                alt="${flight.airline?.name || ''}">
                            </div>
                        </div>
                        <div class="details">
                            <div class="time-info">
                                <div class="departure">
                                    <small>Partida</small>
                                    <div class="time">${flight.departure.date ? new Date(flight.departure.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                    <div>${flight.departure.code || ''} - ${flight.departure.city || ''}</div>
                                </div>
                                <div class="flight-path">
                                    <div>${flight.flightTime || ''}</div>
                                    <div class="plane-icon"><i class="fas fa-plane fa-rotate-270"></i></div>
                                    <div>${flight.direct ? 'Direto' : 'Com escalas'}</div>
                                </div>
                                <div class="arrival">
                                    <small>Chegada</small>
                                    <div class="time">${flight.arrival.date ? new Date(flight.arrival.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                    <div>${flight.arrival.code || ''} - ${flight.arrival.city || ''}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="price-section">
                        <div class="price">${flight.price}€</div>
                        <button class="book-btn" data-idx="${idx}">Comprar</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Adiciona evento aos botões "Comprar"
        document.querySelectorAll('.book-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const idx = this.getAttribute('data-idx');
                addTicketToUser(filteredFlights[idx]);
            });
        });
    }
    updateResultsCount();
}

window.addEventListener('DOMContentLoaded', renderFlights);

// Atualiza o contador de resultados
function updateResultsCount() {
    const count = document.querySelectorAll('.flight-ticket').length;
    const resultsCountElem = document.getElementById('results-count');
    if (resultsCountElem) {
        resultsCountElem.textContent = `(${count})`;
    }
}
document.addEventListener('DOMContentLoaded', updateResultsCount);

const searchForm = document.getElementById('search-info');
const searchData = JSON.parse(sessionStorage.getItem('searchInfo')) || {};

searchForm.innerHTML = `
    <div class="card mb-4">
        <div class="card-body">
            <div class="row align-items-center">
                <div class="col-md-3">
                    <small class="text-muted">Origem - Destino</small>
                    <div class="fw-bold">${searchData.origemNome || '-'} - ${searchData.destinoNome || '-'}</div>
                </div>
                <div class="col-md-2">
                    <small class="text-muted">Data-Ida</small>
                    <div class="fw-bold">${searchData.dataIda ? new Date(searchData.dataIda).toLocaleDateString('pt-PT') : '-'}</div>
                </div>
                <div class="col-md-2">
                    <small class="text-muted">Data-Chegada</small>
                    <div class="fw-bold">${searchData.dataChegada ? new Date(searchData.dataIda).toLocaleDateString('pt-PT') : '-'}</div>
                </div>
                <div class="col-md-2">
                    <small class="text-muted">Passageiros</small>
                    <div class="fw-bold">${searchData.passageiros || '-'}</div>
                </div>
                <div class="col-md-2">
                    <small class="text-muted">Tipo de Turismo</small>
                    <div class="fw-bold">${searchData.tipoTurismo || '-'}</div>
                </div>
                <div class="col-md-1">
                    <button class="btn btn-outline-danger rounded-circle search-btn" onclick="window.location.href='../index.html'" title="Modificar Pesquisa">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
`;

//Filtrar voos
async function filtersFlights() {
    const filter = document.getElementById('filter').value;
    const flights = await loadFlights();
    let sortedFlights = [...flights];
    if (filter === 'Ordenar por: Preço mais baixo') {
        sortedFlights.sort((a, b) => a.price - b.price);
    } else if (filter === 'Ordenar por: Preço mais alto') {
        sortedFlights.sort((a, b) => b.price - a.price);
    } else if (filter === 'Ordenar por: Duração mais curta') {
        // Assume flightTime format is "Xh Ym"
        sortedFlights.sort((a, b) => {
            const toMinutes = t => {
                if (!t) return Infinity;
                const match = t.match(/(\d+)h\s*(\d+)?m?/i);
                if (!match) return Infinity;
                const hours = parseInt(match[1]) || 0;
                const mins = parseInt(match[2]) || 0;
                return hours * 60 + mins;
            };
            return toMinutes(a.flightTime) - toMinutes(b.flightTime);
        });
    } else if (filter === 'Ordenar por: Partida mais cedo') {
        sortedFlights.sort((a, b) => new Date(a.departure.date) - new Date(b.departure.date));
    }
    // Render sorted flights
    const flightTicket = document.getElementById('flight-ticket');
    flightTicket.innerHTML = sortedFlights.map((flight, idx) => `
         <div class="flight-ticket" data-idx="${idx}">
             <div class="ticket-content">
                 <div class="main-content">
                     <div class="ticket-header">
                         <img class="logo"
                             src="${flight.airline.logo}"
                             alt="${flight.airline.name}">
                     </div>
                     <div class="details">
                         <div class="time-info">
                             <div class="departure">
                                 <small>Partida</small>
                                 <div class="time">${new Date(flight.departure.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</div>
                                 <div>${flight.departure.code} - ${flight.departure.city}</div>
                             </div>
                             <div class="flight-path">
                                 <div>${flight.flightTime}</div>
                                 <div class="plane-icon"><i class="fas fa-plane fa-rotate-270"></i></div>
                                 <div>${flight.direct ? 'Direto' : 'Com escalas'}</div>
                             </div>
                             <div class="arrival">
                                 <small>Chegada</small>
                                 <div class="time">${new Date(flight.arrival.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</div>
                                 <div>${flight.arrival.code} - ${flight.arrival.city}</div>
                             </div>
                         </div>
                     </div>
                 </div>
                 <div class="price-section">
                     <div class="price">${flight.price}€</div>
                     <button class="book-btn" data-idx="${idx}">Comprar</button>
                 </div>
             </div>
         </div>
     `).join('');

    // Adiciona evento aos botões "Comprar"
    document.querySelectorAll('.book-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const idx = this.getAttribute('data-idx');
            addTicketToUser(sortedFlights[idx]);
        });
    });

    updateResultsCount();
}

// Evento para filtrar ao mudar o select
document.getElementById('filter').addEventListener('change', filtersFlights);

// Chama uma vez ao carregar a página para garantir ordenação inicial
filtersFlights();