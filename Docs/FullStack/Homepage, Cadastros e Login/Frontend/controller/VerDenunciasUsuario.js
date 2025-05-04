import { carregarDenunciasUsuario } from '../service/AJAX.js';
import { getUserId } from '../controller/SysFx.js';

let denuncias;

document.addEventListener('DOMContentLoaded', async function () {
   denuncias = await carregarDenunciasUsuario(getUserId(1));

   try {

    let html = '';


    denuncias.forEach(async (denuncia) =>  {


        html += `
          <div
            style="background-color: #cbe2f8; border-radius: 10px; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3); max-width: 900px;">
            <div style="display: flex;">
                <img src="../assets/7.jpg" class="profile-nav" style="margin-top: 20px;">
                <h1 style="margin: 15px;">
                    ${denuncia.nomeDenunciante}
                </h1>
            </div>
            <br>
            <div style="display: flex; margin-bottom: 10px;">
                
                <div>
                    <p style="margin-left: 20px;">${denuncia.descricao}</p>
                </div>
            </div>
        </div>
        `;
    });

    document.getElementById('nomeDenunciado').innerHTML = `Denúncias para ${denuncia.nomeDenunciado}`

    document.getElementById('listaDenuncias').innerHTML = html;

} catch (error) {
    console.error("Erro ao carregar as denuncias:", error);
}
});