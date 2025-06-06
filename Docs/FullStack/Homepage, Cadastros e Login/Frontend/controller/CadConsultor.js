import { Cadastrar, carregarHabilidades, buscarNick } from "../service/AJAX.js";

const form = document.getElementById('consultorForm');

let htmlHab = '';

form.addEventListener('submit', (event) => {
  event.preventDefault();

  let listaHab = getHabilities();

  if (listaHab.length > 3 || listaHab.length <= 0) {
    alert('Por favor, selecione até no máximo 3 de suas melhores expertises')
    return;
  }

  if (validarFormulario()) {
    cadastrarUsuario();
    window.location.href = "../index.html";
  } else {
    console.log("Formulário inválido. Corrija os erros antes de enviar.");
  }

});

document.addEventListener('paste', function (event) {
  if (event.target.tagName === 'INPUT') {
    event.preventDefault();
  }
});

async function validarFormulario() {


  let nomeusuario = document.getElementById('nome');
  let emailusuario = document.getElementById('email');
  let telefoneusuario = document.getElementById('telefone');
  let nicknameusuario = document.getElementById('nickname');
  let senhausuario = document.getElementById('senha');
  let confirmacaoSenha = document.getElementById("confirmacaoSenha");
  let cpf = document.getElementById('cpf');
  let numero = document.getElementById('numero');


  let msgnome = document.getElementById('msgnome');
  let msgemail = document.getElementById('msgemail');
  let msgphone = document.getElementById('msgphone');
  let msgnickname = document.getElementById('msgnickname');
  let msgsenha = document.getElementById('msgsenha');
  let msgconfirmacaoemail = document.getElementById('msgconfirmacaoemail');
  let msgconfirmacaosenha = document.getElementById('msgconfirmacaosenha');
  let msgcpf = document.getElementById('msgcpf');
  let msgnicknameInvalido = document.getElementById('msgnicknameInvalido');
  let msgnumero = document.getElementById('msgnumero');

  var nomePattern = /^[A-Za-z\s]+$/;
  var emailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  var phonePattern = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  var nicknamePattern = /^\S+$/;
  var numeroPattern = /^[0-9]+$/;

  let isValid = true;

  if (!nomePattern.test(nomeusuario.value)) {
    msgnome.style.display = 'inline-block';
    document.getElementById('nome').value = '';
  }

  if (!emailPattern.test(emailusuario.value)) {
    msgemail.style.display = 'inline-block';
    document.getElementById('email').value = '';
  } else {
    if (emailusuario.value !== confirmacaoEmail.value) {
      msgconfirmacaoemail.style.display = 'inline-block';
      document.getElementById('confirmacaoEmail').value = '';
    }
  }

  if (!phonePattern.test(telefoneusuario.value)) {
    msgphone.style.display = 'inline-block';
    document.getElementById('telefone').value = '';
  }

  const nickCheck = await buscarNick(nicknameusuario.value);

  if (!nicknamePattern.test(nicknameusuario.value) || nicknameusuario.value.length < 5 || nicknameusuario.value.length > 25) {
    msgnicknameInvalido.style.display = 'inline-block';
    document.getElementById('nickname').value = '';
  }
  else if (nickCheck === false) {
    msgnickname.style.display = 'inline-block';
    document.getElementById('nickname').value = '';
  }

  if (testeSenha(senhausuario.value) === false || senhausuario.value.length < 8) {
    msgsenha.style.display = 'inline-block';
    document.getElementById('senha').value = '';
  }
  else {
    if (senhausuario.value !== confirmacaoSenha.value) {
      msgconfirmacaosenha.style.display = 'inline-block';
      document.getElementById('confirmacaoSenha').value = '';
    }
  }

  cpf.value = cpf.value.replace(/\D/g, '');

  if (cpf.value.length === 11) {
    if (!validarCPF(cpf.value)) {
      msgcpf.style.display = 'inline-block';
      cpf.value = '';
    }
  }
  else {
    // Documento inválido por tamanho incorreto
    msgcpf.style.display = 'inline-block';
    cpf.value = '';
  }

  if (!numeroPattern.test(numero.value)) {
    msgnumero.style.display = 'inline-block';
    numero.value = '';
  }

  return isValid;
}


function cadastrarUsuario() {

  let listaHab = getHabilities();

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

  console.log(objConsultor)

  Cadastrar(objConsultor);
}

function getHabilities() {

  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const selecionados = [];

  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      selecionados.push(checkbox.value);
    }
  });

  return selecionados;

}

function testeSenha(senhausuario) {
  for (let i = 0; i < senhausuario.length - 1; i++) {
    const currentChar = senhausuario[i];
    const nextChar = senhausuario[i + 1];

    if (Number(currentChar) + 1 === Number(nextChar)) {
      return false;
    }

    if (currentChar.charCodeAt(0) + 1 === nextChar.charCodeAt(0)) {
      return false;
    }
  }
  return true;
}

document.getElementById('cep').addEventListener('input', async function () {
  let cep = document.getElementById('cep').value;
  let msgcep = document.getElementById('msgcep');

  if (cep.length === 9) {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (data.erro) {
      console.log("CEP não encontrado ou inválido.");
      msgcep.style.display = 'inline-block';
      document.getElementById('cep').value = '';
      return;
    }

    document.getElementById('endereco').value = data.logradouro;
    document.getElementById('bairro').value = data.bairro;
    document.getElementById('cidade').value = data.localidade;
  }
});

document.addEventListener('DOMContentLoaded', async function () {

  const consultor = await carregarHabilidades();

  try {

    (consultor.habilidades).forEach((habilidade) => {

      console.log(habilidade)

      htmlHab += `

                <div class="col-4 text-center">
                    <input type="checkbox" id="${habilidade.nomeHabilidade}" name="${habilidade.nomeHabilidade}" value="${habilidade.idHabilidade}" />
                    <label for="${habilidade.nomeHabilidade}">
                        ${habilidade.nomeHabilidade}
                    </label>
                </div>

            `;
    });

    // Insere no container de habilidades (ex: um elemento com id 'habilidadesContainer')
    document.getElementById('habilidadesContainer').innerHTML = htmlHab;

  } catch (error) {
    console.error("Erro ao carregar habilidades:", error);
  }
});