import { desativarUsuario, buscarSenha } from '../service/AJAX.js';

export function getUserId(num) {

  if (num === 0) {
    return localStorage.getItem("idConsultor");

  } else if (num === 1) {
    return localStorage.getItem("idCliente");
  }

  return null;
}

export function deactivateUser(id, usertype) {

  let resp = confirm('Tem certeza que deseja desativar sua conta na nossa plataforma?')

  if (resp) {
    desativarUsuario(id, usertype);
  }

}

export async function senhaInvalida(senhaAntigaInput, confirmInput, novaInput, tipo) {
  const senhaAtual = senhaAntigaInput.value;
  const novaSenha = novaInput.value;
  const confirmaSenha = confirmInput.value;

  const senhaCorreta = await buscarSenha(getUserId(tipo)); // função que valida senha antiga

  const senhaIncorreta = senhaAtual !== senhaCorreta;
  const confirmacaoInvalida = novaSenha.length < 5 || novaSenha !== confirmaSenha;

  return {
    senhaIncorreta,
    confirmacaoInvalida,
    valido: !senhaIncorreta && !confirmacaoInvalida
  };
}


export function capitalize(str) {
  if (typeof str !== 'string' || !str.length) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}