import { carregarUsuariosPesquisados } from '../service/AJAX.js';
import { getUserId } from '../controller/SysFx.js';

let usuarios;

document.addEventListener('DOMContentLoaded', async function () {
   usuarios = await carregarUsuariosPesquisados(getUserId(1));

   try {

    let html = '';


    usuarios.forEach(async (usuario) =>  {


        html += `
          <div
            style="background-color: #cbe2f8; border-radius: 10px; box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3); max-width: 900px;">
            <div style="display: flex;">
                <img src="../assets/6.jpg" class="profile-nav" style="margin-top: 20px;">
                <h1 style="margin: 15px;">
                    ${usuario.nome}
                </h1>
                <div style="margin-top: 20px; margin-left: 20px; margin-right: 10px; margin-bottom: 15px;">
                    <a href="VerDenuncias.html" class="btn btn-primary">Ver denúncias</a>
                </div>
            </div>
            <br>
            <div style="display: flex; margin-bottom: 10px;">
                
                <div>
                    <h5 style="padding: 15px; padding-bottom: 5px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">
                        ${usuario.tipo}
                    </h5>
                    <h5 style="padding-left: 15px; padding-top: 5px; font-family: Arial, Helvetica, sans-serif;">
                        Denúncias: ${usuario.qtdeDenuncias}
                    </h5>
                </div>
            </div>
        </div>
        `;
    });


    document.getElementById('listaUsuarios').innerHTML = html;

} catch (error) {
    console.error("Erro ao carregar os usuarios:", error);
}
});