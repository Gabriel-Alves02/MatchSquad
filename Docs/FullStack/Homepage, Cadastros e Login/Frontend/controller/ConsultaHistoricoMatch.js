import { carregarMatchsPesquisados, avaliado, denunciar, checkDenuncia } from '../service/AJAX.js';
import { getUserId, capitalize } from '../controller/SysFx.js';

const searchBar = document.getElementById('searchBar');
const filtro = document.getElementById('filtros');
const grid = document.getElementById('listaMatchs');
let allConsultorias = [];
let displayedConsultorias = [];

let consultoriasMap = new Map();

let modalRelatorioInstance;
let modalAvaliacaoInstance;
let modalDenunciaInstance;

document.addEventListener('DOMContentLoaded', async function () {

    modalRelatorioInstance = new bootstrap.Modal(document.getElementById('modalRelatorio'));
    modalAvaliacaoInstance = new bootstrap.Modal(document.getElementById('modalAvaliacao'));
    modalDenunciaInstance = new bootstrap.Modal(document.getElementById('modalDenuncia'));

    const fetchedConsultorias = await carregarMatchsPesquisados(getUserId(1));

    if (!fetchedConsultorias || (fetchedConsultorias.reuniao && fetchedConsultorias.reuniao.length === 0)) {
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

    const formAvaliacao = document.getElementById('formAvaliacao');
    if (formAvaliacao) {
        formAvaliacao.addEventListener('submit', async function (event) {
            event.preventDefault();

            const nota = document.getElementById('notaAvaliacao').value;
            const comentario = document.getElementById('comentarioAvaliacao').value;

            if (!nota) {
                alert("Por favor, selecione uma nota.");
                return;
            }

            const idReuniaoAtual = formAvaliacao.getAttribute('data-id-reuniao');
            if (!idReuniaoAtual) {
                console.error("ID da reunião não encontrado para avaliação.");
                return;
            }

            const dadosAvaliacao = {
                idReuniao: idReuniaoAtual,
                nota: parseInt(nota),
                comentario: comentario.trim()
            };

            const response = await avaliado(dadosAvaliacao);
            if (response && response.success) {
                alert("Avaliação enviada com sucesso!");
                modalAvaliacaoInstance.hide();
                window.location.reload();
            } else {
                alert("Erro ao enviar avaliação. Tente novamente.");
            }
        });
    }

    const formDenuncia = document.getElementById('formDenuncia');
    if (formDenuncia) {
        formDenuncia.addEventListener('submit', async function (event) {
            event.preventDefault();

            const gravidade = document.getElementById('gravidade').value;
            const comentario = document.getElementById('comentarioDenuncia').value;

            if (!gravidade) {
                alert("Por favor, selecione uma gravidade para sua denúncia.");
                return;
            }

            const idReuniaoAtual = formDenuncia.getAttribute('data-id-reuniao');
            if (!idReuniaoAtual) {
                console.error("ID da reunião não encontrado para denúncia.");
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

            const response = await denunciar(getUserId(1), '1', dadosDenuncia);
            if (response && response.success) {
                alert("Denúncia enviada com sucesso!");
                modalDenunciaInstance.hide();
                window.location.reload();
            } else {
                alert("Erro ao enviar denúncia. Tente novamente.");
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

document.addEventListener('click', function (event) {
    const consultoriaItem = event.target.closest('.historic-card-consultoria');

    if (consultoriaItem) {
        const id = consultoriaItem.getAttribute('data-id');

        if (event.target.matches('button[data-action="relatorio"]')) {
            const relatorio = consultoriasMap.get(id);

            if (relatorio) {
                // Preenche o modal e o exibe
                document.getElementById('assunto').value = relatorio.assunto || '';
                document.getElementById('solucoes').value = relatorio.solucoes || '';
                document.getElementById('infoSolicitada').value = relatorio.infoSolicitada || '';
                modalRelatorioInstance.show();
            } else {
                console.error('Relatório não encontrado para o ID:', id);
            }
        } else if (event.target.matches('button[data-action="avaliacao"]')) {

            document.getElementById('formAvaliacao').setAttribute('data-id-reuniao', id);

            document.getElementById('notaAvaliacao').value = '';
            document.getElementById('comentarioAvaliacao').value = '';
            modalAvaliacaoInstance.show();
        } else if (event.target.matches('button[data-action="denunciar"]')) {
            document.getElementById('formDenuncia').setAttribute('data-id-reuniao', id);
            document.getElementById('gravidade').value = '';
            document.getElementById('comentarioDenuncia').value = '';
            modalDenunciaInstance.show();
        }
    }
});

async function detectDenuncia(idCliente, tipoUsuario, idConsultor) {
    const response = await checkDenuncia(idCliente, tipoUsuario, idConsultor);
    // Assumindo que checkDenuncia retorna true/false ou um objeto com success: true/false
    return response === true || (response && response.success === true);
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

        console.log(consultoria);

        consultoriasMap.set(consultoria.idReuniao.toString(), consultoria);

        let estrelas = preencherestrelas(consultoria.avaliacao);
        let status = capitalize(consultoria.status_situacao);
        let hora = (consultoria.horario && consultoria.horario !== '00:00:00') ? consultoria.horario.substring(0, 5) : '';
        let avalia = '';
        let btnLink = '';

        const hoje = new Date();
        const dataReuniao = new Date(consultoria.data);
        const isToday = dataReuniao.setHours(0, 0, 0, 0) === hoje.setHours(0, 0, 0, 0);


        if (consultoria.status_situacao === 'pendente' || consultoria.status_situacao === 'cancelada') {
            if (consultoria.status_situacao === 'pendente') {
                avalia = `<h5 style="padding: 1em; padding-top: 0.25em; padding-bottom: 0.25em; font-size: 1em; font-family: Arial, Helvetica, sans-serif;">Avaliação: ${estrelas}</h5>`;
            }

            if (isToday && consultoria.link && consultoria.link !== '') {
                btnLink = `<div class="historic-card-buttons" style="margin-bottom: 0.25em;">
                                <a class="btn btn-primary" type="button" href="${consultoria.link}" target="_blank" rel="noopener noreferrer">Reunião</a>
                           </div>`;
            }

            html += `
                <div class="historic-card" data-id="${consultoria.idReuniao.toString()}"> <div class="historic-card-header-container">
                        <h1 class="historic-card-title">
                            Consultoria com ${consultoria.nome}
                        </h1>
                        <div class="historic-card-buttons">
                            <button class="btn btn-primary" type="button" disabled>Relatório</button>
                            <button class="btn btn-primary" type="button" disabled>Ver avaliação</button>
                            <button class="btn btn-primary" type="button" disabled>Denunciar</button>
                        </div>
                    </div>
                    <br>
                    <div class="historic-card-content">
                        <div class="historic-card-user-data">
                            <img src="${consultoria.urlImagemPerfil}" class="profile-nav" alt="Imagem de Perfil">
                            <h5 class="historic-card-user-name">
                                ${consultoria.nome}
                            </h5>
                        </div>
                        <div>
                            <h5 class="historic-card-date">
                                Em ${formatarData(consultoria.data)} ${hora}
                            </h5>
                            <h5 class="historic-card-status">
                                Status: ${status}
                            </h5>
                            <h6 class="historic-card-status">
                                ${capitalize(consultoria.tipo)}
                            </h6>
                            ${avalia}
                        </div>
                        ${btnLink}
                    </div>
                </div>
            `;
        } else { // status_situacao === 'realizada'
            let btnAvaliacao;
            let btnDenuncia = `<button class="btn btn-outline-danger" type="button" data-action="denunciar">Denunciar</button>`;
            let comentarioExibido = '';

            if (consultoria.avaliacao === 0) {
                btnAvaliacao = `<button class="btn btn-primary" type="button" data-action="avaliacao">Avaliar</button>`;
            } else {
                btnAvaliacao = `<button class="btn btn-primary" type="button" data-action="avaliacao" disabled>Avaliado</button>`;
                // Exibe o comentário apenas se houver um
                if (consultoria.comentario && consultoria.comentario.trim() !== '') {
                    comentarioExibido = `<h5 style="padding: 1em; padding-top: 0.25em; padding-bottom: 0.25em; font-size: 1em; font-family: Arial, Helvetica, sans-serif;">Comentário: ${consultoria.comentario}</h5>`;
                }
            }

            const temDenuncia = await detectDenuncia(getUserId(1), '1', consultoria.idConsultor);
            if (temDenuncia) {
                btnDenuncia = `<button class="btn btn-primary" type="button" data-action="denunciar" disabled>Denunciado</button>`;
            }

            html += `
                <div class="historic-card-consultoria" data-id="${consultoria.idReuniao.toString()}">
                    <div class="historic-card-header-container">
                        <h1 class="historic-card-title">
                            Consultoria com ${consultoria.nome}
                        </h1>
                        <div class="historic-card-buttons">
                            <button class="btn btn-primary" type="button" data-action="relatorio">Relatório</button>
                            ${btnAvaliacao}
                            ${btnDenuncia}
                        </div>
                    </div>
                    <br>
                    <div class="historic-card-content">
                        <div class="historic-card-user-data">
                            <img src="${consultoria.urlImagemPerfil}" class="profile-nav" alt="Imagem de Perfil">
                            <h5 class="historic-card-user-name">
                                ${consultoria.nome}
                            </h5>
                        </div>
                        <div>
                            <h5 class="historic-card-date">
                                Em ${formatarData(consultoria.data)} ${hora}
                            </h5>
                            <h5 class="historic-card-status">
                                Status: ${status}
                            </h5>
                            <h6 class="historic-card-status">
                                ${capitalize(consultoria.tipo)}
                            </h6>
                            <h5 class="historic-card-status">
                                Avaliação: ${estrelas}
                            </h5>
                            ${comentarioExibido}
                        </div>
                    </div>
                </div>
            `;
        }
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
        case 'consultor':
            // Já filtrado pela searchBar, se houver
            break;
        case 'data':
            consultoriasFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));
            break;
        case 'status':
            consultoriasFiltradas = consultoriasFiltradas.filter(c => c.status_situacao === 'realizada');
            break;
        case 'melhor_avaliado':
            consultoriasFiltradas.sort((a, b) => b.avaliacao - a.avaliacao);
            break;
        default:
            console.log('Filtro desconhecido:', tipoFiltro);
            break;
    }

    displayedConsultorias = consultoriasFiltradas;
    renderizarConsultorias(displayedConsultorias);
}