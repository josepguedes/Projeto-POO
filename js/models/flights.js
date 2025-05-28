let flights = [];

// Load Flights from LocalStorage or from JSON file if not present
export async function loadFlights() {
    if (localStorage.getItem('flights')) {
        console.log('Carregando do localStorage');
        flights = JSON.parse(localStorage.getItem('flights'));
    } else {
        console.log('Tentando carregar do arquivo JSON');
        try {
            const response = await fetch('/js/data/flight.json');
            if (!response.ok) throw new Error('Ficheiro de voos não encontrado');
            const data = await response.json();
            console.log('Dados carregados:', data);
            
            // Transform the data to include departure and arrival dates
            flights = data.flights.map(flight => ({
                ...flight,
                departureDate: new Date().toISOString(), // You should set actual dates here
                arrivalDate: new Date(new Date().getTime() + 2*60*60*1000).toISOString() // Example: 2 hours later
            }));
            
            localStorage.setItem('flights', JSON.stringify(flights));
        } catch (error) {
            console.error('Erro ao carregar voos:', error);
            flights = [/* ... your default flights ... */];
            localStorage.setItem('flights', JSON.stringify(flights));
        }
    }
    return flights;
}

// Add Flight
export function addFlight(flightData) {
    try {
        const newFlight = new Flight(flightData);
        newFlight.id = getNextFlightId();
        flights.push(newFlight);
        localStorage.setItem('flights', JSON.stringify(flights));
        return newFlight;
    } catch (error) {
        console.error("Erro ao adicionar voo:", error.message);
        throw error;
    }
}

// Remove Flight
export function removeFlight(id) {
    try {
        const idx = flights.findIndex(f => f.id === id);
        if (idx !== -1) {
            flights.splice(idx, 1);
            localStorage.setItem('flights', JSON.stringify(flights));
        } else {
            throw new Error('Voo não encontrado!');
        }
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

// Update Flight
export function updateFlight(id, updatedData) {
    try {
        const idx = flights.findIndex(f => f.id === id);
        if (idx !== -1) {
            flights[idx] = { ...flights[idx], ...updatedData, id }; // keep id unchanged
            localStorage.setItem('flights', JSON.stringify(flights));
        } else {
            throw new Error('Voo não encontrado!');
        }
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

// Get all Flights
export function getAllFlights() {
    return flights;
}

// Get next Flight ID
export function getNextFlightId() {
    if (flights.length === 0) return 1;
    return Math.max(...flights.map(f => Number(f.id))) + 1;
}

// Flight Model
export class Flight {
    constructor({
        id,
        image,
        departure,
        arrival,
        return: returnFlight,
        price,
        people,
        flightTime,
        direct,
        layover,
        airline
    }) {
        this.id = id || getNextFlightId();
        this.image = image || '';
        this.departure = departure || {};
        this.arrival = arrival || {};
        this.return = returnFlight || {};
        this.price = price || 0;
        this.people = people || 1;
        this.flightTime = flightTime || '';
        this.direct = direct || false;
        this.layover = layover || false;
        this.airline = airline || {};
    }
}