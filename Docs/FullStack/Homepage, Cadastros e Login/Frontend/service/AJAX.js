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

export async function enviarRemarcacao (info) {
    try {

        const response = await fetch('http://localhost:8000/notifications', {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(info)
        }).then((response) => {
            if (response.status >= 200 && response.status < 300) {
                alert("Sua mudança no agendamento já foi notificada para o cliente. Enviado por e-mail para que ele fique ciente!");
            }       
            else {
                console.log(`Erro do servidor: ${response.status}`);
            }
        })

    } catch (error) {
        console.error("Erro no envio de remarcação:", error);
    }
}
