const favoritesGrid = document.querySelector('.favorites-grid');

// Função para renderizar os favourits
function renderFavorites() {
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === loggedUser?.id);

    if (!user || !user.favourits || user.favourits.length === 0) {
        favoritesGrid.innerHTML = `<div class="text">Nenhum voo favorito encontrado.</div>`;
        return;
    }

    favoritesGrid.innerHTML = user.favourits.map(flight => `
        <div class="favorite-card" data-flight-id="${flight.id}">
            <button class="favorite-btn active" title="Remover dos favourits">
                <i class="fas fa-heart"></i>
            </button>
            <div class="destination-image">
                <img src="${flight?.image || flight?.destinoImg || 'https://cdn.visitportugal.com/sites/default/files/styles/destinos_galeria/public/mediateca/N26021.jpg?itok=yJUnjR2p'}" alt="${flight?.arrival?.city || 'Destino'}">
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
                        <i class="fas fa-calendar"></i>
                        <span>${flight?.departure?.date ? new Date(flight.departure.date).toLocaleDateString('pt-PT') : ''} - ${flight?.arrival?.date ? new Date(flight.arrival.date).toLocaleDateString('pt-PT') : ''}</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-users"></i>
                        <span>${flight.people || 1} Passageiro(s)</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-plane"></i>
                        <span>${flight?.airline?.name || ''}</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-clock"></i>
                        <span>${flight.flightTime || ''}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="price">
                        <small>a partir de</small>
                        <span>${flight.price ? `${flight.price}€` : '--'}</span>
                    </div>
                    <button class="btn btn-primary">Comprar</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Evento para remover dos favourits
favoritesGrid.addEventListener('click', function (e) {
    const favBtn = e.target.closest('.favorite-btn');
    if (!favBtn) return;

    const card = favBtn.closest('.favorite-card');
    const flightId = card.getAttribute('data-flight-id');

    // Atualiza os favourits do utilizador
    const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === loggedUser?.id);

    if (userIndex === -1) return;

    // Remove o voo dos favourits
    users[userIndex].favourits = users[userIndex].favourits.filter(fav => fav.id != flightId);

    // Atualiza o localStorage e sessionStorage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedUser', JSON.stringify(users[userIndex]));

    // Mostra alerta de remoção
    alert('Voo removido dos favourits!');

    // Atualiza a lista de favourits no DOM
    renderFavorites();
});

// Renderiza os favourits ao carregar a página
renderFavorites();