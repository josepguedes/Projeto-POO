import { loadDestinations, getAllDestinations, addDestination, deleteDestination, updateDestination, getDestinationsByTourismType } from "../models/destinations.js";
import { getAllTypes, loadTypes } from "../models/type.js";

// Variáveis de paginação
let currentPage = 1;
const pageSize = 13;
let currentDestinations = [];

// Renderizar destinos com paginação
async function renderDestinations(page = 1, destinationsList = null) {
    try {
        await loadDestinations();
        const allDestinations = destinationsList || await getAllDestinations();
        currentDestinations = allDestinations;

        const destinationTable = document.getElementById('destinationsTable');
        if (!destinationTable) {
            console.error('Tabela de destinos não encontrada');
            return;
        }

        // Calcular paginação
        const totalPages = Math.ceil(allDestinations.length / pageSize);
        currentPage = Math.max(1, Math.min(page, totalPages || 1));
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const paginatedDestinations = allDestinations.slice(start, end);

        destinationTable.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Destino</th>
                <th>País</th>
                <th>Tipo de Turismo</th>
                <th>Descrição</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody></tbody>
        `;

        const tbody = destinationTable.querySelector('tbody');

        paginatedDestinations.forEach(desteny => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${desteny.id}</td>
                <td>${desteny.CodigoDestino}</td>
                <td>${desteny.Destino}</td>
                <td>${desteny.Pais}</td>
                <td>${desteny.TipoTurismo}</td>
                <td>${desteny.Descricao}</td>
                <td>
                    <button class="btn btn-warning edit-destination" data-id="${desteny.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger delete-destination" data-id="${desteny.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Adicionar paginação
        let paginationHtml = `
            <tfoot>
                <tr>
                    <td colspan="7" class="text-center">
                        <button id="prevPage" class="btn btn-secondary btn-sm" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
                        Página ${currentPage} de ${totalPages || 1}
                        <button id="nextPage" class="btn btn-secondary btn-sm" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}>Próxima</button>
                    </td>
                </tr>
            </tfoot>
        `;
        destinationTable.innerHTML += paginationHtml;

        // Eventos dos botões de paginação
        document.getElementById('prevPage').onclick = () => renderDestinations(currentPage - 1, currentDestinations);
        document.getElementById('nextPage').onclick = () => renderDestinations(currentPage + 1, currentDestinations);

    } catch (error) {
        console.error('Erro ao carregar destinos:', error);
        const destinationTable = document.getElementById('destinationsTable');
        if (destinationTable) {
            destinationTable.innerHTML = '<tr><td colspan="6">Erro ao carregar destinos</td></tr>';
        }
    }
}

// Popula o modal de adicionar com tipos dinâmicos
async function populateAddModal() {
    await loadTypes();
    const types = getAllTypes();
    const select = document.querySelector('#addDestinationModal select[name="TipoTurismo"]');
    if (select) {
        select.innerHTML = '<option value="">Selecione o tipo</option>';
        types.forEach(type => {
            select.innerHTML += `<option value="${type.Nome}">${type.Nome}</option>`;
        });
    }
}

// Popula o modal de editar com tipos dinâmicos
async function populateEditModal() {
    await loadTypes();
    const types = getAllTypes();
    const select = document.querySelector('#editDestinationModal select[name="editTipoTurismo"]');
    if (select) {
        select.innerHTML = '<option value="">Selecione o tipo</option>';
        types.forEach(type => {
            select.innerHTML += `<option value="${type.Nome}">${type.Nome}</option>`;
        });
    }
}

// Adicionar novo destino
document.addEventListener('DOMContentLoaded', async () => {
    await populateAddModal();
    await populateEditModal();
    
    const addForm = document.getElementById('addDestinationForm');

    addForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const newDestination = {
            CodigoDestino: formData.get('CodigoDestino'),
            Destino: formData.get('Destino'),
            Pais: formData.get('Pais'),
            TipoTurismo: formData.get('TipoTurismo'),
            Descricao: formData.get('Descricao'),
            ImagemDestino: formData.get('ImagemUrl')
        };

        try {
            await addDestination(newDestination);
            const modal = bootstrap.Modal.getInstance(document.getElementById('addDestinationModal'));
            modal.hide();
            event.target.reset();
            await renderDestinations(1);
            alert('Destino adicionado com sucesso!');
        } catch (error) {
            console.error('Erro ao adicionar destino:', error);
            alert('Erro ao adicionar destino: ' + error.message);
        }
    });

    // Initialize filter functionality
    const filterSelect = document.getElementById('tourismTypeFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', async (event) => {
            await filterDestinations(event.target.value);
        });
    }

    // Initial render
    renderDestinations();
});

// Eliminar destino
document.getElementById('destinationsTable').addEventListener('click', async (event) => {
    const deleteBtn = event.target.closest('.delete-destination');
    if (deleteBtn) {
        const destinationId = parseInt(deleteBtn.dataset.id);
        if (confirm('Tem certeza que deseja excluir este destino?')) {
            try {
                await deleteDestination(destinationId);
                await renderDestinations(currentPage);
                alert('Destino excluído com sucesso!');
            } catch (error) {
                console.error('Erro ao excluir destino:', error);
                alert('Erro ao excluir destino: ' + error.message);
            }
        }
    }
});

// Editar destino
document.getElementById('destinationsTable').addEventListener('click', async (event) => {
    const editBtn = event.target.closest('.edit-destination');
    if (editBtn) {
        const destinationId = parseInt(editBtn.dataset.id);
        const destinations = await getAllDestinations();
        const destination = destinations.find(dest => dest.id === destinationId);
        if (!destination) {
            alert('Destino não encontrado!');
            return;
        }

        await populateEditModal();

        document.querySelector('[name="editDestinationId"]').value = destination.id;
        document.querySelector('[name="editCodigoDestino"]').value = destination.CodigoDestino;
        document.querySelector('[name="editDestino"]').value = destination.Destino;
        document.querySelector('[name="editPais"]').value = destination.Pais;
        document.querySelector('[name="editTipoTurismo"]').value = destination.TipoTurismo;
        document.querySelector('[name="editDescricao"]').value = destination.Descricao;
        document.querySelector('[name="editImagemUrl"]').value = destination.ImagemDestino;

        const currentImagePreview = document.querySelector('#currentImagePreview');
        if (currentImagePreview) {
            currentImagePreview.src = destination.ImagemDestino || '';
            currentImagePreview.style.display = destination.ImagemDestino ? 'block' : 'none';
        }

        const editModal = new bootstrap.Modal(document.getElementById('editDestinationModal'));
        editModal.show();
    }
});

// Update destino
document.getElementById('editDestinationForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const destinationId = parseInt(formData.get('editDestinationId'));
    const updatedDestination = {
        id: destinationId,
        CodigoDestino: formData.get('editCodigoDestino'),
        Destino: formData.get('editDestino'),
        Pais: formData.get('editPais'),
        TipoTurismo: formData.get('editTipoTurismo'),
        Descricao: formData.get('editDescricao'),
        ImagemDestino: formData.get('editImagemUrl')
    };

    try {
        await updateDestination(destinationId, updatedDestination);
        const modal = bootstrap.Modal.getInstance(document.getElementById('editDestinationModal'));
        modal.hide();
        await renderDestinations(currentPage);
        alert('Destino atualizado com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar destino:', error);
        alert('Erro ao atualizar destino: ' + error.message);
    }
});

// Filtrar destinos com paginação
async function filterDestinations(tourismType) {
    try {
        const destinations = tourismType ? 
            await getDestinationsByTourismType(tourismType) : 
            await getAllDestinations();
        await renderDestinations(1, destinations);
    } catch (error) {
        console.error('Erro ao filtrar destinos:', error);
        alert('Erro ao filtrar destinos: ' + error.message);
    }
}

// Popula o filtro de tipos de turismo
async function populateTourismTypeFilter() {
    await loadTypes();
    const types = getAllTypes();
    const select = document.getElementById('tourismTypeFilter');
    if (!select) return;
    select.innerHTML = '<option value="">Todos os tipos de turismo</option>';
    types.forEach(type => {
        select.innerHTML += `<option value="${type.Nome}">${type.Nome}</option>`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderDestinations();
    populateTourismTypeFilter();
});