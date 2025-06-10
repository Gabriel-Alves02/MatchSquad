import { carregarInfoPerfil, atualizarPerfil, atualizarSenha, uploadImagemPerfil, uploadCertificado, limparImagensNaNuvem, buscarSenha, userType } from '../service/AJAX.js';
import { getUserId, deactivateUser, senhaInvalida } from './SysFx.js';

let info;
let valorSelecionado;

const limparImagensBtn = document.getElementById('limpar-imagens-btn');

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
let prazo = document.getElementById('prazo');
let prazoSpan = document.getElementById('prazo-valor');

let salvarBtn = document.getElementById('salvar');

let senhaAntiga = document.getElementById('senha');
let novaSenha = document.getElementById('nova-senha');
let confirmNovaSenha = document.getElementById('confirma-senha');

let msgSenhaAntiga = document.getElementById('msgsenhaAntiga');
let msgSenhaNova = document.getElementById('msgnovaSenha');
let msgConfirmSenha = document.getElementById('msgconfirmSenha');

let salvarBtn2 = document.getElementById('salvar-plus');
let salvarCertifBtn = document.getElementById('salvar-certif');


document.addEventListener('DOMContentLoaded', async function () {

  info = await carregarInfoPerfil(getUserId(0), 0);

  if (!info) {
    console.error("Perfil do consultor não encontrado.");
    //window.location.href = '/';
    return;
  }

  prazo.value = info.prazoMinReag;
  prazoSpan.textContent = info.prazoMinReag;

  nome.value = info.nome;
  email.value = info.email;
  telefone.value = info.telefone;
  valorHora.value = info.valorHora;
  redeSocial.value = info.redeSocial;
  horarioInicio.value = info.horarioInicio;
  horarioFim.value = info.horarioFim;
  bio.value = info.bio;

  let urlImagemPerfil = info.urlImagemPerfil;

  const localStorageUrl = localStorage.getItem('profilePicUrl');

  if (localStorageUrl) {
    profilePic.src = localStorageUrl;
  } else if (urlImagemPerfil) {
    profilePic.src = urlImagemPerfil;
  }

  if (info.urlsCertificados !== null && info.urlsCertificados.length > 0) {
    let certificados = info.urlsCertificados.split(',');

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


  const radios = document.querySelectorAll('input[name="modalidade"]');
  const modalidadeCarregada = info.modalidadeTrab;


  if (modalidadeCarregada === 'presencial' || modalidadeCarregada === 'presencial_e_online') {
    document.getElementById('grupoendereco').style.display = 'inline-block';
    document.getElementById('cep').value = info.cep || '';
    document.getElementById('endereco').value = info.endereco || '';
    document.getElementById('numero').value = info.numeroCasa || '';
    document.getElementById('complemento').value = info.complemento || '';
    document.getElementById('bairro').value = info.bairro || '';
    document.getElementById('cidade').value = info.cidade || '';
  } else {
    document.getElementById('grupoendereco').style.display = 'none';
    document.getElementById('cep').value = '';
    document.getElementById('endereco').value = '';
    document.getElementById('numero').value = '';
    document.getElementById('complemento').value = '';
    document.getElementById('bairro').value = '';
    document.getElementById('cidade').value = '';
  }


  marcarModalidade(modalidadeCarregada);

  radios.forEach(radio => {
    radio.addEventListener('change', function () {
      valorSelecionado = this.value;
      if (valorSelecionado === 'presencial' || valorSelecionado === 'presencial_e_online') {
        document.getElementById('grupoendereco').style.display = 'inline-block';
      } else {
        document.getElementById('grupoendereco').style.display = 'none';
        document.getElementById('cep').value = '';
        document.getElementById('endereco').value = '';
        document.getElementById('bairro').value = '';
        document.getElementById('cidade').value = '';
        document.getElementById('numero').value = '';
        document.getElementById('complemento').value = '';
      }
    });
  });

  document.getElementById('cep').addEventListener('input', async function () {
    let cep = document.getElementById('cep').value.replace(/\D/g, '');
    let msgcep = document.getElementById('msgcep');

    if (cep.length === 8) {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        console.log("CEP não encontrado ou inválido.");
        msgcep.style.display = 'inline-block';
        document.getElementById('cep').value = '';
        document.getElementById('endereco').value = '';
        document.getElementById('bairro').value = '';
        document.getElementById('cidade').value = '';
        return;
      }

      document.getElementById('endereco').value = data.logradouro;
      document.getElementById('bairro').value = data.bairro;
      document.getElementById('cidade').value = data.localidade;
    }
  });

});

document.addEventListener('paste', function (event) {
  if (event.target.tagName === 'INPUT') {
    event.preventDefault();
  }
});

document.querySelector('.profile-info').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Garante que 'valorSelecionado' esteja sempre atualizado com o rádio selecionado
  const selectedRadio = document.querySelector('input[name="modalidade"]:checked');
  valorSelecionado = selectedRadio ? selectedRadio.value : 'online'; // Padrão 'online' se nada estiver selecionado

  let dadosAtualizados;

  if (valorSelecionado === 'presencial' || valorSelecionado === 'presencial_e_online') {
    dadosAtualizados = {
      nome: nome.value,
      email: email.value,
      telefone: telefone.value,
      valorHora: valorHora.value,
      redeSocial: redeSocial.value,
      horarioInicio: horarioInicio.value,
      horarioFim: horarioFim.value,
      prazoMinReag: prazo.value,
      modalidade: valorSelecionado, // Nome da propriedade que o backend espera ('modalidade')
      cep: document.getElementById('cep').value,
      endereco: document.getElementById('endereco').value,
      numero: document.getElementById('numero').value, // Frontend envia como 'numero'
      complemento: document.getElementById('complemento').value,
      bairro: document.getElementById('bairro').value,
      cidade: document.getElementById('cidade').value,
      bio: bio.value
    };
  } else {
    // Se a modalidade não for presencial, envia nulo para os campos de endereço
    dadosAtualizados = {
      nome: nome.value,
      email: email.value,
      telefone: telefone.value,
      valorHora: valorHora.value,
      redeSocial: redeSocial.value,
      horarioInicio: horarioInicio.value,
      horarioFim: horarioFim.value,
      prazoMinReag: prazo.value,
      modalidade: valorSelecionado, // Nome da propriedade que o backend espera ('modalidade')
      cep: null,
      endereco: null,
      numero: null,
      complemento: null,
      bairro: null,
      cidade: null,
      bio: bio.value
    };
  }

  salvarBtn.disabled = true;

  console.log('Dados para salvar: \n', dadosAtualizados);

  const resp = await atualizarPerfil(getUserId(0), 0, dadosAtualizados);

  alert(resp.message);
  salvarBtn.disabled = false; // Reabilita o botão após a resposta
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
        localStorage.setItem('profilePicUrl', resp.url); // Salva a URL no localStorage
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
  galeriaCertif.innerHTML = '';

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

    (function (file) {
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

[nome, email, valorHora, telefone, redeSocial, horarioInicio, horarioFim, bio, prazo,
  document.getElementById('cep'), document.getElementById('endereco'),
  document.getElementById('numero'), document.getElementById('complemento'), // Adicionado complemento
  document.getElementById('bairro'), document.getElementById('cidade')].forEach(input => {
    input.addEventListener('input', habilitarSalvar);
  });

// Adiciona event listeners para os radio buttons para habilitar o botão salvar
document.querySelectorAll('input[name="modalidade"]').forEach(radio => {
  radio.addEventListener('change', habilitarSalvar);
});


function habilitarSalvar() {
  salvarBtn.disabled = false;
}

document.querySelector('.plus-config').addEventListener('submit', async (e) => {
  e.preventDefault();

  const resultado = await senhaInvalida(senhaAntiga, confirmNovaSenha, novaSenha, 0);

  msgSenhaAntiga.style.display = resultado.senhaIncorreta ? 'inline-block' : 'none';
  msgSenhaNova.style.display = resultado.tamanhoIncorreto ? 'inline-block' : 'none';
  msgConfirmSenha.style.display = resultado.confirmacaoInvalida ? 'inline-block' : 'none';

  if (resultado.valido) {
    const senhaAtualizada = {
      novaSenha: novaSenha.value
    };

    salvarBtn2.disabled = true;

    const resp = await atualizarSenha(getUserId(0), 0, senhaAtualizada);

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

[senhaAntiga, novaSenha, confirmNovaSenha].forEach(input => {
  input.addEventListener('input', () => {
    msgSenhaAntiga.style.display = 'none';
    msgConfirmSenha.style.display = 'none';
  });
});


function habilitarSalvar3() {
  salvarCertifBtn.disabled = false;
}

limparImagensBtn.addEventListener('click', async function () {
  const confirmacao = confirm('Tem certeza que deseja limpar TODAS as suas imagens (perfil e certificados) da nuvem? Esta ação é irreversível.');

  if (confirmacao) {
    try {
      const userId = getUserId(0);

      const resp = await limparImagensNaNuvem(userId, 0);

      if (resp.success) {
        alert('Imagens limpas com sucesso da nuvem!');
        profilePic.src = '';
        galeriaCertif.innerHTML = '';
        localStorage.removeItem('certificadosPreview');
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

function marcarModalidade(valor) {
    const radiobuttons = document.getElementsByName('modalidade');
    radiobuttons.forEach(radiobutton => {
        if (radiobutton.value === valor) {
            radiobutton.checked = true;
            // **Alteração Importante:** Dispara o evento 'change' para ativar a lógica de visibilidade
            radiobutton.dispatchEvent(new Event("change"));
        }
    });
}