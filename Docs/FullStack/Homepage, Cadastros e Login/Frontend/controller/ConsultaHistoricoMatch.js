import { carregarMatchsPesquisados, avaliado, denunciar, checkDenuncia } from '../service/AJAX.js';
import { getUserId, capitalize } from '../controller/SysFx.js';

const searchBar = document.getElementById('searchBar');
const filtro = document.getElementById('filtros');
const grid = document.getElementById('listaMatchs');
let allConsultorias = [];
let displayedConsultorias = [];

let consultoriasMap = new Map();

const modalRelatorio = document.getElementById('modalRelatorio');

document.addEventListener('DOMContentLoaded', async function () {

    const fetchedConsultorias = await carregarMatchsPesquisados(getUserId(1));

    consultoriasMap = new Map();

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

            await avaliado(dadosAvaliacao);

            modalAvaliacaoInstance.hide();
            window.location.reload();
        });
    }

    const formDenuncia = document.getElementById('formDenuncia');
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
                dataReuniaoDenunciada = consultoriaAtual.data;
                dataReuniaoDenunciada = dataReuniaoDenunciada.substring(0, 10);
            } else {
                console.warn("Data da reunião não encontrada para a denúncia.");
            }

            const dadosDenuncia = {
                idReuniao: idReuniaoAtual,
                gravidade: parseInt(gravidade),
                comentario: comentario.trim(),
                dataReuniao: dataReuniaoDenunciada
            };

            await denunciar(getUserId(1), '1', dadosDenuncia);

            modalDenunciaInstance.hide();
            window.location.reload();
        });
    }

}

);


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


let currentConsultoriaId = null;

document.addEventListener('click', function (event) {

    if (event.target.matches('button[data-action]')) {
        const consultoriaItem = event.target.closest('.consultoria-item');
        if (consultoriaItem) {
            const id = consultoriaItem.getAttribute('data-id');

            if (event.target.getAttribute('data-action') === 'relatorio') {
                const relatorio = consultoriasMap.get(id);

                if (relatorio) {
                    let assunto = relatorio.assunto;
                    let solucoes = relatorio.solucoes;
                    let infoSolicitada = relatorio.infoSolicitada;
                    abrirModalRelatorio(assunto, solucoes, infoSolicitada);
                } else {
                    console.error('Relatório não encontrado para o ID:', id);
                }
            } else if (event.target.getAttribute('data-action') === 'avaliacao') {
                currentConsultoriaId = id;
                const formAvaliacao = document.getElementById('formAvaliacao');
                if (formAvaliacao) {
                    formAvaliacao.setAttribute('data-id-reuniao', id);
                }
                modalAvaliacao();
            }
            else if (event.target.getAttribute('data-action') === 'denunciar') {
                currentConsultoriaId = id;
                const formDenuncia = document.getElementById('formDenuncia');
                if (formDenuncia) {
                    formDenuncia.setAttribute('data-id-reuniao', id);
                }
                modalDenuncia();
            }
        }
    }
});

let modalRelatorioInstance = null;
let modalAvaliacaoInstance = null;
let modalDenunciaInstance = null;

function abrirModalRelatorio(assunto, solucoes, infoSolicitada) {
    if (!modalRelatorioInstance) {
        modalRelatorioInstance = new bootstrap.Modal(document.getElementById('modalRelatorio'));
    }
    document.getElementById('assunto').value = assunto || '';
    document.getElementById('solucoes').value = solucoes || '';
    document.getElementById('infoSolicitada').value = infoSolicitada || '';
    modalRelatorioInstance.show();
}

function modalAvaliacao() {
    if (!modalAvaliacaoInstance) {
        modalAvaliacaoInstance = new bootstrap.Modal(document.getElementById('modalAvaliacao'));
    }

    document.getElementById('notaAvaliacao').value = '';
    document.getElementById('comentarioAvaliacao').value = '';
    modalAvaliacaoInstance.show();
}

function modalDenuncia() {
    if (!modalDenunciaInstance) {
        modalDenunciaInstance = new bootstrap.Modal(document.getElementById('modalDenuncia'));
    }

    document.getElementById('gravidade').value = '';
    document.getElementById('comentarioDenuncia').value = '';
    modalDenunciaInstance.show();
}

async function detectDenuncia(idCliente, tipoUsuario, idConsultor) {

    const response = await checkDenuncia(idCliente, tipoUsuario, idConsultor);

    if (response == true) {
        return true;
    }

    return false;
}

async function renderizarConsultorias(listaDeConsultorias) { // Parâmetro renomeado
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
    for (const consultoria of listaDeConsultorias) { // Iterando sobre o parâmetro
        let estrelas = preencherestrelas(consultoria.avaliacao);
        let status = capitalize(consultoria.status_situacao);
        let hora = (consultoria.horario === '00:00:00') ? '' : consultoria.horario.substring(0, 5);
        let avalia = '';

        if (consultoria.status_situacao === 'pendente' || consultoria.status_situacao === 'cancelada') {
            if (consultoria.status_situacao === 'pendente') {
                avalia = `<h5 style="padding: 1em; padding-top: 0.25em; padding-bottom: 0.25em; font-size: 1em; font-family: Arial, Helvetica, sans-serif;">Avaliação: ${estrelas}</h5>`;
            }
            
            const hoje = new Date();

            if((formatarData(consultoria.data) === formatarData(hoje)) && consultoria.link != '') {
                btnLink = `<div class="historic-card-buttons" style="margin-bottom: 0.25em;">
                                <a class="btn btn-primary" type="button" href="${consultoria.link}" target="_blank" rel="noopener noreferrer">Reunião</a>
                           </div>`
            }
            else {
                btnLink = `<div class="historic-card-buttons" style="margin-bottom: 0.25em; display: none;">
                                <a class="btn btn-primary" type="button" href="${consultoria.link}" target="_blank" rel="noopener noreferrer">Reunião</a>
                           </div>`
            }
            
            html += `
                <div class="historic-card">
                    <div class="historic-card-header-container">
                        <h1 class="historic-card-title">
                            Consultoria com ${consultoria.nome}
                        </h1>
                        <div class="historic-card-buttons">
                            <button class="btn btn-primary" type="button" disabled>Relatório</button>
                            <button class="btn btn-primary" type="button" disabled>Ver avaliação</button>
                        </div>
                    </div>
                    <br>
                    <div class="historic-card-content">
                        <div class="historic-card-user-data">
                            <img src="${consultoria.urlImagemPerfil}" class="profile-nav">
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
                            ${avalia}
                        </div>

                        ${btnLink}

                    </div>
                </div>
            `;
        } else {
            const relatorio = {
                assunto: consultoria.assunto,
                solucoes: consultoria.solucoes,
                infoSolicitada: consultoria.infoSolicitada
            };

            consultoriasMap.set(consultoria.idReuniao.toString(), relatorio);

            let btnAvaliacao;
            let btnDenuncia = `<button class="btn btn-outline-danger" type="button" data-action="denunciar">Denunciar</button>`;
            let comentario;

            if (consultoria.avaliacao === 0) {
                btnAvaliacao = `<button class="btn btn-primary" type="button" data-action="avaliacao">Avaliar</button>`;
                comentario = ``;
            } else {
                btnAvaliacao = `<button class="btn btn-primary" type="button" data-action="avaliacao" disabled>Avaliado</button>`;
                comentario = `<h5 style="padding: 1em; padding-top: 0.25em; padding-bottom: 0.25em; font-size: 1em; font-family: Arial, Helvetica, sans-serif;">${consultoria.comentario}</h5>`;
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
                            <img src="${consultoria.urlImagemPerfil}" class="profile-nav">
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
                            <h5 class="historic-card-status">
                                Avaliação: ${estrelas}
                            </h5>
                            <h5 class="historic-card-status">
                                Comentário: ${comentario}
                            </h5>
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
            console.log('caiu no default:', tipoFiltro);
            break;
    }

    displayedConsultorias = consultoriasFiltradas; // Atualiza a lista exibida
    renderizarConsultorias(displayedConsultorias); // Renderiza a lista filtrada/ordenada
}