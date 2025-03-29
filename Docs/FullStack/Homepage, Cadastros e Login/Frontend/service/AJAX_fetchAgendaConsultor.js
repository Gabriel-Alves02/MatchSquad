export async function buscarAgendamentos(idConsultor) {
    try {
        const response = await fetch(`/agendamentos/${idConsultor}`);
        if (!response.ok) throw new Error("Erro ao buscar agendamentos");
        
        const data = await response.json();
        return data; // Retorna os dados para o frontend usar
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}
