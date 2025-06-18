import { getDestinationsByTourismType, loadDestinations } from '../models/destinations.js';

function getTopTourismType(scores) {
    if (!scores || Object.keys(scores).length === 0) {
        return null;
    }
    // Ordena os resultados para encontrar o tipo com a maior pontuação
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sortedScores[0][0];
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
        const destinations = await getDestinationsByTourismType(topType);

        if (!destinations || destinations.length === 0) {
            recommendedContainer.innerHTML = `
                <h2 class="text-center mb-4">Destinos Recomendados para Si</h2>
                <p class="text-center">De momento, não temos destinos que correspondam ao seu perfil de <strong>${topType}</strong>.</p>
            `;
            return;
        }

        const destinationCards = destinations.map(dest => `
            <div class="destination-card">
                <div class="card h-100">
                    <img src="${dest.ImagemDestino ? `../img/destinations/${dest.ImagemDestino}` : '../img/default_destination.jpg'}" class="card-img-top" alt="${dest.Destino}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${dest.Destino}</h5>
                        <p class="card-text text-muted small flex-grow-1">${dest.Descricao ? dest.Descricao.substring(0, 80) + '...' : 'Sem descrição disponível.'}</p>
                        <button class="btn btn-primary mt-auto" onclick='setFlightSearchFromQuiz(${JSON.stringify(dest).replace(/'/g, "&apos;")})'>Ver Ofertas</button>
                    </div>
                </div>
            </div>
        `).join('');

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

    // Procura o destino "Porto" no array de destinos para obter o ID correto
    fetch('/js/data/destinations.json')
        .then(response => response.json())
        .then(data => {
            const destinos = data.destenys;
            const portoDestino = destinos.find(d => d.Destino === "Porto" || d.CodigoDestino === "OPO");
            const destinoSelecionado = destinos.find(d => d.id === dest.id);
            
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
            // Fallback sem verificação
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