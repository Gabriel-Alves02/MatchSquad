import { Cadastrar, carregarHabilidades, buscarNick, confirmacaoEmail } from "../service/AJAX.js";

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
    window.location.href = "./login.html";
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
  // --- 1. Esconder todas as mensagens de erro no início da validação ---
  // Isso garante que mensagens de validações anteriores sejam limpas.
  // Verifique se todos os seus elementos de mensagem de erro no HTML têm um ID começando com 'msg'.
  const errorMessages = document.querySelectorAll('[id^="msg"]');
  errorMessages.forEach(msg => msg.style.display = 'none');

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
    isValid = false;
  }

  if (!emailPattern.test(emailusuario.value)) {
    msgemail.style.display = 'inline-block';
    document.getElementById('email').value = '';
    isValid = false;
  } else {
    if (emailusuario.value !== confirmacaoEmail.value) {
      msgconfirmacaoemail.style.display = 'inline-block';
      document.getElementById('confirmacaoEmail').value = '';
      isValid = false;
    }
  }

  if (!phonePattern.test(telefoneusuario.value)) {
    msgphone.style.display = 'inline-block';
    document.getElementById('telefone').value = '';
    isValid = false;
  }

  const nickCheck = await buscarNick(nicknameusuario.value);

  if (!nicknamePattern.test(nicknameusuario.value) || nicknameusuario.value.length < 5 || nicknameusuario.value.length > 25) {
    msgnicknameInvalido.style.display = 'inline-block';
    document.getElementById('nickname').value = '';
    isValid = false;
  }
  else if (nickCheck === false) {
    msgnickname.style.display = 'inline-block';
    document.getElementById('nickname').value = '';
    isValid = false;
  }

  if (testeSenha(senhausuario.value) === false || senhausuario.value.length < 8) {
    msgsenha.style.display = 'inline-block';
    document.getElementById('senha').value = '';
    isValid = false;
  }
  else {
    if (senhausuario.value !== confirmacaoSenha.value) {
      msgconfirmacaosenha.style.display = 'inline-block';
      document.getElementById('confirmacaoSenha').value = '';
      isValid = false;
    }
  }

  cpf.value = cpf.value.replace(/\D/g, '');

  if (cpf.value.length === 11) {
    if (!validarCPF(cpf.value)) {
      msgcpf.style.display = 'inline-block';
      cpf.value = '';
      isValid = false;
    }
  }
  else {
    // Documento inválido por tamanho incorreto
    msgcpf.style.display = 'inline-block';
    cpf.value = '';
    isValid = false;
  }

  if (!numeroPattern.test(numero.value)) {
    msgnumero.style.display = 'inline-block';
    numero.value = '';
    isValid = false;
  }

  // Se alguma validação local já falhou, não é necessário fazer a chamada AJAX
  if (!isValid) {
    return false;
  }

  try {
    // A função buscarNick_Email retorna um objeto { valid, code, message }
    const responseData = await buscarNick_Email(objCheck);

    console.log('Resposta da API (buscarNick_Email):', responseData);

    if (!responseData.valid) {
      // Se a API indicar que não é válido, definimos isValid para false e exibimos a mensagem correta
      isValid = false;

      switch (responseData.code) {
        case 1: // Nickname repetido
          msgnickname.style.display = 'inline-block';
          nicknameusuario.value = '';
          nicknameusuario.focus();
          break;
        case 2: // Email repetido
          msgEmailOriginal.style.display = 'inline-block';
          emailusuario.value = '';
          confirmacaoEmail.value = '';
          emailusuario.focus();
          break;
        case 3: // Ambos (nickname e email) repetidos
          msgnickname.style.display = 'inline-block';
          msgEmailOriginal.style.display = 'inline-block';
          nicknameusuario.value = '';
          emailusuario.value = '';
          confirmacaoEmail.value = '';
          nicknameusuario.focus(); // Ou emailusuario.focus()
          break;
        default:
          // Caso um code inesperado seja retornado
          alert("Ocorreu um erro desconhecido na validação. Tente novamente.");
          break;
      }
    }
  } catch (error) {
    console.error("Erro ao verificar unicidade de nickname/email:", error);
    // Em caso de erro na comunicação com a API (servidor offline, erro de rede),
    // considere o formulário inválido e mostre uma mensagem genérica.
    alert("Ocorreu um erro ao conectar com o servidor para verificar os dados. Tente novamente mais tarde.");
    isValid = false;
  }


  return isValid;
}


function cadastrarUsuario() {

  let listaHab = getHabilities();

  const valorSelecionado = document.querySelector('input[name="modalidade"]:checked').value;

  if (valorSelecionado === 'presencial' || valorSelecionado === 'presencial_e_online') {
    let objConsultor =
    {
      nome: document.getElementById('nome').value,
      cpf: document.getElementById('cpf').value,
      email: document.getElementById('email').value,
      telefone: document.getElementById('telefone').value,
      nickname: document.getElementById('nickname').value,
      senha: document.getElementById('senha').value,
      cep: document.getElementById('cep').value,
      endereco: document.getElementById('endereco').value,
      numero: document.getElementById('numero').value,
      bairro: document.getElementById('bairro').value,
      complemento: document.getElementById('complemento').value,
      cidade: document.getElementById('cidade').value,
      modalidade: valorSelecionado,
      habilidades: listaHab
    }
  }
  else {
    let objConsultor =
    {
      nome: document.getElementById('nome').value,
      cpf: document.getElementById('cpf').value,
      email: document.getElementById('email').value,
      telefone: document.getElementById('telefone').value,
      nickname: document.getElementById('nickname').value,
      senha: document.getElementById('senha').value,
      cep: null,
      endereco: null,
      numero: null,
      bairro: null,
      complemento: null,
      cidade: null,
      modalidade: valorSelecionado,
      habilidades: listaHab
    }
  }


  console.log(objConsultor);

  let msgEmail = {
    id: '-1',
    usertype: '-1',
    email: document.getElementById('email').value
  };

  Cadastrar(objConsultor);
  // await confirmacaoEmail(msgEmail);
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
  const padraoLetras = /[a-zA-Z]/g;
  const padraoNumeros = /[0-9]/g;
  const padraoEspeciais = /[^\w\s]/g;

  if (senhausuario.match(padraoLetras) != null && senhausuario.match(padraoNumeros) != null && senhausuario.match(padraoEspeciais) != null) {
    return true;
  }
  else {
    return false;
  }
}

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