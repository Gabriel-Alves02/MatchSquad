import { Cadastrar } from "../service/req_respManager.js";

const form = document.getElementById('consultorForm');

form.addEventListener('submit', (event) => {
    event.preventDefault();

    let listaHab = getHabilities();

    if(listaHab.length > 3 || listaHab.length <= 0){
        alert('Por favor, selecione até no máximo 3 de suas melhores expertises')
        return;
    }
        

    let objConsultor = 
    {
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        nickname: document.getElementById('nickname').value,
        senha: document.getElementById('senha').value,
        habilidades: listaHab
    }


    Cadastrar(objConsultor);
});

function getHabilities(){

    const checkboxes = document.querySelectorAll('#habilidades input[type="checkbox"]');
    const selecionados = [];
  
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        selecionados.push(checkbox.value);
      }
    });
  
    return selecionados;

}