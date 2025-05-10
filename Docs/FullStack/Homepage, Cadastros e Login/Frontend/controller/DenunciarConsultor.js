import { DenunciarConsultor } from "../service/AJAX.js";

const form = document.getElementById('formDenuncia');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    let objDenuncia = 
    {
        descricao: document.getElementById('descricaoDenuncia').value,
        idConsultor: getUserId(0),
        idCliente: getUserId(1)
    }

    DenunciarConsultor(objDenuncia);
});