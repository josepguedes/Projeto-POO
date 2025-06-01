let destinations = [];


// Carregar destinos do localStorage ou do JSON
export async function loadDestinations() {
    if (localStorage.getItem('destinations')) {
        destinations = JSON.parse(localStorage.getItem('destinations'));
    } else {
        try {
            const response = await fetch('/js/data/destinations.json');
            if (!response.ok) throw new Error('Arquivo de destinos não encontrado');
            const data = await response.json();
            destinations = data.destenys; // Note que usamos 'destenys' conforme seu JSON
            localStorage.setItem('destinations', JSON.stringify(destinations));
        } catch (error) {
            console.error('Erro ao carregar destinos:', error);
            destinations = [];
            localStorage.setItem('destinations', JSON.stringify(destinations));
        }
    }
    return destinations;
}

// Obter todos os destinos
export function getAllDestinations() {
    return destinations;
}

// Adicionar novo destino
export function addDestination(destination) {
    const newId = destinations.length > 0 ? Math.max(...destinations.map(d => d.id)) + 1 : 1;
    const newDestination = {
        id: newId,
        Destino: destination.Destino,
        Pais: destination.Pais, 
        TipoTurismo: destination.TipoTurismo,
        Descricao: destination.Descricao,
        ImagemDestino: destination.ImagemDestino,
        CodigoDestino: destination.CodigoDestino
    };

    destinations.push(newDestination);
    localStorage.setItem('destinations', JSON.stringify(destinations));
    return newDestination;
}

// Atualizar destino existente
export function updateDestination(id, updatedData) {
    const index = destinations.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Destino não encontrado');

    destinations[index] = {
        ...destinations[index],
        ...updatedData,
        id: id // Mantém o ID original
    };

    localStorage.setItem('destinations', JSON.stringify(destinations));
    return destinations[index];
}

// Remover destino
export function deleteDestination(id) {
    const index = destinations.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Destino não encontrado');

    destinations.splice(index, 1);
    localStorage.setItem('destinations', JSON.stringify(destinations));
}

// Buscar destino por ID
export function getDestinationById(id) {
    const destination = destinations.find(d => d.id === id);
    if (!destination) throw new Error('Destino não encontrado');
    return destination;
}

// Buscar destinos por país
export function getDestinationsByCountry(country) {
    return destinations.filter(d =>
        d.pais.toLowerCase().includes(country.toLowerCase())
    );
}

// Buscar destinos por tipo de turismo
export function getDestinationsByTourismType(tourismType) {
    if (!tourismType) {
        return getAllDestinations();
    }
    
    return destinations.filter(dest => 
        dest.TipoTurismo && 
        dest.TipoTurismo.toLowerCase() === tourismType.toLowerCase()
    );
}


export class Destination {
    constructor(id, nome, pais, tipoTurismo, descricao, imagem) {
        this.id = id;
        this.nome = nome;
        this.pais = pais;
        this.tipoTurismo = tipoTurismo;
        this.descricao = descricao;
        this.imagem = imagem;
    }
}