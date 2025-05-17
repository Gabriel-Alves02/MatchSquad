import { carregarMatchsPesquisados } from '../service/AJAX.js';
import { getUserId } from '../controller/SysFx.js';

let consultorias;
const searchBar = document.getElementById('searchBar');
const filtro = document.getElementById('filtros');
const grid =  document.getElementById('listaMatchs');

document.addEventListener('DOMContentLoaded', async function () {
    consultorias = await carregarMatchsPesquisados(getUserId(1));

    console.log('resultado de consultoria para o cliente', consultorias, ' tamanho:', consultorias.reuniao.length);

    if (consultorias.reuniao.length === 0) {
        document.getElementById('listaMatchs').innerHTML = `
            <div style="text-align: center; margin: 20rem 1rem;">
                <h2 style="color: #000;">Sem consultorias em seu histórico.</h2>
            </div>
        `;
        return;
    }

    try {

        let html = '';


        (consultorias.reuniao).forEach(async (consultoria) => {

            let estrelas = preencherestrelas(consultoria.avaliacao);
            let status = capitalize(consultoria.status_situacao);
            let hora;

            if (consultoria.horario === '00:00:00') {
                hora = '';
            } else {
                hora = consultoria.horario.substring(0, 5);
            }

            console.log('status', status);

            if (consultoria.status_situacao === 'pendente' || consultoria.status_situacao === 'cancelada') {
                html += `
                <div style="background-color: #cbe2f8; border-radius: 10px; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3); max-width: 900px;">
                    <div style="display: flex;">
                        <h1 style="margin: 15px;">
                            Consultoria com ${consultoria.nome}
                        </h1>
                        <div style="margin-top: 20px; margin-left: 20px; margin-right: 10px; margin-bottom: 15px;">
                            <button class="btn btn-primary" type="button" id="avaliacao" disabled>Ver relatório</button>
                        </div>
                        <div style="margin-top: 20px; margin-left: 10px; margin-right: 5px; margin-bottom: 15px;">
                            <button class="btn btn-primary" type="button" id="avaliacao" disabled>Ver avaliação</button>
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
                                Em ${formatarData(consultoria.data)}  ${hora}
                            </h5>
                            <h5 style="padding-left: 15px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">
                                Status: ${status}
                            </h5>
                            <h5 style="padding: 15px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">
                                Avaliação: ${estrelas}
                            </h5>
                        </div>
                    </div>
                </div>
                    `;
            } else {
                html += `
                    <div style="background-color: #cbe2f8; border-radius: 10px; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3); max-width: 900px;">
                        <div style="display: flex;">
                            <h1 style="margin: 15px;">
                                Consultoria com ${consultoria.nome}
                            </h1>
                            <div style="margin-top: 20px; margin-left: 20px; margin-right: 10px; margin-bottom: 15px;">
                                <button class="btn btn-primary" type="button" id="avaliacao">Ver relatório</button>
                            </div>
                            <div style="margin-top: 20px; margin-left: 10px; margin-right: 5px; margin-bottom: 15px;">
                                <button class="btn btn-primary" type="button" id="avaliacao">Ver avaliação</button>
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
                                    Em ${formatarData(consultoria.data)}  ${hora}
                                </h5>
                                <h5 style="padding-left: 15px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">
                                    Status: ${status}
                                </h5>
                                <h5 style="padding: 15px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">
                                    Avaliação: ${estrelas}
                                </h5>
                            </div>
                        </div>
                    </div>
                    `;
            }


        });

        grid.innerHTML = html;

    } catch (error) {
        console.error("Erro ao carregar matchs:", error);
    }
});

function preencherestrelas(value) {

    if (typeof value === 'number' && isFinite(value)) {

        if (value === 0) {
            return `<i class="far fa-star" style="color: #FFC83D;"></i><i class="far fa-star" style="color: #FFC83D;"></i><i class="far fa-star" style="color: #FFC83D;"></i><i class="far fa-star" style="color: #FFC83D;"></i><i class="far fa-star" style="color: #FFC83D;"></i>`
        }
        else if (value === 1) {
            return `<i class="fas fa-star" style="color: #FFC83D;"></i><i class="far fa-star" style="color: #FFC83D;"></i><i class="far fa-star" style="color: #FFC83D;"></i><i class="far fa-star" style="color: #FFC83D;"></i><i class="far fa-star" style="color: #FFC83D;"></i>`;
        }
        else if (value === 2) {
            return `<i class="fas fa-star" style="color: #FFC83D;"></i><i class="fas fa-star" style="color: #FFC83D;"></i><i class="far fa-star" style="color: #FFC83D;"></i><i class="far fa-star" style="color: #FFC83D;"></i><i class="far fa-star" style="color: #FFC83D;"></i>`;
        }
        else if (value === 3) {
            return `<i class="fas fa-star" style="color: #FFC83D;"></i><i class="fas fa-star" style="color: #FFC83D;"></i><i class="fas fa-star" style="color: #FFC83D;"></i><i class="far fa-star" style="color: #FFC83D;"></i><i class="far fa-star" style="color: #FFC83D;"></i>`;
        }
        else if (value === 4) {
            return `<i class="fas fa-star" style="color: #FFC83D;"></i><i class="fas fa-star" style="color: #FFC83D;"></i><i class="fas fa-star" style="color: #FFC83D;"></i><i class="fas fa-star" style="color: #FFC83D;"></i><i class="far fa-star" style="color: #FFC83D;"></i>`;
        }
        else if (value === 5) {
            return `<i class="fas fa-star" style="color: #FFC83D;"></i><i class="fas fa-star" style="color: #FFC83D;"></i><i class="fas fa-star" style="color: #FFC83D;"></i><i class="fas fa-star" style="color: #FFC83D;"></i><i class="fas fa-star" style="color: #FFC83D;"></i>`;
        }
    }
    else {
        return '-';
    }
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