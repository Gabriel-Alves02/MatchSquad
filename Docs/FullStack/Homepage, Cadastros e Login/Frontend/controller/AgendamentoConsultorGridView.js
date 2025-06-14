import { carregarMatchsConsultor, agendamentoCancelado, confirmarReuniao, concluirReuniao, denunciar, checkDenuncia, registrarReuniao } from '../service/AJAX.js';
import { getUserId } from '../controller/SysFx.js';

const searchBar = document.getElementById('searchBar');
const filtro = document.getElementById('filtros');
const grid = document.getElementById('listaMatchs');
let allConsultorias = [];
let displayedConsultorias = [];
let consultoriasMap = new Map();

let modalRelatorioInstance = null;
let modalDenunciaInstance = null;

document.addEventListener('DOMContentLoaded', async function () {

    modalRelatorioInstance = new bootstrap.Modal(document.getElementById('modalRelatorio'));
    modalDenunciaInstance = new bootstrap.Modal(document.getElementById('modalDenuncia'));

    const formRegistroReuniao = document.getElementById('formRegistroReuniao');
    const formDenuncia = document.getElementById('formDenuncia');

    const fetchedConsultorias = await carregarMatchsConsultor(getUserId(0));

    if ((fetchedConsultorias.reuniao).length === 0) {
        document.getElementById('listaMatchs').innerHTML = `
            <div style="text-align: center; margin: 20rem 1rem;">
                <h2 style="color: #000;">Sem consultorias em seu histórico.</h2>
            </div>
        `;
        return;
    }

    allConsultorias = fetchedConsultorias.reuniao;
    displayedConsultorias = [...allConsultorias];

    renderizarConsultorias(displayedConsultorias);

    searchBar.addEventListener('input', aplicarFiltros);
    filtro.addEventListener('change', aplicarFiltros);

    if (formDenuncia) {
        formDenuncia.addEventListener('submit', async function (event) {
            event.preventDefault();

            const gravidade = document.getElementById('gravidade').value;
            const comentario = document.getElementById('comentarioDenuncia').value;

            if (!gravidade) {
                alert("Por favor, selecione uma gravidade a sua denúncia.");
                return;
            }

            const idReuniaoAtual = formDenuncia.getAttribute('data-id-reuniao');
            if (!idReuniaoAtual) {
                console.error("ID da reunião não encontrado para denuncia.");
                return;
            }

            const consultoriaAtual = allConsultorias.find(c => c.idReuniao.toString() === idReuniaoAtual);
            let dataReuniaoDenunciada = null;

            if (consultoriaAtual && consultoriaAtual.data) {
                dataReuniaoDenunciada = consultoriaAtual.data.substring(0, 10);
            } else {
                console.warn("Data da reunião não encontrada para a denúncia.");
            }

            const dadosDenuncia = {
                idReuniao: idReuniaoAtual,
                gravidade: parseInt(gravidade),
                comentario: comentario.trim(),
                dataReuniao: dataReuniaoDenunciada
            };

            try {
                await denunciar(getUserId(0), '0', dadosDenuncia);
                modalDenunciaInstance.hide();
                window.location.reload();
            } catch (error) {
                console.error('Erro ao enviar denúncia:', error);
                alert('Erro ao enviar denúncia. Tente novamente mais tarde.');
            }
        });
    }

    if (formRegistroReuniao) {
        formRegistroReuniao.addEventListener('submit', async function (event) {
            event.preventDefault();

            const assunto = document.getElementById('assunto').value;
            const solucoes = document.getElementById('solucoes').value;
            const infoSolicitada = document.getElementById('infoSolicitada').value;

            const idReuniaoAtual = formRegistroReuniao.getAttribute('data-id-reuniao');

            if (!idReuniaoAtual) {
                console.error("ID da reunião não encontrado para registro.");
                return;
            }

            const dadosRegistro = {
                idReuniao: idReuniaoAtual,
                assunto: assunto.trim(),
                solucoes: solucoes.trim(),
                infoSolicitada: infoSolicitada.trim()
            };

            if (!dadosRegistro.idReuniao || !dadosRegistro.assunto || !dadosRegistro.solucoes || !dadosRegistro.infoSolicitada) {
                alert("Por favor, preencha todos os campos obrigatórios.");
                return;
            }

            try {
                await registrarReuniao(dadosRegistro);
                await concluirReuniao(idReuniaoAtual);
                modalRelatorioInstance.hide();
                window.location.reload();
            } catch (error) {
                console.error('Erro ao registrar a reunião:', error);
                alert('Erro ao registrar a reunião. Tente novamente mais tarde.');
            }
        });
    }
});


function preencherestrelas(value) {
    if (typeof value === 'number' && isFinite(value)) {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= value) {
                starsHtml += `<i class="fas fa-star" style="color: #FFC83D;"></i>`;
            } else {
                starsHtml += `<i class="far fa-star" style="color: #FFC83D;"></i>`;
            }
        }
        return starsHtml;
    }
    return '-';
}

function formatarData(isoDate) {
    const data = new Date(isoDate);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function capitalize(str) {
    if (typeof str !== 'string' || !str.length) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

let currentConsultoriaId = null;

document.addEventListener('click', async function (event) {
    if (event.target.matches('button[data-action]')) {
        const consultoriaItem = event.target.closest('.historic-card-consultoria');
        if (consultoriaItem) {
            const id = consultoriaItem.getAttribute('data-id');
            currentConsultoriaId = id;

            const action = event.target.getAttribute('data-action');
            const consultoria = allConsultorias.find(c => c.idReuniao.toString() === id);

            if (!consultoria) {
                console.error('Consultoria não encontrada para o ID:', id);
                return;
            }

            switch (action) {
                case 'relatorio':
                case 'registrar':
                    abrirModalRelatorio(consultoria.assunto, consultoria.solucoes, consultoria.infoSolicitada, id, consultoria.status_situacao);
                    break;
                case 'denunciar':
                    const formDenuncia = document.getElementById('formDenuncia');
                    if (formDenuncia) {
                        formDenuncia.setAttribute('data-id-reuniao', id);
                    }
                    modalDenuncia();
                    break;
                case 'cancelar':
                    let resp = confirm(`Deseja cancelar mesmo este agendamento?`);
                    if (resp) {
                        await agendamentoCancelado(currentConsultoriaId);
                        alert("Agendamento cancelado com sucesso!");
                        window.location.reload();
                    }
                    break;
                case 'confirmar':
                    let result = confirm(`Deseja confirmar mesmo este agendamento?`);
                    if (result) {
                        await confirmarReuniao(currentConsultoriaId);
                        alert("Agendamento confirmado com sucesso!");
                        window.location.reload();
                    }
            }
        }
    }
});


function abrirModalRelatorio(assunto, solucoes, infoSolicitada, idReuniao, statusReuniao) {
    const assuntoField = document.getElementById('assunto');
    const solucoesField = document.getElementById('solucoes');
    const infoSolicitadaField = document.getElementById('infoSolicitada');
    const enviarRegistroBtn = document.getElementById('enviarRegistro');
    const modalTitle = document.getElementById('modalRelatorioLabel');
    const formRegistroReuniao = document.getElementById('formRegistroReuniao');

    assuntoField.value = '';
    solucoesField.value = '';
    infoSolicitadaField.value = '';

    formRegistroReuniao.setAttribute('data-id-reuniao', idReuniao);

    if (assunto && solucoes && infoSolicitada) {
        assuntoField.value = assunto;
        solucoesField.value = solucoes;
        infoSolicitadaField.value = infoSolicitada;
        assuntoField.readOnly = true;
        solucoesField.readOnly = true;
        infoSolicitadaField.readOnly = true;
        enviarRegistroBtn.style.display = 'none';
        modalTitle.textContent = 'Relatório da Consultoria';
    } else {
        assuntoField.readOnly = false;
        solucoesField.readOnly = false;
        infoSolicitadaField.readOnly = false;
        enviarRegistroBtn.style.display = 'block';
        enviarRegistroBtn.textContent = 'Registrar Reunião';
        modalTitle.textContent = 'Registrar Reunião';
    }

    modalRelatorioInstance.show();
}


function modalDenuncia() {
    document.getElementById('gravidade').value = '';
    document.getElementById('comentarioDenuncia').value = '';
    modalDenunciaInstance.show();
}

async function detectDenuncia(idConsultor, tipoUsuario, idCliente) {
    const response = await checkDenuncia(idConsultor, tipoUsuario, idCliente);
    return response === true;
}

async function renderizarConsultorias(listaDeConsultorias) {
    grid.innerHTML = '';

    if (listaDeConsultorias.length === 0) {
        grid.innerHTML = `
            <div style="text-align: center; margin: 5rem 1rem;">
                <h2 style="color: #000;">Nenhuma consultoria encontrada com os filtros aplicados.</h2>
            </div>
        `;
        return;
    }

    let html = '';
    for (const consultoria of listaDeConsultorias) {

        let estrelas = preencherestrelas(consultoria.avaliacao);
        let status = capitalize(consultoria.status_situacao);
        let hora = (consultoria.horario === '00:00:00') ? '' : consultoria.horario.substring(0, 5);

        let btnDenuncia = '';
        let btnRegistro = '';
        let btnCancelar = '';
        let btnConfirmar = '';
        let canceladoDiff = '';
        let comentarioDisplay = consultoria.comentario ? `<h5 style="padding: 15px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">Comentário: ${consultoria.comentario}</h5>` : `<h5 style="padding: 15px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">Sem comentário</h5>`;

        const temDenuncia = await detectDenuncia(getUserId(0), '0', consultoria.idCliente);

        //let btnLink = '';

        if (consultoria.status_situacao === 'pendente') {
            btnCancelar = `<button class="btn btn-danger" type="button" data-action="cancelar">Cancelar</button>`;
            btnConfirmar = `<button class="btn btn-primary" type="button" data-action="confirmar">Confirmar</button>`;

            canceladoDiff = `<h5 style="padding: 1em; padding-top: 0.25em; padding-bottom: 0.25em; font-size: 1em; font-family: Arial, Helvetica, sans-serif;">Avaliação: ${estrelas}</h5> <h5 style="padding: 1em; padding-top: 0.25em; padding-bottom: 0.25em; font-size: 1em; font-family: Arial, Helvetica, sans-serif;">${comentarioDisplay}</h5>`;

            btnDenuncia = '';
            btnRegistro = '';

        } else if (consultoria.status_situacao === 'confirmada') {
            btnCancelar = `<button class="btn btn-danger" type="button" data-action="cancelar">Cancelar</button>`;
            btnConfirmar = `<button class="btn btn-primary" type="button" data-action="confirmar" disabled>Confirmado</button>`;
            btnRegistro = '';
            btnDenuncia = '';
            canceladoDiff = `<h5 style="padding: 1em; padding-top: 0.25em; padding-bottom: 0.25em; font-size: 1em; font-family: Arial, Helvetica, sans-serif;">Avaliação: ${estrelas}</h5> <h5 style="padding: 1em; padding-top: 0.25em; padding-bottom: 0.25em; font-size: 1em; font-family: Arial, Helvetica, sans-serif;">${comentarioDisplay}</h5>`;

        } else if (consultoria.status_situacao === 'concluida') {
            const hasRegistro = consultoria.assunto && consultoria.solucoes && consultoria.infoSolicitada;
            btnRegistro = hasRegistro ? `<button class="btn btn-primary" type="button" data-action="relatorio">Ver Relatório</button>` : `<button class="btn btn-success" type="button" data-action="registrar">Registrar</button>`;

            btnDenuncia = temDenuncia ? `<button class="btn btn-primary" type="button" data-action="denunciar" disabled>Denunciado</button>` : `<button class="btn btn-outline-danger" type="button" data-action="denunciar">Denunciar</button>`;

            canceladoDiff = `<h5 style="padding-bottom: 5px; font-size: 1em; font-family: Arial, Helvetica, sans-serif;">&emsp;Avaliação: ${estrelas}</h5> ${comentarioDisplay}`;

        } else if (consultoria.status_situacao === 'cancelada') {
            btnRegistro = '';
            btnCancelar = '';
            btnConfirmar = '';
            btnDenuncia = '';
            canceladoDiff = `<h5 style="padding: 1em; padding-top: 0.25em; padding-bottom: 0.25em; font-size: 1em; font-family: Arial, Helvetica, sans-serif;">Avaliação: ${estrelas}</h5> <h5 style="padding: 1em; padding-top: 0.25em; padding-bottom: 0.25em; font-size: 1em; font-family: Arial, Helvetica, sans-serif;">${comentarioDisplay}</h5>`;

        }
        consultoriasMap.set(consultoria.idReuniao.toString(), {
            assunto: consultoria.assunto,
            solucoes: consultoria.solucoes,
            infoSolicitada: consultoria.infoSolicitada
        });

        html += `
            <div class="historic-card-consultoria" data-id="${consultoria.idReuniao.toString()}">
                <div class="historic-card-header-container">
                    <h1 class="historic-card-title">Consultoria com ${consultoria.nome.split(' ')[0]}</h1>
                    <div class="historic-card-buttons">
                        ${btnRegistro}
                        ${btnCancelar}
                        ${btnConfirmar}
                        ${btnDenuncia}
                    </div>
                </div>
                <br>
                <div class="historic-card-content">
                    <div class="historic-card-user-data">
                        <img src="${consultoria.urlImagemPerfil}" class="profile-nav">
                        <h5 class="historic-card-user-name">${consultoria.nome}</h5>
                    </div>
                    <div>
                        <h5 class="historic-card-info">&nbsp;&nbsp;&nbsp;${consultoria.infoAdiantada}</h5>
                        <h5 class="historic-card-date">Em ${formatarData(consultoria.data)} ${hora}</h5>
                        <h5 class="historic-card-status">Status: ${status}</h5>
                        ${canceladoDiff}
                    </div>
                </div>
            </div>
        `;
    }
    grid.innerHTML = html;
}

function aplicarFiltros() {
    let consultoriasFiltradas = [...allConsultorias];

    const textoBusca = searchBar.value.trim().toLowerCase();
    if (textoBusca) {
        consultoriasFiltradas = consultoriasFiltradas.filter(consultoria => {
            return consultoria.nome.toLowerCase().includes(textoBusca);
        });
    }

    const tipoFiltro = filtro.value;

    switch (tipoFiltro) {
        case 'cliente':
            break;
        case 'data':
            consultoriasFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));
            break;
        case 'status':
            consultoriasFiltradas = consultoriasFiltradas.filter(c => c.status_situacao == 'confirmada');
            break;
        case 'status2':
            consultoriasFiltradas = consultoriasFiltradas.filter(c => c.status_situacao === 'pendente');
            break;
        case 'melhor_avaliado':
            consultoriasFiltradas.sort((a, b) => b.avaliacao - a.avaliacao);
            break;
        default:
            console.log('caiu no default:', tipoFiltro);
            break;
    }

    displayedConsultorias = consultoriasFiltradas;
    renderizarConsultorias(displayedConsultorias);
}