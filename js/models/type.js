let types = [];

// Carregar tipos do localStorage ou do JSON
export async function loadTypes() {
    if (localStorage.getItem('types')) {
        types = JSON.parse(localStorage.getItem('types'));
    } else {
        try {
            const response = await fetch('../js/data/type.json');
            if (!response.ok) throw new Error('Arquivo de tipos não encontrado');
            const data = await response.json();
            types = data.types;
            localStorage.setItem('types', JSON.stringify(types));
        } catch (error) {
            console.error('Erro ao carregar tipos:', error);
            types = [];
            localStorage.setItem('types', JSON.stringify(types));
        }
    }
    return types;
}

export function getAllTypes() {
    return types;
}

export function addType(newType) {
    const newId = types.length > 0 ? Math.max(...types.map(t => t.id)) + 1 : 1;
    const typeToAdd = new Type(newId, newType.Nome, newType.Descrição);

    types.push(typeToAdd);
    localStorage.setItem('types', JSON.stringify(types));
    return typeToAdd;
}

export function deleteType(id) {
    const index = types.findIndex(t => t.id === parseInt(id));
    if (index === -1) throw new Error('Tipo não encontrado');

    const deletedType = types.splice(index, 1)[0];
    localStorage.setItem('types', JSON.stringify(types));
    return deletedType;
}

class Type {
    constructor(id, Nome, Descrição) {
        this.id = id;
        this.Nome = Nome;
        this.Descrição = Descrição;
    }
}