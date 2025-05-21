import { carregarSolicitacoesAgendadas, canceladoReuniao } from '../service/AJAX.js';
import { getUserId } from './SysFx.js';

let reunioes;

document.addEventListener('DOMContentLoaded', async function () {
  reunioes = await carregarSolicitacoesAgendadas(getUserId(0));

  try {

    let html = `
      <table class="table table-bordered" border="1" style="width:100%; border-collapse:collapse">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Informação Prévia</th>
            <th>Data</th>
            <th>Status</th>
            <th>Tipo</th>
            <th>Horário</th>
            <th>Período</th>
            <th>Link</th>
            <th>Cancelar?</th>
          </tr>
        </thead>
        <tbody>
    `;


    reunioes.forEach(async (reuniao) => {

      let buttonCancel;

      if (reuniao.status_situacao === 'cancelada' || reuniao.status_situacao === 'realizada') {
        buttonCancel = `<td><button class="btn btn-cancel" data-value="${reuniao.idReuniao}" disabled>Sim</button></td>`;
      } else {
        buttonCancel = `<td><button class="btn btn-cancel btn-danger" data-value="${reuniao.idReuniao}">Sim</button></td>`;
      }

      //Tratar o link futuramente (gerar, desabilitar,etc)
      let noneHour = '-'

      if (reuniao.horario !== '00:00:00')
        noneHour = reuniao.horario

      html += `
          <tr>
            <td>${reuniao.nome}</td>
            <td>${reuniao.infoAdiantada}</td>
            <td>${new Date(reuniao.data).toLocaleDateString()}</td>
            <td>${reuniao.status_situacao}</td>
            <td>${reuniao.tipo}</td>
            <td>${noneHour}</td>
            <td>${reuniao.periodo}</td>
            <td>${reuniao.link ? `<a href="${reuniao.link}" target="_blank">Acessar</a>` : ''}</td>
            ${buttonCancel}
          </tr>
        `;
    });

    html += `</tbody></table>`;

    document.getElementById('tabelaAgendamentos').innerHTML = html;

  } catch (error) {
    console.error("Erro ao carregar reuniões:", error);
  }
});

document.addEventListener('click', async function (event) {

  if (event.target.disabled) {
    return;
  }

  if (event.target.classList.contains('btn-cancel')) {
    const idReuniao = event.target.getAttribute('data-value');
    const resposta = confirm("Você tem certeza que deseja cancelar este agendamento?");

    if (resposta) {
      console.log("Cancelando agendamento com ID:", idReuniao);
      await canceladoReuniao(idReuniao);
      window.location.reload();
    }
  }
});