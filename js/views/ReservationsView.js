import { loadFlights } from '../models/flights.js';


document.addEventListener('DOMContentLoaded', () => {
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
    if (loggedUser) {
        const profileImage = document.getElementById('profileImage');
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (profileImage) {
            profileImage.src = loggedUser.profImg || '../img/default_Avatar.jpg';
        }
        if (userNameDisplay) {
            userNameDisplay.textContent = `Olá, ${loggedUser.name}!`;
        }
    }
});

// Função para renderizar os tickets do utilizador autenticado
async function renderUserReservations() {
    const bookingsList = document.getElementById('bookingsList');
    if (!bookingsList) return;

    // Limpa o conteúdo anterior
    bookingsList.innerHTML = '';

    // Obtém o utilizador autenticado
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
    if (!loggedUser || !Array.isArray(loggedUser.tickets) || loggedUser.tickets.length === 0) {
        bookingsList.innerHTML = `<div class="alert alert-info text-center">Ainda não tem reservas de voos.</div>`;
        return;
    }

    // Carrega todos os voos
    const allFlights = await loadFlights();

    // Renderiza cada ticket
    loggedUser.tickets.forEach((ticket, idx) => {
        const flight = allFlights.find(f => f.id == ticket.flightId);
        if (!flight) return;

        const departureDate = flight.departure?.date ? new Date(flight.departure.date) : null;
        const arrivalDate = flight.arrival?.date ? new Date(flight.arrival.date) : null;

        const template = `
            <div class="reservation-card mb-4">
                <div class="reservation-header d-flex justify-content-between align-items-center">
                    <h3>Reserva #${String(ticket.flightId).padStart(6, '0')}</h3>
                    <span class="reservation-status status-confirmed">Confirmado</span>
                </div>
                <div class="reservation-content row">
                    <div class="col-md-8">
                        <div class="flight-details">
                            <div class="flight-route mb-2">
                                <span class="airport-code">${flight.departure?.code || '-'}</span>
                                <span class="airport-name">${flight.departure?.city || '-'}</span>
                                <span class="mx-2"><i class="fas fa-arrow-right"></i></span>
                                <span class="airport-code">${flight.arrival?.code || '-'}</span>
                                <span class="airport-name">${flight.arrival?.city || '-'}</span>
                            </div>
                            <div class="flight-meta d-flex flex-wrap gap-4">
                                <div>
                                    <span class="meta-label">Partida</span><br>
                                    <span class="meta-value">${departureDate ? departureDate.toLocaleDateString('pt-PT') : '-'}</span>
                                    <span class="meta-value">${departureDate ? departureDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                </div>
                                <div>
                                    <span class="meta-label">Chegada</span><br>
                                    <span class="meta-value">${arrivalDate ? arrivalDate.toLocaleDateString('pt-PT') : '-'}</span>
                                    <span class="meta-value">${arrivalDate ? arrivalDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                </div>
                                <div>
                                    <span class="meta-label">Passageiros</span><br>
                                    <span class="meta-value">${flight.people || 1}</span>
                                </div>
                                <div>
                                    <span class="meta-label">Companhia</span><br>
                                    <span class="meta-value">${flight.airline?.name || '-'}</span>
                                </div>
                                <div>
                                    <span class="meta-label">Preço</span><br>
                                    <span class="meta-value">${flight.price ? flight.price.toFixed(2) + ' €' : '--'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 d-flex flex-column align-items-center justify-content-center">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${ticket.flightId}" alt="QR Code" class="qr-code mb-2">
                        <span class="booking-reference">#${String(ticket.flightId).padStart(6, '0')}</span>
                    </div>
                </div>
            </div>
        `;
        bookingsList.innerHTML += template;
    });
}

document.addEventListener('DOMContentLoaded', renderUserReservations);