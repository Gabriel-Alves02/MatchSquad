import { RegistrarReuniao } from "../service/AJAX.js";

const form = document.getElementById('formRegistro');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    let objRegistro = 
    {
        cliente: document.getElementById('clientes').value,
        data: document.getElementById('data').value,
        assunto: document.getElementById('topicosTratados').value,
        solucao: document.getElementById('solucaoProposta').value,
        infoSolicitada: document.getElementById('infoSolicitadas').value,
    }

    RegistrarReuniao(objRegistro);
});