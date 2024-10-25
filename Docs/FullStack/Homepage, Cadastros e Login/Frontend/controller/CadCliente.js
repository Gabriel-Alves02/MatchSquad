import { Cadastrar } from "../service/req_respManager.js";

const form = document.getElementById('customerForm');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    let objCliente = 
    {
        nome: document.getElementById('nome').value,
        cpf_cnpj: document.getElementById('cpf_cnpj').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        nickname: document.getElementById('nickname').value,
        senha: document.getElementById('senha').value
    }

    Cadastrar(objCliente);
});