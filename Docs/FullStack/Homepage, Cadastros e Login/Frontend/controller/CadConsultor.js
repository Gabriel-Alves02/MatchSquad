import { Cadastrar } from "../service/AJAX.js";

const form = document.getElementById('consultorForm');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  let listaHab = getHabilities();

  if (listaHab.length > 3 || listaHab.length <= 0) {
    alert('Por favor, selecione até no máximo 3 de suas melhores expertises')
    return;
  }

  if (validarFormulario()) {
    cadastrarUsuario();
  } else {
    console.log("Formulário inválido. Corrija os erros antes de enviar.");
  }

});

document.addEventListener('paste', function (event) {
  if (event.target.tagName === 'INPUT') {
    event.preventDefault();
  }
});

function validarFormulario() {


  let nomeusuario = document.getElementById('nome');
  let emailusuario = document.getElementById('email');
  let telefoneusuario = document.getElementById('telefone');
  let nicknameusuario = document.getElementById('nickname');
  let senhausuario = document.getElementById('senha');
  let confirmacaoSenha = document.getElementById("confirmacaoSenha");
  let cpf_cnpj = document.getElementById('cpf');


  let msgnome = document.getElementById('msgnome');
  let msgemail = document.getElementById('msgemail');
  let msgphone = document.getElementById('msgphone');
  let msgnickname = document.getElementById('msgnickname');
  let msgsenha = document.getElementById('msgsenha');
  let msgconfirmacaoemail = document.getElementById('msgconfirmacaoemail');
  let msgconfirmacaosenha = document.getElementById('msgconfirmacaosenha');
  let msgcpf = document.getElementById('msgcpf');

  var nomePattern = /^[A-Za-z\s]+$/;
  var emailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  var phonePattern = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  var nicknamePattern = /^\S+$/;

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

  if (!nicknamePattern.test(nicknameusuario.value)) {
    msgnickname.style.display = 'inline-block';
    document.getElementById('nickname').value = '';
  }

  if (testeSenha(senhausuario.value) === false) {
    msgsenha.style.display = 'inline-block';
    document.getElementById('senha').value = '';
  }
  else {
    if (senhausuario.value !== confirmacaoSenha.value) {
      msgconfirmacaosenha.style.display = 'inline-block';
      document.getElementById('confirmacaoSenha').value = '';
    }
  }

  cpf.value = cpf_cnpj.value.replace(/\D/g, '');

  if (cpf.value.length === 11) {
    if (!validacaoCpf(cpf_cnpj.value)) {
      msgcpf.style.display = 'inline-block';
      document.getElementById('cpf').value = '';
    }
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

  Cadastrar(objConsultor);
}

function getHabilities() {

  const checkboxes = document.querySelectorAll('#habilidades input[type="checkbox"]');
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


function validacaoCpf(cpf_cnpj) {
  var soma9 = multiplicarCpf(9, cpf_cnpj, 10);
  var soma10 = multiplicarCpf(10, cpf_cnpj, 11);
  var result1 = digitoVerificadorCpf(soma9);
  var result2 = digitoVerificadorCpf(soma10);

  if (/^(\d)\1{10}$/.test(cpf_cnpj)) {
    return false;
  }

  if ((result1 + result2) === cpf_cnpj.substr(9, 2)) {
    return true;
  }
  else {
    return false;
  }
}

function digitoVerificadorCpf(soma) {
  var result = (soma * 10) % 11;
  return result.toString();
}

function multiplicarCpf(qtdeNumeros, cpf_cnpj, multiplicador) {
  var primeirosDigitos = cpf_cnpj.substr(0, qtdeNumeros);
  var soma = 0;

  for (var i = 0; i < primeirosDigitos.length; i++) {
    var numero = primeirosDigitos.substr(i, 1);
    soma += numero * multiplicador;
    multiplicador--;
  }

  return soma;
}