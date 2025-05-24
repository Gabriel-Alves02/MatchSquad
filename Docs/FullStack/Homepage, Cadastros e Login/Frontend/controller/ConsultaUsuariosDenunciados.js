
import { carregarDenuncias } from '../service/AJAX.js';

let denuncias;

document.addEventListener('DOMContentLoaded', async function () {
    denuncias = await carregarDenuncias();

    console.log(denuncias);

    try {

        let html = `
          <table class="table table-bordered" border="1" style="width:100%; border-collapse:collapse">
                    <thead>
                    <tr>
                        <th>idDenuncia</th>
                        <th>Gravidade</th>
                        <th>nomeDenunciante</th>
                        <th>nomeDenunciado</th>
                        <th>SentidoDenuncia</th>
                        <th>Descrição</th>
                        <th>Banir?</th>
                    </tr>
                </thead>
            <tbody>
        `;


        (denuncias.complain).forEach(async (denuncia) => {

            let buttonBan = `<td><button class="btn btn-danger" data-value="${denuncia.idDenuncia}">Sim</button></td>`;
            let gravidade;
            let idDenunciante;
            let idDenunciado;
            let denunciante;
            let denunciado;
            let sentido;

            if (denuncia.gravidade === 0) {
                gravidade = "Baixa";
            } else if (denuncia.gravidade === 1) {
                gravidade = "Moderada";
            }else{
                gravidade = "Grave";
            }

            if (denuncia.sentido === 0) {
                idDenunciante = denuncia.idConsultor;
                idDenunciado = denuncia.idCliente;
                denunciante = denuncia.nome_consultor;
                denunciado = denuncia.nome_cliente;
                sentido = "Consultor→Cliente";
            }else
            {
                idDenunciante = denuncia.idCliente;
                idDenunciado = denuncia.idConsultor;
                denunciante = denuncia.nome_cliente;
                denunciado = denuncia.nome_consultor;
                sentido = "Cliente→Consultor";
            }

            html += `
              <tr>
                <td>${denuncia.idDenuncia}</td>
                <td>${gravidade}</td>
                <td>${denunciante}</td>
                <td>${denunciado}</td>
                <td>${sentido}</td>
                <td>${denuncia.descricao}</td>
                ${buttonBan}
              </tr>
            `;
        });

        html += `</tbody></table>`;

        document.getElementById('tabelaAgendamentos').innerHTML = html;

    } catch (error) {
        console.error("Erro ao carregar reuniões:", error);
    }
});

// document.addEventListener('click', async function (event) {

//     if (event.target.disabled) {
//         return;
//     }

//     if (event.target.classList.contains('btn')) {
//         const idReuniao = event.target.getAttribute('data-value');
//         const resposta = confirm("Você tem certeza que deseja cancelar este usuario?");

//         if (resposta) {
//             console.log("Cancelando agendamento com ID:", idReuniao);
//             await canceladoReuniao(idReuniao);
//             window.location.reload();
//         }
//     }
// });
