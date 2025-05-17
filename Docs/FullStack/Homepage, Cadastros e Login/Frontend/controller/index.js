import { carregarInfoPerfil } from '../service/AJAX.js';

let consultores;

document.addEventListener('DOMContentLoaded', async function () {

    consultores = await carregarInfoPerfil('-1', '-1');

    console.log('cons vindo do back: ', consultores);

    try {
        let html = "";

        consultores.forEach((consultor) => {
            html += `
                <div class="col-md-4">
                    <div class="card mb-4 shadow-sm">
                        <div class="card-body">
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
        });

        document.getElementById('maingrid').innerHTML = html;

    } catch (error) {
        console.error("Erro ao carregar reuniões:", error);
    }

});
