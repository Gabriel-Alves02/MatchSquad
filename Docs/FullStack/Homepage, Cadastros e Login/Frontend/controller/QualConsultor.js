import { getUserId } from './SysFx.js';
import { Registrar, agendadoNovamente } from '../service/AJAX.js';

let idConsultor = null;
const periodoSelect = document.getElementById("periodo");

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


    //Horario

    const periodoSelect = document.getElementById('periodo');
    const horarioInput = document.getElementById('horario');

    configurarLimitesHorario('manha');

    periodoSelect.addEventListener('change', function(e) {
        const novoPeriodo = e.target.value;
        configurarLimitesHorario(novoPeriodo);
        validarHorario();
    });

    horarioInput.addEventListener('change', function() {
        validarHorario();
    });

    function configurarLimitesHorario(periodo) 
	{
        switch(periodo) {
            case 'manha':
                horarioInput.min = '07:00';
                horarioInput.max = '12:00';
                break;
            case 'tarde':
                horarioInput.min = '12:00';
                horarioInput.max = '18:00';
                break;
        }

        const horarioAtual = horarioInput.value;
        if (horarioAtual && (!horarioInput.min || !horarioInput.max)) {
            horarioInput.value = '';
        }
    }

    function validarHorario() {
        const horario = horarioInput.value;
        const periodo = periodoSelect.value;


        if (!horario) {
            return true;
        }

        const [hora, minuto] = horario.split(':').map(Number);
        
        let valido = true;
        let mensagemErro = '';

        switch(periodo) {
            case 'manha':
                if (hora < 7 || hora >= 12) {
                    valido = false;
                    mensagemErro = 'Horário inválido para a manhã. Escolha entre 07:00 e 12:00.';
                }
                break;
            case 'tarde':
                if (hora < 12 || (hora >= 17 && minuto > 30) ) {
                    valido = false;
                    mensagemErro = 'Horário inválido para a tarde. Escolha entre 12:00 e 17:30.';
                }
                break;
        }

        if (!valido) {
            alert('Horarios menores que 7h ou após as 17h30 não podem ser agendados!');
            horarioInput.value = '';
        }

        return valido;
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
        localStorage.setItem("idConsultor", card.getAttribute('data-value'));
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
    const horario = document.getElementById('horario').value;
    

    if (!data) {
        alert('Por favor, escolha uma data!');
        return;
    }

    const repetido = await agendadoNovamente(getUserId(1), getUserId(0));

    if (repetido) {
        alert("Você já tem um agendamento com esse consultor!");
        return;
    }

    const PedidoAgendamento = {
        idConsultor: getUserId(0),
        idCliente: getUserId(1),
        infoAdiantada: infoAdiantada,
        data: data,
        status_situacao: "pendente",
        tipo: radioSelecionado.value,
        periodo: periodo,
        horario: horario || '12:00:00'
    };

    console.log("Agendamento criado:\n\n", PedidoAgendamento || null);
    Registrar(PedidoAgendamento);
    fecharModal();
});


window.fecharModal = fecharModal;

