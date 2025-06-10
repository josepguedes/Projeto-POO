import { loadLogs, addLog } from '../models/logs.js'

const logsTable = document.getElementById('searchHistoryTable');

// Renderizar logs
async function renderLogs() {
    try {
        await loadLogs();
        const logs = JSON.parse(localStorage.getItem('logs')) || [];

        if (!logsTable) {
            console.error('Tabela de logs não encontrada');
            return;
        }

        logsTable.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Data/Hora</th>
                    <th>Utilizador</th>
                    <th>Origem</th>
                    <th>Destino</th>
                    <th>Data Ida</th>
                    <th>Data Volta</th>
                    <th>Passageiros</th>
                    <th>Tipo de Cultura</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = logsTable.querySelector('tbody');

        logs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${log.id}</td>
                <td>${log.dataHora}</td>
                <td>${log.Utilizador}</td>
                <td>${log.Origem}</td>
                <td>${log.Destino}</td>
                <td>${log.DataIda}</td>
                <td>${log.DataVolta}</td>
                <td>${log.passageiros}</td>
                <td>${log.tipoCultura}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao renderizar logs:', error);
    }
}



// Inicializar a renderização dos logs
document.addEventListener('DOMContentLoaded', () => {
    renderLogs();
});