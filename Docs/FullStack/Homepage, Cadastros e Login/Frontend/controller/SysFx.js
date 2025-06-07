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

  const senhaCorreta = await buscarSenha(getUserId(tipo), tipo);

  const senhaIncorreta = senhaAtual !== senhaCorreta.message;
  const tamanhoIncorreto = novaSenha.length < 8;
  const confirmacaoInvalida = novaSenha !== confirmaSenha;

  return {
    senhaIncorreta,
    tamanhoIncorreto,
    confirmacaoInvalida,
    valido: !senhaIncorreta && !confirmacaoInvalida && !tamanhoIncorreto
  };
}


export function capitalize(str) {
  if (typeof str !== 'string' || !str.length) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}