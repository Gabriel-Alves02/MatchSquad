import { carregarInfoPerfil } from '../service/AJAX.js';

let consultores;

document.addEventListener('DOMContentLoaded', async function () {

    consultores = await carregarInfoPerfil('-1', '-1');

    try {
        let html = "";

        consultores.forEach((consultor) => {

            let bioDescr = consultor.bio;
            if (bioDescr === null || bioDescr.length > 50) {
                bioDescr = 'Abra meu portfólio para saber mais.';
            }

            html += `
                <div class="col-md-4">
                    <div class="card mb-4 shadow-sm">
                        <div class="card-body">
                            <img src="${consultor.urlImagemPerfil}" class="img-box" alt="">
                            <br><br>
                            <h5 class="card-title">${consultor.nome}</h5>
                            <details class="card-text">
                                <summary>${consultor.habilidades}</summary>
                                <span>${bioDescr}</span>
                            </details>
                        </div>
                    </div>
                </div>
            `;
        });

        document.getElementById('maingrid').innerHTML = html;

    } catch (error) {
        console.error("Erro ao carregar reuniões:", error);
    }

});
