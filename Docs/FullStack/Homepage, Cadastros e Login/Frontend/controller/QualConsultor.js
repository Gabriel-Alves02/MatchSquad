import { Cadastrar } from "../service/req_respManager.js";


document.addEventListener("DOMContentLoaded", () => {
    const inputData = document.getElementById("data-agendamento");
    
    const hoje = new Date().toISOString().split("T")[0];

    inputData.min = hoje;
});


const form = document.getElementById('consultores-grid');

form.addEventListener('click', (event) => {

    const card = event.target.closest('.card-body');

    if (card) {
        const nomeConsultor = card.querySelector('.card-title')?.innerText.trim();
    
        abrirModalAgendamento(nomeConsultor);
    }
});


function abrirModalAgendamento(nome) {
    const modal = document.getElementById('modal-agendamento');
    const modalTitle = document.getElementById('modal-title');

    modalTitle.innerText = `Agendar com ${nome}`;
    modal.style.display = 'block'; // Exibe o modal
}

function fecharModal() {
    document.getElementById('modal-agendamento').style.display = 'none';
}

function confirmarAgendamento() {
    
    const nomeConsultor = document.getElementById('modal-title').innerText.replace('Agendar com ', '');
    const data = document.getElementById('data-agendamento').value;
    const periodo = document.getElementById('periodo').value;

    if (!data) {
        alert('Por favor, escolha uma data!');
        return;
    }

    const PedidoAgendamento = {
        consultor: nomeConsultor,
        data: formatarData(data),
        periodo: periodo
    };

    console.log("Agendamento criado:", PedidoAgendamento);
    //REQUISITAR(PedidoAgendamento);

    fecharModal();
}


function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

window.confirmarAgendamento = confirmarAgendamento;
window.fecharModal = fecharModal;