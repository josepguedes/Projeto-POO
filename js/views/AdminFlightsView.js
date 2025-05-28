import { getAllFlights, loadFlights } from '../models/flights.js';

function formatDate(dateString) {
    if (!dateString) return 'Data não definida';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data inválida';
        
        return date.toLocaleString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Erro na data';
    }
}


async function renderFlightsTable() {
    try {
        await loadFlights();
        const flights = await getAllFlights();
        
        // Log para depuração - ver estrutura completa dos voos
        console.log('Flights loaded:', JSON.stringify(flights, null, 2));
        
        const flightTable = document.getElementById('flightsTable');
        if (!flightTable) {
            console.error('Could not find flights table');
            return;
        }

        // Clear existing table content
        flightTable.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Origem</th>
                    <th>Destino</th>
                    <th>Data Partida</th>
                    <th>Data Chegada</th>
                    <th>Companhia</th>
                    <th>Preço</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;

        const tbody = flightTable.querySelector('tbody');

        flights.forEach(flight => {
            if (!flight) return;
            
            // Log para depuração - ver datas específicas
            console.log('Flight dates:', {
                departureDate: flight.departure?.date,
                arrivalDate: flight.arrival?.date
            });
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${flight.id || ''}</td>
                <td>${flight.departure?.city || ''} (${flight.departure?.code || ''})</td>
                <td>${flight.arrival?.city || ''} (${flight.arrival?.code || ''})</td>
                <td>${formatDate(flight.departure?.date || null)}</td>
                <td>${formatDate(flight.arrival?.date || null)}</td>
                <td>${flight.airline?.name || ''}</td>
                <td>${flight.price || 0}€</td>
                <td><span class="badge bg-success">Ativo</span></td>
                <td>
                    <button class="btn btn-sm btn-warning" data-bs-toggle="modal"
                        data-bs-target="#editFlightModal" onclick="editFlight(${flight.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteFlight(${flight.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error rendering flights table:', error);
    }
}

// Initialize table when page loads - remover loadFlights() duplicado
document.addEventListener('DOMContentLoaded', async () => {
    await renderFlightsTable();
});