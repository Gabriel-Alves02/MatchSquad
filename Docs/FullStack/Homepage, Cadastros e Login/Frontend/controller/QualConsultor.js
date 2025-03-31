import { Agendar } from "../service/req_respManager.js";
import { getUserId } from './SysFx.js';

let idConsultor = null;

document.addEventListener("DOMContentLoaded", () => {
    const inputData = document.getElementById("data-agendamento");

    const hoje = new Date().toISOString().split("T")[0];

    inputData.min = hoje;


    const userId = getUserId(1);

    if (userId) {
        console.log("ID recuperado: ", userId);
    } else {
        console.log("Nenhum usuário logado.");
    }

});


const form = document.getElementById('consultores-grid');

form.addEventListener('click', (event) => {

    const card = event.target.closest('.card-body');
    idConsultor = card.getAttribute('data-value');

    if (card) {
        const nomeConsultor = card.querySelector('.card-title')?.innerText.trim();
        const idConsultor = card.getAttribute('data-value');
        abrirModalAgendamento(nomeConsultor);
    }
});


function abrirModalAgendamento(nome) {
    const modal = document.getElementById('modal-agendamento');
    const modalTitle = document.getElementById('modal-title');

    modalTitle.innerText = `Agendar com ${nome}`;
    modal.style.display = 'block';
}

function fecharModal() {
    document.getElementById('modal-agendamento').style.display = 'none';
}

function confirmarAgendamento() {

    const data = document.getElementById('data-agendamento').value;
    const periodo = document.getElementById('periodo').value;
    const infoAdiantada = document.getElementById('infoAdiantada').value;
    const radioSelecionado = document.querySelector('input[name="tipo"]:checked');

    if (!data) {
        alert('Por favor, escolha uma data!');
        return;
    }

    const PedidoAgendamento = {
        idConsultor: idConsultor,
        idCliente: getUserId(),
        infoAdiantada: infoAdiantada,
        data: data,
        status_situacao: "Pendente",
        tipo: radioSelecionado.value,
        periodo: periodo
    };

    console.log("Agendamento criado:\n\n", PedidoAgendamento);

    Agendar(PedidoAgendamento);

    fecharModal();
}


// function formatarData(data) {
//     const [ano, mes, dia] = data.split('-');
//     return `${dia}/${mes}/${ano}`;
// }

window.confirmarAgendamento = confirmarAgendamento;
window.fecharModal = fecharModal;