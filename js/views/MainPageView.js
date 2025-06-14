import { loadDestinations } from '../models/destinations.js';
import { loadTypes } from '../models/type.js';
import { loadFlights } from '../models/flights.js';


const searchForm = document.getElementById('Pesquisar');

const destinos = await loadDestinations();
const tipos = await loadTypes();

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

// Adiciona o evento de submit ao formulário de pesquisa
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




// Criação dos Cards de Destinos

const destinationsCard = document.getElementById('flightCardsContainer');

async function renderFlightCards() {
    const allFlights = await loadFlights(); // Renomeado para clareza
    // Se não houver voos, mostra mensagem
    if (!allFlights || allFlights.length === 0) {
        destinationsCard.innerHTML = `<div class="col-12 text-center"><p>Não há voos disponíveis no momento.</p></div>`;
        return;
    }

    // Pega apenas os primeiros 3 voos, se houver mais de 3
    // Seleciona 3 voos aleatórios do array de voos disponíveis
    const shuffledFlights = allFlights.sort(() => Math.random() - 0.5);
    const flightsList = shuffledFlights.slice(0, 3);

    destinationsCard.innerHTML = flightsList.map(flight => {
        // Busca os objetos de destino pelos códigos de partida e chegada do voo
        const origemObj = destinos.find(d => d.CodigoDestino === flight.departure?.code);
        const destinoObj = destinos.find(d => d.CodigoDestino === flight.arrival?.code);

        const imageUrl = destinoObj?.ImagemDestino ? destinoObj.ImagemDestino : 'https://cdn.visitportugal.com/sites/default/files/styles/destinos_galeria/public/mediateca/N26021.jpg?itok=yJUnjR2p';
        const altText = destinoObj?.Destino || flight.arrival?.city || 'Destino';

        // Formata as datas de partida e chegada
        const dataPartidaFormatada = flight.departure?.date ? new Date(flight.departure.date).toLocaleDateString('pt-PT') : 'N/A';
        const dataChegadaFormatada = flight.arrival?.date ? new Date(flight.arrival.date).toLocaleDateString('pt-PT') : 'N/A';

        const companhiaAerea = flight.airline?.name || 'Companhia Desconhecida';

        return `
        <div class="col-md-4">
            <div class="card h-100">
                <button class="favorite-btn">
                    <i class="fas fa-star"></i>
                </button>
                <img src="${imageUrl}"
                    class="card-img-top" alt="${altText}">
                <div class="card-body">
                    <h5 class="card-title mb-0"><strong>${destinoObj?.Destino || flight.arrival?.city || 'Destino Desconhecido'}</strong></h5>
                    <div class="flight-info mt-3">
                        <div class="d-flex align-items-center mb-2">
                            <div class="flight-date">
                                <i class="fas fa-plane me-2" style="color: #D90429"></i>
                                <span>${dataPartidaFormatada}</span>
                            </div>
                            <small class="ms-2">${origemObj?.CodigoDestino || flight.departure?.code || 'N/A'} - ${destinoObj?.CodigoDestino || flight.arrival?.code || 'N/A'} com ${companhiaAerea}</small>
                        </div>
                        <div class="d-flex align-items-center">
                            <div class="flight-date">
                                <i class="fas fa-plane me-2"
                                    style="transform: rotate(180deg); color: #D90429"></i>
                                <span>${dataChegadaFormatada}</span>
                            </div>
                            <small class="ms-2">${destinoObj?.CodigoDestino || flight.arrival?.code || 'N/A'} - ${origemObj?.CodigoDestino || flight.departure?.code || 'N/A'} com ${companhiaAerea}</small>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-3">
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
    }).join('');
}

renderFlightCards();