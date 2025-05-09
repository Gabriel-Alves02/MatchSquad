import { desativarUsuario, buscarSenha } from '../service/AJAX.js';

export function getUserId(num) {
  
  if (num === 0) {
    return localStorage.getItem("idConsultor");
    
  } else if (num === 1) {
    return localStorage.getItem("idCliente");
  }

  return null;
}

export function deactivateUser(id, usertype){

  let resp = confirm('Tem certeza que deseja desativar sua conta na nossa plataforma?')

  if(resp){
    desativarUsuario(id, usertype);
  }

}

export async function senhaInvalida(senhaAntiga, confirmNovaSenha, novaSenha, type) {

  let msgSenhaAntiga = document.getElementById('msgsenhaAntiga');
  let msgConfirmSenha = document.getElementById('msgconfirmSenha');

  const senha = await buscarSenha(getUserId(type), type);

  console.log(senhaAntiga.value, senha, confirmNovaSenha.value, novaSenha.value)

  if (!(senhaAntiga.value === senha)) {
    msgSenhaAntiga.style.display = 'inline-block';
    senhaAntiga.value = '';
    senhaAntiga.focus();
    return false;
  }

  msgSenhaAntiga.style.display = 'none';

  if (!(confirmNovaSenha.value === novaSenha.value)) {
    msgConfirmSenha.style.display = 'inline-block';
    confirmNovaSenha.value = '';
    confirmNovaSenha.focus();
    return false;
  }

  msgConfirmSenha.style.display = 'none';

  return true;
}