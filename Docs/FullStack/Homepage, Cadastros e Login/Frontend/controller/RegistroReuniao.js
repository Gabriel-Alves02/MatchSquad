import { RegistrarReuniao } from "../service/AJAX.js";

const form = document.getElementById('formRegistro');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    let objRegistro = 
    {
        cliente: document.getElementById('clientes').value,
        data: document.getElementById('data').value,
        topicosTratados: document.getElementById('topicosTratados').value,
        solucaoProposta: document.getElementById('solucaoProposta').value,
        infoSolicitadas: document.getElementById('infoSolicitadas').value,
    }

    RegistrarReuniao(objRegistro);
});