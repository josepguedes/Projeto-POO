let logs = [];

// Exemplos de logs iniciais
const defaultLogs = [
    {
        id: 1,
        dataHora: "2024-03-15 10:30",
        Utilizador: "João Silva",
        Origem: "Porto",
        Destino: "Paris",
        DataIda: "2024-07-15",
        DataVolta: "2024-07-22",
        passageiros: 2,
        tipoCultura: "Cultural"
    }
];

//Load logs from localStorage
export function loadLogs() {
    const storedLogs = localStorage.getItem('logs');
    if (storedLogs) {
        logs = JSON.parse(storedLogs);
    } else {
        logs = defaultLogs;
        localStorage.setItem('logs', JSON.stringify(logs));
    }
    return logs;
}

// Get all logs
export function getAllLogs() {
    return logs;
}

// Add new log
export function addLog(log) {
    const newId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    const newLog = {
        id: newId,
        dataHora: new Date().toLocaleString('pt-PT'),
        ...log
    };
    
    logs.push(newLog);
    localStorage.setItem('logs', JSON.stringify(logs));
    return newLog;
}



class Log {
    constructor(id, dataHora, Utilizador, Origem, Destino, DataIda, DataVolta, passageiros, tipoCultura) {
        this.id = id;
        this.dataHora = dataHora;
        this.Utilizador = Utilizador;
        this.Origem = Origem;
        this.Destino = Destino;
        this.DataIda = DataIda;
        this.DataVolta = DataVolta;
        this.passageiros = passageiros;
        this.tipoCultura = tipoCultura;
    }
}