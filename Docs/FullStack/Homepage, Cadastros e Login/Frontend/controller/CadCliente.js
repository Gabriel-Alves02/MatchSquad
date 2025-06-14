import { Cadastrar, enviarCodigoPosCadastro, buscarNick_Email, buscarPFPJ } from "../service/AJAX.js";
import { cpf, cnpj } from 'https://esm.sh/cpf-cnpj-validator';


let form;
let nomeusuario, emailusuario, telefoneusuario, nicknameusuario, senhausuario;
let confirmacaoEmail, confirmacaoSenha, cpfCnpjInput;
let msgnome, msgemail, msgconfirmacaoemail, msgphone, msgnickname, msgnicknameInvalido;
let msgsenha, msgconfirmacaosenha, msgcpf, msgcnpj, msgdocumento, msgcadastropessoa, msgEmailOriginal;

const nomePattern = /^[A-Za-z\s]+$/;
const emailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const phonePattern = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
const nicknamePattern = /^\S+$/;


function limparErro(elementId) {
    const msgElement = document.getElementById(`msg${elementId}`);
    if (msgElement) {
        msgElement.style.display = 'none';
    }
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

function aplicarMascaraTelefone(input) {
    input.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';

        if (value.length > 0) {
            formattedValue += '(' + value.substring(0, 2);
        }
        if (value.length > 2) {
            if (value.length > 10) {
                formattedValue += ') ' + value.substring(2, 7);
            } else {
                formattedValue += ') ' + value.substring(2, 6);
            }
        }
        if (value.length > 6) {
            if (value.length > 10) {
                formattedValue += '-' + value.substring(7, 11);
            } else {
                formattedValue += '-' + value.substring(6, 10);
            }
        }
        e.target.value = formattedValue;
    });
}

function aplicarMascaraCpfCnpj(input) {
    input.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = value;

        if (value.length <= 11) {
            formattedValue = value.replace(/(\d{3})(\d)/, '$1.$2');
            formattedValue = formattedValue.replace(/(\d{3})(\d)/, '$1.$2');
            formattedValue = formattedValue.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        } else {
            formattedValue = value.replace(/^(\d{2})(\d)/, '$1.$2');
            formattedValue = formattedValue.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            formattedValue = formattedValue.replace(/\.(\d{3})(\d)/, '.$1/$2');
            formattedValue = formattedValue.replace(/(\d{4})(\d)/, '$1-$2');
        }
        e.target.value = formattedValue;
    });
}

async function validarFormulario() {

    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.style.display = 'none');

    let isValid = true;


    if (!nomePattern.test(nomeusuario.value)) {
        msgnome.style.display = 'inline-block';
        nomeusuario.value = '';
        isValid = false;
    }

    const rawCpfCnpjValue = cpfCnpjInput.value.replace(/\D/g, '');
    if (rawCpfCnpjValue.length === 11) {
        if (!cpf.isValid(rawCpfCnpjValue)) {
            msgcpf.style.display = 'inline-block';
            cpfCnpjInput.value = '';
            isValid = false;
        }
    } else if (rawCpfCnpjValue.length === 14) {
        if (!cnpj.isValid(rawCpfCnpjValue)) {
            msgcnpj.style.display = 'inline-block';
            cpfCnpjInput.value = '';
            isValid = false;
        }
    } else {
        msgdocumento.style.display = 'inline-block';
        cpfCnpjInput.value = '';
        isValid = false;
    }

    const resp = await buscarPFPJ(rawCpfCnpjValue);

    console.log(resp);

    if (resp.code === 1) {
        isValid = false;
        msgcadastropessoa.style.display = 'inline-block';
        cpfCnpjInput.value = '';
        cpfCnpjInput.focus();
    }


    if (!emailPattern.test(emailusuario.value)) {
        msgemail.style.display = 'inline-block';
        emailusuario.value = '';
        msgemail.innerHTML = 'E-mail inválido! O endereço de email deve conter "@" e ser válido.';
        isValid = false;
    } else if (emailusuario.value !== confirmacaoEmail.value) {
        msgconfirmacaoemail.style.display = 'inline-block';
        confirmacaoEmail.value = '';
        isValid = false;
    }

    if (!phonePattern.test(telefoneusuario.value)) {
        msgphone.style.display = 'inline-block';
        telefoneusuario.value = '';
        isValid = false;
    }


    if (!nicknamePattern.test(nicknameusuario.value) || nicknameusuario.value.length < 5 || nicknameusuario.value.length > 25) {
        msgnicknameInvalido.style.display = 'inline-block';
        nicknameusuario.value = '';
        isValid = false;
    }


    if (!testeSenha(senhausuario.value) || senhausuario.value.length < 8) {
        msgsenha.style.display = 'inline-block';
        senhausuario.value = '';
        isValid = false;
    } else if (senhausuario.value !== confirmacaoSenha.value) {
        msgconfirmacaosenha.style.display = 'inline-block';
        confirmacaoSenha.value = '';
        isValid = false;
    }

    if (!isValid) {
        return false;
    }

    const objCheck = {
        nickname: nicknameusuario.value,
        email: emailusuario.value
    };

    try {
        const responseData = await buscarNick_Email(objCheck);

        if (responseData.code === 1 || responseData.code === 2 || responseData.code === 3) {
            isValid = false;

            switch (responseData.code) {
                case 1:
                    msgnickname.style.display = 'inline-block';
                    nicknameusuario.value = '';
                    nicknameusuario.focus();
                    break;
                case 2:
                    msgEmailOriginal.style.display = 'inline-block';
                    emailusuario.value = '';
                    confirmacaoEmail.value = '';
                    emailusuario.focus();
                    break;
                case 3:
                    msgnickname.style.display = 'inline-block';
                    msgEmailOriginal.style.display = 'inline-block';
                    nicknameusuario.value = '';
                    emailusuario.value = '';
                    confirmacaoEmail.value = '';
                    nicknameusuario.focus();
                    break;
                default:
                    alert("Ocorreu um erro desconhecido na validação de unicidade. Tente novamente.");
                    break;
            }
        }
    } catch (error) {
        console.error("Erro ao verificar unicidade de nickname/email:", error);
        alert("Ocorreu um erro ao conectar com o servidor para verificar os dados. Tente novamente mais tarde.");
        isValid = false;
    }

    return isValid;
}

async function cadastrarCliente() {
    const objCliente = {
        nome: nomeusuario.value,
        cpf_cnpj: cpfCnpjInput.value.replace(/\D/g, ''),
        email: emailusuario.value,
        telefone: telefoneusuario.value.replace(/\D/g, ''),
        nickname: nicknameusuario.value,
        senha: senhausuario.value
    };

    console.log(objCliente);

    await Cadastrar(objCliente);
    await enviarCodigoPosCadastro('-1', '-1', emailusuario.value);
    window.location.href = "./Login.html";
}


document.addEventListener('DOMContentLoaded', function () {

    form = document.getElementById('customerForm');

    nomeusuario = document.getElementById('nome');
    emailusuario = document.getElementById('email');
    telefoneusuario = document.getElementById('telefone');
    nicknameusuario = document.getElementById('nickname');
    senhausuario = document.getElementById('senha');
    confirmacaoEmail = document.getElementById('confirmacaoEmail');
    confirmacaoSenha = document.getElementById("confirmacaoSenha");
    cpfCnpjInput = document.getElementById('cpf_cnpj');

    msgnome = document.getElementById('msgnome');
    msgemail = document.getElementById('msgemail');
    msgconfirmacaoemail = document.getElementById('msgconfirmacaoemail');
    msgphone = document.getElementById('msgphone');
    msgnickname = document.getElementById('msgnickname');
    msgnicknameInvalido = document.getElementById('msgnicknameInvalido');
    msgsenha = document.getElementById('msgsenha');
    msgconfirmacaosenha = document.getElementById('msgconfirmacaosenha');
    msgcpf = document.getElementById('msgcpf');
    msgcnpj = document.getElementById('msgcnpj');
    msgdocumento = document.getElementById('msgdocumento');
    msgcadastropessoa = document.getElementById('msgcadastropessoa');
    msgEmailOriginal = document.getElementById('msgEmailOriginal');

    nomeusuario.addEventListener('keyup', () => limparErro('nome'));
    emailusuario.addEventListener('keyup', () => {
        limparErro('email');
        limparErro('EmailOriginal');
    });
    confirmacaoEmail.addEventListener('keyup', () => limparErro('confirmacaoemail'));
    telefoneusuario.addEventListener('keyup', () => limparErro('phone'));
    cpfCnpjInput.addEventListener('keyup', () => {
        limparErro('cpf');
        limparErro('cnpj');
        limparErro('documento');
    });
    nicknameusuario.addEventListener('keyup', () => {
        limparErro('nickname');
        limparErro('nicknameInvalido');
    });
    senhausuario.addEventListener('keyup', () => limparErro('senha'));
    confirmacaoSenha.addEventListener('keyup', () => limparErro('confirmacaosenha'));

    aplicarMascaraTelefone(telefoneusuario);
    aplicarMascaraCpfCnpj(cpfCnpjInput);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formValido = await validarFormulario();

        if (formValido) {
            await cadastrarCliente();
        } else {
            console.log("Formulário inválido. Corrija os erros antes de enviar.");
        }
    });

    // Para impedir colar em todos os inputs
    // document.addEventListener('paste', function (event) {
    //     if (event.target.tagName === 'INPUT') {
    //         event.preventDefault();
    //     }
    // });
});