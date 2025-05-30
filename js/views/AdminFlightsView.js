import { getAllFlights, loadFlights, addFlight, updateFlight, removeFlight } from '../models/flights.js';
import { getAllDestinations, loadDestinations } from '../models/destinations.js';

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

async function populateDestinationDropdowns() {
    try {
        await loadDestinations();
        const destinations = await getAllDestinations();
        const options = destinations.map(dest =>
            `<option value="${dest.CodigoDestino}" data-city="${dest.Destino}">${dest.Destino} (${dest.CodigoDestino})</option>`
        ).join('');

        document.querySelectorAll('.destination-select').forEach(select => {
            select.innerHTML = `
                <option value="">Selecione um destino</option>
                ${options}
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar destinos:', error);
    }
}

async function renderFlightsTable() {
    try {
        await loadFlights();
        const flights = await getAllFlights();
        await populateDestinationDropdowns();

        const flightTable = document.getElementById('flightsTable');

        if (!flightTable) {
            console.error('Could not find flights table');
            return;
        }

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
                    <button class="btn btn-sm btn-warning edit-flight" 
                        data-bs-toggle="modal"
                        data-bs-target="#editFlightModal" 
                        data-flight-id="${flight.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-flight" data-flight-id="${flight.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add delete event listeners
        document.querySelectorAll('.delete-flight').forEach(button => {
            button.addEventListener('click', async function () {
                const flightId = parseInt(this.dataset.flightId);
                if (confirm('Tem certeza que deseja excluir este voo?')) {
                    try {
                        await removeFlight(flightId);
                        await renderFlightsTable();
                        alert('Voo excluído com sucesso!');
                    } catch (error) {
                        alert('Erro ao excluir voo: ' + error.message);
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error rendering flights table:', error);
    }
}

function handleDestinationSelect(event) {
    const select = event.target;
    const selectedOption = select.options[select.selectedIndex];
    const prefix = select.name.split('.')[0]; // 'departure' or 'arrival'
    const form = select.closest('form');

    if (form && selectedOption) {
        form.querySelector(`input[name="${prefix}.city"]`).value = selectedOption.dataset.city || '';
        form.querySelector(`input[name="${prefix}.code"]`).value = selectedOption.value || '';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const addFlightForm = document.getElementById('addFlightForm');
    const editFlightForm = document.getElementById('editFlightForm');

    // Initialize table and dropdowns
    await renderFlightsTable();

    // Add destination select event listeners
    document.querySelectorAll('.destination-select').forEach(select => {
        select.addEventListener('change', handleDestinationSelect);
    });

    // Handle Add Flight Form
    if (addFlightForm) {
        addFlightForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addFlightForm);

            const flightData = {
                image: formData.get('image'),
                departure: {
                    city: formData.get('departure.city'),
                    code: formData.get('departure.code'),
                    date: formData.get('departure.date')
                },
                arrival: {
                    city: formData.get('arrival.city'),
                    code: formData.get('arrival.code'),
                    date: formData.get('arrival.date')
                },
                airline: {
                    name: formData.get('airline.name'),
                    logo: formData.get('airline.logo')
                },
                price: parseFloat(formData.get('price')),
                people: parseInt(formData.get('people')),
                flightTime: formData.get('flightTime'),
                direct: !!formData.get('direct'),
                layover: !!formData.get('layover')
            };

            try {
                await addFlight(flightData);
                const modal = bootstrap.Modal.getInstance(document.getElementById('addFlightModal'));
                modal.hide();
                addFlightForm.reset();
                await renderFlightsTable();
                alert('Voo adicionado com sucesso!');
            } catch (error) {
                alert('Erro ao adicionar voo: ' + error.message);
            }
        });
    }

    // Handle Edit Flight Form
    if (editFlightForm) {
        editFlightForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(editFlightForm);

            const updatedData = {
                id: parseInt(formData.get('id')),
                image: formData.get('image'),
                departure: {
                    city: formData.get('departure.city'),
                    code: formData.get('departure.code'),
                    date: formData.get('departure.date')
                },
                arrival: {
                    city: formData.get('arrival.city'),
                    code: formData.get('arrival.code'),
                    date: formData.get('arrival.date')
                },
                airline: {
                    name: formData.get('airline.name'),
                    logo: formData.get('airline.logo')
                },
                price: parseFloat(formData.get('price')),
                people: parseInt(formData.get('people')),
                flightTime: formData.get('flightTime'),
                direct: !!formData.get('direct'),
                layover: !!formData.get('layover')
            };

            try {
                await updateFlight(updatedData.id, updatedData);
                const modal = bootstrap.Modal.getInstance(document.getElementById('editFlightModal'));
                modal.hide();
                editFlightForm.reset();
                await renderFlightsTable();
                alert('Voo atualizado com sucesso!');
            } catch (error) {
                alert('Erro ao atualizar voo: ' + error.message);
            }
        });
    }

    // Handle Edit Button Clicks
    document.body.addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-flight');
        if (editButton) {
            const flightId = parseInt(editButton.dataset.flightId);
            editFlight(flightId);
        }
    });
});

async function editFlight(id) {
    const flights = await getAllFlights();
    const flight = flights.find(f => f.id === id);
    ;
    if (!flight) {
        console.error('Voo não encontrado:', id);
        return;
    }

    const editFlightForm = document.getElementById('editFlightForm');
    if (!editFlightForm) {
        console.error('Edit flight form not found');
        return;
    }

    // Remove existing hidden ID input if it exists
    const existingIdInput = editFlightForm.querySelector('input[name="id"]');
    if (existingIdInput) {
        existingIdInput.remove();
    }

    // Add hidden input for ID
    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.name = 'id';
    idInput.value = flight.id;
    editFlightForm.appendChild(idInput);

    // Set form values
    const setFormValue = (name, value) => {
        const field = editFlightForm.querySelector(`[name="${name}"]`);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = !!value;
            } else {
                field.value = value || '';
            }
        }
    };

    // Populate form fields
    setFormValue('image', flight.image);
    setFormValue('departure.select', flight.departure?.code);
    setFormValue('departure.city', flight.departure?.city);
    setFormValue('departure.code', flight.departure?.code);
    setFormValue('departure.date', flight.departure?.date);
    setFormValue('arrival.select', flight.arrival?.code);
    setFormValue('arrival.city', flight.arrival?.city);
    setFormValue('arrival.code', flight.arrival?.code);
    setFormValue('arrival.date', flight.arrival?.date);
    setFormValue('airline.name', flight.airline?.name);
    setFormValue('airline.logo', flight.airline?.logo);
    setFormValue('price', flight.price);
    setFormValue('people', flight.people);
    setFormValue('flightTime', flight.flightTime);
    setFormValue('direct', flight.direct);
    setFormValue('layover', flight.layover);
}