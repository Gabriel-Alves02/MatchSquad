import { carregarInfoPerfil, atualizarPerfil, atualizarSenha, uploadImagemPerfil, limparImagensNaNuvem, buscarSenha, userType } from '../service/AJAX.js';
import { getUserId, deactivateUser, senhaInvalida } from './SysFx.js';

let info;

const limparImagensBtn = document.getElementById('limpar-imagens-btn');

const uploadInput = document.getElementById('upload-pic');
const profilePic = document.getElementById('profile-pic');

let nome = document.getElementById('nome');
let email = document.getElementById('email');
let telefone = document.getElementById('telefone');
let redeSocial = document.getElementById('rede-social');
let bio = document.getElementById('bio');

let salvarBtn = document.getElementById('salvar');

let senhaAntiga = document.getElementById('senha');
let novaSenha = document.getElementById('nova-senha');
let confirmNovaSenha = document.getElementById('confirma-senha');

let msgSenhaAntiga = document.getElementById('msgsenhaAntiga');
let msgSenhaNova = document.getElementById('msgnovaSenha');
let msgConfirmSenha = document.getElementById('msgconfirmSenha');

let salvarBtn2 = document.getElementById('salvar-plus');

document.addEventListener('DOMContentLoaded', async function () {

  info = await carregarInfoPerfil(getUserId(1), 1);

  nome.value = info.nome
  email.value = info.email
  telefone.value = info.telefone
  redeSocial.value = info.redeSocial
  bio.value = info.bio

  let urlImagemPerfil = info.urlImagemPerfil

  const localStorageUrl = localStorage.getItem('profilePicUrl');

  if (localStorageUrl) {
    profilePic.src = localStorageUrl;
  } else if (urlImagemPerfil) {
    profilePic.src = urlImagemPerfil;
  }

});

document.addEventListener('paste', function (event) {
  if (event.target.tagName === 'INPUT') {
    event.preventDefault();
  }
});

document.querySelector('.profile-info').addEventListener('submit', async (e) => {
  e.preventDefault();

  const dadosAtualizados = {
    nome: nome.value,
    email: email.value,
    telefone: telefone.value,
    redeSocial: redeSocial.value,
    bio: bio.value
  };

  salvarBtn.disabled = true;

  const resp = await atualizarPerfil(getUserId(1), 1, dadosAtualizados);

  alert(resp.message)

});


uploadInput.addEventListener('change', async function () {
  const file = this.files[0];

  if (file) {

    const reader = new FileReader();

    reader.onload = function (e) {
      profilePic.src = e.target.result;
    }

    reader.readAsDataURL(file);

    habilitarSalvar();

    try {
      const resp = await uploadImagemPerfil(getUserId(1), 1, file);

      if (resp) {
        profilePic.src = resp.url;
      } else {
        console.error('>', resp.message);
      }

    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
    }
  }
});


document.getElementById('excluir-conta').addEventListener('click', async (e) => {

  e.preventDefault();

  deactivateUser (getUserId(1), 1);

});



[nome, email, telefone, redeSocial, bio].forEach(input => {
  input.addEventListener('input', habilitarSalvar);
});

function habilitarSalvar() {
  salvarBtn.disabled = false;
}



document.querySelector('.plus-config').addEventListener('submit', async (e) => {
  e.preventDefault();

  const resultado = await senhaInvalida(senhaAntiga, confirmNovaSenha, novaSenha, 1);

  msgSenhaAntiga.style.display = resultado.senhaIncorreta ? 'inline-block' : 'none';
  msgSenhaNova.style.display = resultado.tamanhoIncorreto ? 'inline-block' : 'none';
  msgConfirmSenha.style.display = resultado.confirmacaoInvalida ? 'inline-block' : 'none';


  if (resultado.valido) {
    const senhaAtualizada = {
      novaSenha: novaSenha.value
    };

    salvarBtn2.disabled = true;

    const resp = await atualizarSenha(getUserId(1), 1, senhaAtualizada);

    alert(resp.message);

    senhaAntiga.value = '';
    novaSenha.value = '';
    confirmNovaSenha.value = '';
  } else {
    console.log("Formulário inválido. Corrija os erros antes de enviar.");
  }
});



[senhaAntiga, novaSenha, confirmNovaSenha].forEach(input => {
  input.addEventListener('input', habilitarSalvar2);
});

function habilitarSalvar2() {
  salvarBtn2.disabled = false;
}

limparImagensBtn.addEventListener('click', async function () {
  const confirmacao = confirm('Tem certeza que deseja limpar TODAS as suas imagens da nuvem? Esta ação é irreversível.');

  if (confirmacao) {
    try {
      const userId = getUserId(1);
    
      const resp = await limparImagensNaNuvem (userId, 1);

      if (resp.success) {
        alert('Imagens limpas com sucesso da nuvem!');
        profilePic.src = '';
        localStorage.removeItem('urlImagemPerfil');
        window.location.reload();
      } else {
        alert(`Erro ao limpar imagens: ${resp.message}`);
      }
    } catch (error) {
      console.error('Erro ao tentar limpar imagens:', error);
      alert('Ocorreu um erro ao tentar limpar as imagens. Tente novamente.');
    }
  }
});