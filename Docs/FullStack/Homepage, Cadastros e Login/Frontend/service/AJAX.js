export async function buscarNomeCliente(idCliente) {
    try {
        const response = await fetch(`http://localhost:8000/checks/${idCliente}`);

        if (!response.ok) throw new Error("Erro ao buscar cliente");
        
        const data = await response.json();

        return data;

    } catch (error) {
        console.error("Erro ao buscar o nome do cliente:", error);
        return "Nome não encontrado";
    }
}