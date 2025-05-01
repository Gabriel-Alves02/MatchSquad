import { carregarConsultoriasPesquisadas } from '../service/AJAX.js';
import { getUserId } from '../controller/SysFx.js';

let consultorias;

document.addEventListener('DOMContentLoaded', async function () {
   consultorias = await carregarSolicitacoesAgendadas(getUserId(1));

   try {

    let html = '';


    consultorias.forEach(async (consultoria) =>  {

        let estrelas;

        if(consultoria.avaliacao === 0) {
            estrelas = `<i class="far fa-star" style="color: #FFC83D;"></i> <i class="far fa-star" style="color: #FFC83D;"></i> <i class="far fa-star" style="color: #FFC83D;"></i> <i class="far fa-star" style="color: #FFC83D;"></i> <i class="far fa-star" style="color: #FFC83D;"></i>`
        }
        else if(consultoria.avaliacao === 1){
            estrelas = `<i class="fa-solid fa-star" style="color: #FFC83D;"></i> <i class="far fa-star" style="color: #FFC83D;"></i> <i class="far fa-star" style="color: #FFC83D;"></i> <i class="far fa-star" style="color: #FFC83D;"></i> <i class="far fa-star" style="color: #FFC83D;"></i>`;
        }
        else if(consultoria.avaliacao === 2){
            estrelas = `<i class="fa-solid fa-star" style="color: #FFC83D;"></i> <i class="fa-solid fa-star" style="color: #FFC83D;"></i> <i class="far fa-star" style="color: #FFC83D;"></i> <i class="far fa-star" style="color: #FFC83D;"></i> <i class="far fa-star" style="color: #FFC83D;"></i>`;
        }
        else if(consultoria.avaliacao === 3){
            estrelas = `<i class="fa-solid fa-star" style="color: #FFC83D;"></i> <i class="fa-solid fa-star" style="color: #FFC83D;"></i> <i class="fa-solid fa-star" style="color: #FFC83D;"></i> <i class="far fa-star" style="color: #FFC83D;"></i> <i class="far fa-star" style="color: #FFC83D;"></i>`;
        }
        else if(consultoria.avaliacao === 4){
            estrelas = `<i class="fa-solid fa-star" style="color: #FFC83D;"></i> <i class="fa-solid fa-star" style="color: #FFC83D;"></i> <i class="fa-solid fa-star" style="color: #FFC83D;"></i> <i class="fa-solid fa-star" style="color: #FFC83D;"></i> <i class="far fa-star" style="color: #FFC83D;"></i>`;
        }
        else if(consultoria.avaliacao === 5){
            estrelas = `<i class="fa-solid fa-star" style="color: #FFC83D;"></i> <i class="fa-solid fa-star" style="color: #FFC83D;"></i> <i class="fa-solid fa-star" style="color: #FFC83D;"></i> <i class="fa-solid fa-star" style="color: #FFC83D;"></i> <i class="fa-solid fa-star" style="color: #FFC83D;"></i>`;
        }

        //Tratar o link futuramente (gerar, desabilitar,etc)

        html += `
          <div
            style="background-color: #cbe2f8; border-radius: 10px; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3); max-width: 900px;">
            <div style="display: flex;">
                <h1 style="margin: 15px;">
                    Consultoria com ${consultoria.nomeCliente}
                </h1>
                <div style="margin-top: 20px; margin-left: 20px; margin-right: 10px; margin-bottom: 15px;">
                    <a href="RegistroReuniao.html" class="btn btn-primary">Ver relatório</a>
                </div>
                <div style="margin-top: 20px; margin-left: 10px; margin-right: 5px; margin-bottom: 15px;">
                    <a href="infocomplete.html" class="btn btn-primary">Ver Avaliação</a>
                </div>
            </div>
            <br>
            <div style="display: flex; margin-bottom: 10px;">
                <div style="display: flex;">
                    <img src="../assets/6.jpg" class="profile-nav">
                    <h5
                        style="padding: 15px; padding-bottom: 5px; padding-top: 2.5px; padding-left: 2.5px; font-family: Arial, Helvetica, sans-serif;">
                        ${consultoria.nomeCliente}
                    </h5>
                </div>
                
                <div>
                    <h5 style="padding: 15px; padding-bottom: 5px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">
                        Em ${new Date(consultoria.data).toLocaleDateString()} às ${consultoria.horario}h
                    </h5>
                    <h5 style="padding-left: 15px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">
                        Status: ${consultoria.status}
                    </h5>
                    <h5 style="padding: 15px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">
                        Avaliação: ${estrelas}
                    </h5>
                </div>
            </div>
        </div>
        `;
    });


    document.getElementById('listaConsultorias').innerHTML = html;

} catch (error) {
    console.error("Erro ao carregar consultorias:", error);
}
});