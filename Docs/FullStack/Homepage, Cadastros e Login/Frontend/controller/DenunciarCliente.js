import { DenunciarCliente } from "../service/AJAX.js";
import { getUserId } from "./SysFx.js";

const form = document.getElementById('formDenuncia');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    let objDenuncia = 
    {
        descricao: document.getElementById('descricaoDenuncia').value,
        idConsultor: getUserId(0),
        idCliente: getUserId(1)
    }

    DenunciarCliente(objDenuncia);
});