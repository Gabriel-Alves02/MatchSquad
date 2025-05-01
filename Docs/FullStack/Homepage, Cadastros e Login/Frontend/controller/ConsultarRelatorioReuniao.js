import { carregarRelatorioReuniao } from '../service/AJAX.js';
import { getUserId } from '../controller/SysFx.js';

let relatorio;

document.addEventListener('DOMContentLoaded', async function () {
    relatorio = await carregarRelatorioReuniao(getUserId(1));

    document.getElementById('titulo').innerHTML = `Reunião com ${relatorio.nomeCliente}, realizada em ${new Date(relatorio.data).toLocaleDateString()}`;

    document.getElementById('assuntosTratados').innerHTML = relatorio.assunto;
    document.getElementById('solucoesEstabelecidas').innerHTML = relatorio.solucoes;
    document.getElementById('informacoesSolicitadas').innerHTML = relatorio.infoSolicitada;

});