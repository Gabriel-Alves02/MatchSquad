import { carregarInfoPerfil, atualizarPerfil, uploadImagemPerfil } from '../service/AJAX.js';
import { getUserId } from './SysFx.js';

let info;

const uploadInput = document.getElementById('upload-pic');
const profilePic = document.getElementById('profile-pic');



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

});

[email, valorHora, telefone, redeSocial, horarioInicio, horarioFim, bio, prazo].forEach(input => {
  input.addEventListener('input', habilitarSalvar);
});

function habilitarSalvar() {
  salvarBtn.disabled = false;
}

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
