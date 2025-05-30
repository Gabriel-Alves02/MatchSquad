import { carregarInfoPerfil, atualizarPerfil, atualizarSenha, uploadImagemPerfil, uploadCertificado, buscarSenha, userType } from '../service/AJAX.js';
import { getUserId, deactivateUser, senhaInvalida } from './SysFx.js';

let info;

const uploadInput = document.getElementById('upload-pic');
const profilePic = document.getElementById('profile-pic');

const uploadCertif = document.getElementById('upload-certif');
const galeriaCertif = document.getElementById('gallery');

let arquivosCertificados = [];
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/jpg'];


let nome = document.getElementById('nome');
let email = document.getElementById('email');
let valorHora = document.getElementById('valor-hora');
let telefone = document.getElementById('telefone');
let redeSocial = document.getElementById('rede-social');
let horarioInicio = document.getElementById('hora-inicial');
let horarioFim = document.getElementById('hora-final');
let bio = document.getElementById('bio');
let prazo = document.getElementById('prazo'); // input type=range
let prazoSpan = document.getElementById('prazo-valor'); // span que mostra o numero

let salvarBtn = document.getElementById('salvar');

let senhaAntiga = document.getElementById('senha');
let novaSenha = document.getElementById('nova-senha');
let confirmNovaSenha = document.getElementById('confirma-senha');

// let msgSenhaAntiga = document.getElementById('msgsenhaAntiga');
// let msgConfirmSenha = document.getElementById('msgconfirmSenha');

let salvarBtn2 = document.getElementById('salvar-plus');
let salvarCertifBtn = document.getElementById('salvar-certif');


document.addEventListener('DOMContentLoaded', async function () {

  info = await carregarInfoPerfil(getUserId(0), 0);

  prazo.value = info[0].prazoMinReag;
  prazoSpan.textContent = info[0].prazoMinReag;

  nome.value = info[0].nome
  email.value = info[0].email
  telefone.value = info[0].telefone
  valorHora.value = info[0].valorHora
  redeSocial.value = info[0].redeSocial
  horarioInicio.value = info[0].horarioInicio
  horarioFim.value = info[0].horarioFim
  bio.value = info[0].bio

  let urlImagemPerfil = info[0].urlImagemPerfil

  const localStorageUrl = localStorage.getItem('profilePicUrl');

  if (localStorageUrl) {
    profilePic.src = localStorageUrl;
  } else if (urlImagemPerfil) {
    profilePic.src = urlImagemPerfil;
  }

  if (info[0].urlsCertificados !== null && info[0].urlsCertificados.length > 0) {

    let certificados = info[0].urlsCertificados.split(',');

    certificados.forEach(url => {
      const imgContainer = document.createElement('div');
      imgContainer.classList.add('certificate-item');
      const img = document.createElement('img');
      img.src = url;
      img.classList.add('certificate-img');
      imgContainer.appendChild(img);
      galeriaCertif.appendChild(imgContainer);
    });

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
    email: email.value,
    telefone: telefone.value,
    valorHora: valorHora.value, // forçar separador decimal . em vez de ,
    redeSocial: redeSocial.value,
    horarioInicio: horarioInicio.value, // definir passo de 30min em 30min
    horarioFim: horarioFim.value,
    prazoMinReag: prazo.value,
    bio: bio.value
  };

  salvarBtn.disabled = true;

  const resp = await atualizarPerfil(getUserId(0), 0, dadosAtualizados);

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
      const resp = await uploadImagemPerfil(getUserId(0), 0, file);

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

uploadCertif.addEventListener('change', function () {
  const files = this.files;
  arquivosCertificados = [];
  galeriaCertif.innerHTML = ''; // Limpa a galeria ao mudar seleção

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!ALLOWED_MIMETYPES.includes(file.type)) {
      alert(`O arquivo '${file.name}' não é um tipo de imagem permitido (apenas JPG, JPEG, PNG). Ele será ignorado.`);
      continue;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert(`O arquivo '${file.name}' (${(file.size / (1024 * 1024)).toFixed(2)} MB) excede o tamanho máximo permitido de ${MAX_FILE_SIZE / (1024 * 1024)} MB. Ele será ignorado.`);
      continue;
    }

    // IIFE para capturar o escopo correto
    (function(file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('certificate-item');

        const img = document.createElement('img');
        img.src = e.target.result;
        img.classList.add('certificate-img');
        img.dataset.fileName = file.name;

        imgContainer.appendChild(img);
        galeriaCertif.appendChild(imgContainer);

        arquivosCertificados.push({ file, imgElement: img });
        habilitarSalvar3();
      };

      reader.readAsDataURL(file);
    })(file); // chamada imediata com o `file` atual
  }
});



salvarCertifBtn.addEventListener('click', async function () {
  for (let i = 0; i < arquivosCertificados.length; i++) {
    const { file, imgElement } = arquivosCertificados[i];
    try {
      const resp = await uploadCertificado(getUserId(0), file);
      if (resp && resp.url) {
        imgElement.src = resp.url;
      } else {
        console.error('Erro ao enviar certificado:', resp?.message || 'Resposta inválida');
      }
    } catch (err) {
      console.error('Erro no upload:', err);
    }
  }

  arquivosCertificados = [];
  localStorage.removeItem('certificadosPreview');
  window.location.reload();
});



document.getElementById('excluir-conta').addEventListener('click', async (e) => {

  e.preventDefault();

  deactivateUser(getUserId(0), 0);

});

[email, valorHora, telefone, redeSocial, horarioInicio, horarioFim, bio, prazo].forEach(input => {
  input.addEventListener('input', habilitarSalvar);
});

function habilitarSalvar() {
  salvarBtn.disabled = false;
}

document.querySelector('.plus-config').addEventListener('submit', async (e) => {

  e.preventDefault();

  const test = await senhaInvalida(senhaAntiga, confirmNovaSenha, novaSenha, 0)

  if (test) {

    const senhaAtualizada = {
      novaSenha: novaSenha.value
    };

    salvarBtn2.disabled = true;

    const resp = await atualizarSenha(getUserId(0), 0, senhaAtualizada);

    alert(resp.message)

    senhaAntiga.value = ''
    novaSenha.value = ''
    confirmNovaSenha.value = ''

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

function habilitarSalvar3() {
  salvarCertifBtn.disabled = false;
}