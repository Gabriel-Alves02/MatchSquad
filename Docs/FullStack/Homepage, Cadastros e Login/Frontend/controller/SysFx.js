import { desativarUsuario, buscarSenha, buscarEmail, enviarCodigoPosCadastro } from '../service/AJAX.js';

export function getUserId(num) {

  if (num === 0) {
    return localStorage.getItem("idConsultor");

  } else if (num === 1) {
    return localStorage.getItem("idCliente");
  }

  return null;
}

export async function deactivateUser(id, usertype) {

  let resp = confirm('Tem certeza que deseja desativar sua conta na nossa plataforma?')

  if (resp) {
    const test = await buscarEmail(id, usertype);
    await enviarCodigoPosCadastro('-1', '-1', test.toString());
    await desativarUsuario(id, usertype);
  }

}

export async function senhaInvalida(senhaAntigaInput, confirmInput, novaInput, tipo) {
    const senhaAtual = senhaAntigaInput.value;
    const novaSenha = novaInput.value;
    const confirmaSenha = confirmInput.value;

    const senhaCorreta = await buscarSenha(getUserId(tipo), tipo);

    const senhaAntigaIncorreta = senhaAtual !== senhaCorreta.message;
    const novaSenhaMuitoCurta = novaSenha.length < 8;
    const novaSenhaComSequencia = !testeSenha(novaSenha);
    const confirmacaoDiferente = novaSenha !== confirmaSenha;

    let mensagemNovaSenha = '';
    if (novaSenhaMuitoCurta) {
        mensagemNovaSenha = 'A nova senha deve ter no mínimo 8 caracteres.';
    } else if (novaSenhaComSequencia) {
        mensagemNovaSenha = 'A nova senha não pode conter sequências numéricas (ex: 123, 321).';
    }

    return {
        senhaIncorreta: senhaAntigaIncorreta,
        tamanhoIncorreto: novaSenhaMuitoCurta || novaSenhaComSequencia,
        confirmacaoInvalida: confirmacaoDiferente,
        mensagemNovaSenha: mensagemNovaSenha,
        valido: !senhaAntigaIncorreta && !novaSenhaMuitoCurta && !novaSenhaComSequencia && !confirmacaoDiferente
    };
}


function testeSenha(senha) {
    if (/(012|123|234|345|456|567|678|789)/.test(senha)) {
        return false;
    }
    if (/(987|876|765|654|543|432|321|210)/.test(senha)) {
        return false;
    }
    return true;
}


export function capitalize(str) {
  if (typeof str !== 'string' || !str.length) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}