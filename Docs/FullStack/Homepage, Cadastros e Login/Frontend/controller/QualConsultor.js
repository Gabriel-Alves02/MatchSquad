import { Registrar } from "../service/req_respManager.js";
import { getUserId } from './SysFx.js';
import { agendadoNovamente } from '../service/AJAX.js';

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

    if (event.target.closest('summary')) {
        return;
    }

    const card = event.target.closest('.card-body');

    if (card) {
        const nomeConsultor = card.querySelector('.card-title')?.innerText.trim();
        idConsultor = card.getAttribute('data-value');
        abrirModalAgendamento(nomeConsultor);
    }
});


function abrirModalAgendamento(nome) {

    const modal = document.getElementById('modal-agendamento');
    const modalTitle = document.getElementById('modal-title');

    modalTitle.innerText = `Agendar com ${nome}`;
    modal.style.display = 'block';

    document.getElementById('data-agendamento').value = '';
    document.getElementById('periodo').value = 'manha';
    document.getElementById('infoAdiantada').value = '';
    document.querySelector('input[name="tipo"][value="online"]').checked = true;

    modal.addEventListener('click', (event) => {
        if (event.target.classList.contains('close')) {
            fecharModal();
        }
    });
}

function fecharModal() {
    document.getElementById('modal-agendamento').style.display = 'none';
}

const modalForm = document.getElementById('modal-agendamento');

modalForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const data = document.getElementById('data-agendamento').value;
    const periodo = document.getElementById('periodo').value;
    const infoAdiantada = document.getElementById('infoAdiantada').value;
    const radioSelecionado = document.querySelector('input[name="tipo"]:checked');

    if (!data) {
        alert('Por favor, escolha uma data!');
        return;
    }

    const repetido = await agendadoNovamente(getUserId(1), idConsultor);

    if (repetido) {
        alert("Você já tem um agendamento com esse consultor!");
        return;        
    }

    const PedidoAgendamento = {
        idConsultor: idConsultor,
        idCliente: getUserId(1),
        infoAdiantada: infoAdiantada,
        data: data,
        status_situacao: "Pendente",
        tipo: radioSelecionado.value,
        periodo: periodo
    };

    console.log("Agendamento criado:\n\n", PedidoAgendamento || null);
    Registrar(PedidoAgendamento);
    fecharModal();
});

// function formatarData(data) {
//     const [ano, mes, dia] = data.split('-');
//     return `${dia}/${mes}/${ano}`;
// }

window.fecharModal = fecharModal;