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

export async function agendadoNovamente(idCliente, idConsultor) {
    try {
        const response = await fetch(`http://localhost:8000/checks/${idCliente}/${idConsultor}`);
        const data = await response.json();
        
        if (response.status === 200 || response.status === 409 ) {
            return data.success;
        }else{
            throw new Error("Erro ao buscar cliente");
        }

    } catch (error) {
        console.error("Erro Interno:", error);
        return;
    }
}