import { loadTypes, deleteType, getAllTypes, addType } from '../models/type.js'

// Variáveis de paginação
let currentPage = 1;
const pageSize = 13;
let currentTypes = [];

// Renderizar tipos com paginação
async function renderTypes(page = 1, typesList = null) {
    try {
        await loadTypes();
        const allTypes = typesList || getAllTypes();
        currentTypes = allTypes;

        const typesTable = document.getElementById('typesTable');
        if (!typesTable) {
            console.error('Tabela de tipos não encontrada');
            return;
        }

        // Calcular paginação
        const totalPages = Math.ceil(allTypes.length / pageSize);
        currentPage = Math.max(1, Math.min(page, totalPages || 1));
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const paginatedTypes = allTypes.slice(start, end);

        typesTable.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            ${paginatedTypes.map(type => `
                <tr>
                    <td>${type.id}</td>
                    <td>${type.Nome}</td>
                    <td>${type.Descrição}</td>
                    <td>
                        <button class="btn btn-danger delete-destination">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
        `;

        // Adiciona paginação
        let paginationHtml = `
            <tfoot>
                <tr>
                    <td colspan="4" class="text-center">
                        <button id="prevPage" class="btn btn-secondary btn-sm" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
                        Página ${currentPage} de ${totalPages || 1}
                        <button id="nextPage" class="btn btn-secondary btn-sm" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}>Próxima</button>
                    </td>
                </tr>
            </tfoot>
        `;
        typesTable.innerHTML += paginationHtml;

        // Eventos dos botões de paginação
        document.getElementById('prevPage').onclick = () => renderTypes(currentPage - 1, currentTypes);
        document.getElementById('nextPage').onclick = () => renderTypes(currentPage + 1, currentTypes);

        // Adiciona event listeners aos botões de eliminar
        typesTable.querySelectorAll('.delete-destination').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const row = btn.closest('tr');
                const id = row.querySelector('td').textContent;
                const confirmDelete = confirm('Tem a certeza que deseja eliminar este tipo?');
                if (confirmDelete) {
                    await deleteType(id);
                    renderTypes(currentPage);
                }
            });
        });
    } catch (error) {
        console.error('Erro ao renderizar tipos:', error);
    }
}

// Adcionar novo tipo
// Adcionar novo tipo
document.getElementById('addTourismTypeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const Nome = document.getElementById('newtypeName').value.trim();
    const Descrição = document.getElementById('newtypeDescription').value.trim();

    if (!Nome || !Descrição) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        await loadTypes();
        const newType = { Nome, Descrição }; // Alterado para corresponder ao formato do JSON
        await addType(newType);
        document.getElementById('addTourismTypeForm').reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTourismTypeModal'));
        modal.hide();
        renderTypes(currentPage);
        alert('Tipologia adicionada com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar tipo:', error);
        alert('Erro ao adicionar tipo: ' + error.message);
    }
});


// Inicializa a renderização dos tipos
document.addEventListener('DOMContentLoaded', () => {
    renderTypes();
});