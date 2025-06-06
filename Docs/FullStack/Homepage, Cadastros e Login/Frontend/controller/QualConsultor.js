import { getUserId } from './SysFx.js';
import { Registrar, agendadoNovamente, carregarInfoPerfil, buscarHabilidades } from '../service/AJAX.js';

let flagHorario = -1;
let consultores = [];
const searchBar = document.getElementById('searchBar');
const filtroHabilidade = document.getElementById('filtroHabilidade');
const botaoPesquisa = document.getElementById('botaoPesquisa');
const container = document.getElementById('maingrid');


let idConsultor;

document.addEventListener("DOMContentLoaded", async function () {
    await carregarHabilidades();

    const inputData = document.getElementById("data-agendamento");
    const hoje = new Date().toISOString().split("T")[0];
    inputData.min = hoje;

    const userId = getUserId(1);
    if (userId) {
        console.log("ID recuperado: ", userId);
    } else {
        console.log("Nenhum usuário logado.");
    }

    // Horário
    const periodoSelect = document.getElementById('periodo');
    const horarioInput = document.getElementById('horario');

    configurarLimitesHorario('manha');

    periodoSelect.addEventListener('change', function (e) {
        const novoPeriodo = e.target.value;
        configurarLimitesHorario(novoPeriodo);
        validarHorario();
    });

    horarioInput.addEventListener('change', function () {
        validarHorario();
        flagHorario = 1;
    });

    function configurarLimitesHorario(periodo) {
        switch (periodo) {
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

        switch (periodo) {
            case 'manha':
                if (hora < 7 || hora >= 12) {
                    valido = false;
                    mensagemErro = 'Horário inválido para a manhã. Escolha entre 07:00 e 12:00.';
                }
                break;
            case 'tarde':
                if (hora < 12 || (hora >= 17 && minuto > 30)) {
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

    consultores = await carregarInfoPerfil('-1', '-1');

    console.log('resultado consultores: ', consultores);

    renderizarConsultores(consultores);
    verificarCamposFiltro();
    filtrarConsultores();
});

const form = document.getElementById('consultores-grid');
form.addEventListener('click', (event) => {
    if (event.target.closest('summary')) {
        return;
    }

    const card = event.target.closest('.card-body');

    if (card) {
        const nomeConsultor = card.querySelector('.card-title')?.innerText.trim();
        //localStorage.setItem("idConsultor", card.getAttribute('data-value'));
        idConsultor = card.getAttribute('data-value');

        console.log('idCon: ', idConsultor);

        window.open(`./Portifolio.html?id=${idConsultor}`, "_blank");

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
    document.getElementById('data-agendamento').value = '';
    document.getElementById('periodo').value = 'manha';
    document.getElementById('infoAdiantada').value = '';
    document.getElementById('horario').value = '';
    document.querySelector('input[name="tipo"][value="online"]').checked = true;
    document.getElementById('modal-agendamento').style.display = 'none';
}
/*
//Criação da url da reunião:
function gerarUrlReuniao() {
    const sufixoUrl = matchMedia.random().toString(36).substring(2, 10);
    sufixoUrl = "consultoria_" + sufixoUrl;

    // Essa é a base JaaS (8x8.vc + ID do projeto)
    const baseUrl = 'https://8x8.vc/vpaas-magic-cookie-6b44b110cace40f8a723c05a52aa3bc8/';

    const urlSala = baseUrl + sufixoUrl;   
    
    return urlSala;
}
*/
const modalForm = document.getElementById('modal-agendamento');
modalForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    let endHour = '';
    if (flagHorario === 1)
        endHour = document.getElementById('horario').value;
    else
        endHour = '00:00:00';

    const data = document.getElementById('data-agendamento').value;
    const periodo = document.getElementById('periodo').value;
    const infoAdiantada = document.getElementById('infoAdiantada').value;
    const radioSelecionado = document.querySelector('input[name="tipo"]:checked');
    const horario = endHour;
    //const urlReuniao = '';
    /*
    if (radioSelecionado == 'online') {
        urlReuniao = gerarUrlReuniao();
    }
    */
    if (!data) {
        alert('Por favor, escolha uma data!');
        return;
    }

    const repetido = await agendadoNovamente(getUserId(1), idConsultor);

    if (repetido) {
        alert("Você já tem um agendamento com esse consultor!");
        fecharModal();
        return;
    }

    const PedidoAgendamento = {
        idConsultor: idConsultor,
        idCliente: getUserId(1),
        infoAdiantada: infoAdiantada,
        data: data,
        status_situacao: "pendente",
        tipo: radioSelecionado.value,
        periodo: periodo,
        horario: horario //|| '00:00:00'
        //link: urlReuniao
    };

    Registrar(PedidoAgendamento);
    fecharModal();
});

async function carregarHabilidades() {
    const res = await buscarHabilidades();
    const select = document.getElementById('filtroHabilidade');
    const allOption = document.createElement('option');
    allOption.value = "";
    allOption.textContent = "Todas as habilidades";
    select.appendChild(allOption);
    res.habilidades.forEach(hab => {
        const opt = document.createElement('option');
        opt.value = hab.nomeHabilidade;
        opt.textContent = hab.nomeHabilidade;
        select.appendChild(opt);
    });
}

function renderizarConsultores(lista) {
    container.innerHTML = '';

    lista.forEach((consultor) => {
        const cardHTML = `
            <div class="col-md-4">
                <div class="card mb-4 shadow-sm">
                    <div class="card-body" data-value="${consultor.idConsultor}">
                        <img src="${consultor.urlImagemPerfil}" class="img-box" alt="">
                        <br><br>
                        <h5 class="card-title">${consultor.nome}</h5>
                        <details class="card-text">
                            <summary>${consultor.habilidades}</summary>
                            <span>${consultor.bio}</span>
                        </details>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function verificarCamposFiltro() {
    const textoBusca = searchBar.value.trim();
    const habilidadeSelecionada = filtroHabilidade.value;

    botaoPesquisa.disabled = textoBusca === '' && habilidadeSelecionada === '';
}

botaoPesquisa.addEventListener('click', () => {
    filtrarConsultores();
});

filtroHabilidade.addEventListener('change', () => {
    filtrarConsultores();
});

function filtrarConsultores() {
    const textoBusca = searchBar.value.trim().toLowerCase();
    const habilidadeSelecionada = filtroHabilidade.value;

    const resultadoFiltrado = consultores
        .filter(c => {
            const nomeMatch = c.nome.toLowerCase().includes(textoBusca);
            const habilidadeMatch = habilidadeSelecionada === '' || habilidadeSelecionada === 'Todas as habilidades' || c.habilidades.includes(habilidadeSelecionada);
            return nomeMatch && habilidadeMatch;
        })
        .sort((a, b) => a.nome.localeCompare(b.nome)); // ordenação alfabética por nome

    renderizarConsultores(resultadoFiltrado);
}


searchBar.addEventListener('input', verificarCamposFiltro);
filtroHabilidade.addEventListener('change', verificarCamposFiltro);
window.fecharModal = fecharModal;