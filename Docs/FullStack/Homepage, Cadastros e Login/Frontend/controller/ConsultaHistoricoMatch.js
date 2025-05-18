import { carregarMatchsPesquisados, avaliado } from '../service/AJAX.js';
import { getUserId } from '../controller/SysFx.js';

let consultorias;

const searchBar = document.getElementById('searchBar');
const filtro = document.getElementById('filtros');
const grid = document.getElementById('listaMatchs');

let consultoriasMap = new Map();

const modalRelatorio = document.getElementById('modalRelatorio');

document.addEventListener('DOMContentLoaded', async function () {

    consultorias = await carregarMatchsPesquisados(getUserId(1));

    consultoriasMap = new Map();

    if ((consultorias.reuniao).length === 0) {
        document.getElementById('listaMatchs').innerHTML = `
            <div style="text-align: center; margin: 20rem 1rem;">
                <h2 style="color: #000;">Sem consultorias em seu histórico.</h2>
            </div>
        `;
        return;
    }

    try {
        let html = '';

        (consultorias.reuniao).forEach((consultoria) => {
            let estrelas = preencherestrelas(consultoria.avaliacao);
            let status = capitalize(consultoria.status_situacao);
            let hora = (consultoria.horario === '00:00:00') ? '' : consultoria.horario.substring(0, 5);
            let avalia = '';

            if (consultoria.status_situacao === 'pendente' || consultoria.status_situacao === 'cancelada') {

                if (consultoria.status_situacao === 'pendente') {
                    avalia =  `<h5 style="padding: 15px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">Avaliação: ${estrelas}</h5>`;
                }

                html += `
                <div style="background-color: #cbe2f8; border-radius: 10px; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3); max-width: 900px; margin-bottom: 20px;">
                    <div style="display: flex;">
                        <h1 style="margin: 15px;">
                            Consultoria com ${consultoria.nome}
                        </h1>
                        <div style="margin-top: 20px; margin-left: 20px; margin-right: 10px; margin-bottom: 15px;">
                            <button class="btn btn-primary" type="button" disabled>Ver relatório</button>
                        </div>
                        <div style="margin-top: 20px; margin-left: 10px; margin-right: 5px; margin-bottom: 15px;">
                            <button class="btn btn-primary" type="button" disabled>Ver avaliação</button>
                        </div>
                    </div>
                    <br>
                    <div style="display: flex; margin-bottom: 10px;">
                        <div style="display: flex;">
                            <img src="${consultoria.urlImagemPerfil}" class="profile-nav">
                            <h5 style="padding: 15px; padding-bottom: 5px; padding-top: 2.5px; padding-left: 2.5px; font-family: Arial, Helvetica, sans-serif;">
                                ${consultoria.nome}
                            </h5>
                        </div>
                        
                        <div>
                            <h5 style="padding: 15px; padding-bottom: 5px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">
                                Em ${formatarData(consultoria.data)} ${hora}
                            </h5>
                            <h5 style="padding-left: 15px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">
                                Status: ${status}
                            </h5>
                            ${avalia}
                        </div>
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
                let comentario;

                if (consultoria.avaliacao === 0) {
                    btnAvaliacao = `<button class="btn btn-primary" type="button" data-action="avaliacao">Avaliar</button>`;
                    comentario = ``;
                } else {
                    btnAvaliacao = `<button class="btn btn-primary" type="button" data-action="avaliacao" disabled>Avaliado</button>`;
                    comentario = `<h5 style="padding: 15px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">${consultoria.comentario}</h5>`;
                }


                html += `
                    <div class="consultoria-item" data-id="${consultoria.idReuniao.toString()}" style="background-color: #cbe2f8; border-radius: 10px; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3); max-width: 900px; margin-bottom: 20px;">
                        <div style="display: flex;">
                            <h1 style="margin: 15px;">
                                Consultoria com ${consultoria.nome}
                            </h1>
                            <div style="margin-top: 20px; margin-left: 20px; margin-right: 10px; margin-bottom: 15px;">
                                <button class="btn btn-primary" type="button" data-action="relatorio">Ver relatório</button>
                            </div>
                            <div style="margin-top: 20px; margin-left: 10px; margin-right: 5px; margin-bottom: 15px;">
                                ${btnAvaliacao}
                            </div>
                        </div>
                        <br>
                        <div style="display: flex; margin-bottom: 10px;">
                            <div style="display: flex;">
                                <img src="${consultoria.urlImagemPerfil}" class="profile-nav">
                                <h5
                                    style="padding: 15px; padding-bottom: 5px; padding-top: 2.5px; padding-left: 2.5px; font-family: Arial, Helvetica, sans-serif;">
                                    ${consultoria.nome}
                                </h5>
                            </div>
                            
                            <div>
                                <h5 style="padding: 15px; padding-bottom: 5px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">
                                    Em ${formatarData(consultoria.data)} ${hora}
                                </h5>
                                <h5 style="padding-left: 15px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">
                                    Status: ${status}
                                </h5>
                                <h5 style="padding: 15px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">
                                    Avaliação: ${estrelas}
                                </h5>
                                <h5 style="padding: 15px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">
                                    Comentário: ${comentario}
                                </h5>
                            </div>
                        </div>
                    </div>
                    `;
            }
        });

        grid.innerHTML = html;

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

                const idReuniaoAtual = formAvaliacao.getAttribute('data-id-reuniao'); // Adicione este atributo ao form
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


    } catch (error) {
        console.error("Erro ao carregar matchs:", error);
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
        }
    }
});

let modalRelatorioInstance = null;
let modalAvaliacaoInstance = null;

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