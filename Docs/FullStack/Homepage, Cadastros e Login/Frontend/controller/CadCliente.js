import { Cadastrar, buscarNick } from "../service/AJAX.js";

const form = document.getElementById('customerForm');

form.addEventListener('submit', (event) => {
    event.preventDefault();


    if (validarFormulario()) {
        cadastrarUsuario();
        window.location.href = "../index.html";
    } else {
        console.log("Formulário inválido. Corrija os erros antes de enviar.");
    }

});

async function validarFormulario() {

    let nomeusuario = document.getElementById('nome');
    let emailusuario = document.getElementById('email');
    let confirmacaoEmail = document.getElementById('confirmacaoEmail');
    let telefoneusuario = document.getElementById('telefone');
    let nicknameusuario = document.getElementById('nickname');
    let senhausuario = document.getElementById('senha');
    let confirmacaoSenha = document.getElementById("confirmacaoSenha");
    let cpf_cnpj = document.getElementById('cpf_cnpj');

    let msgnome = document.getElementById('msgnome');
    let msgemail = document.getElementById('msgemail');
    let msgconfirmacaoemail = document.getElementById('msgconfirmacaoemail');
    let msgphone = document.getElementById('msgphone');
    let msgnickname = document.getElementById('msgnickname');
    let msgsenha = document.getElementById('msgsenha');
    let msgconfirmacaosenha = document.getElementById('msgconfirmacaosenha');
    let msgcpf = document.getElementById('msgcpf');
    let msgcnpj = document.getElementById('msgcnpj');
    let msgnicknameInvalido = document.getElementById('msgnicknameInvalido');
    let msgdocumento = document.getElementById('msgdocumento');

    let nomePattern = /^[A-Za-z\s]+$/;
    let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let phonePattern = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    let nicknamePattern = /^\S+$/;

    let isValid = true;

    if (!nomePattern.test(nomeusuario.value)) {
        msgnome.style.display = 'inline-block';
        document.getElementById('nome').value = '';
    }

    if (!emailPattern.test(emailusuario.value)) {
        msgemail.style.display = 'inline-block';
        document.getElementById('email').value = '';
    }
    else {
        if (emailusuario.value !== confirmacaoEmail.value) {
            msgconfirmacaoemail.style.display = 'inline-block';
            document.getElementById('confirmacaoEmail').value = '';
        }
    }

    if (!phonePattern.test(telefoneusuario.value)) {
        msgphone.style.display = 'inline-block';
        document.getElementById('telefone').value = '';
    }

    const nickCheck = await buscarNick(nicknameusuario.value);

    if (!nicknamePattern.test(nicknameusuario.value) || nicknameusuario.value.length < 5 || nicknameusuario.value.length > 25) {
        msgnicknameInvalido.style.display = 'inline-block';
        document.getElementById('nickname').value = '';
    }
    else if (nickCheck === false) {
        msgnickname.style.display = 'inline-block';
        document.getElementById('nickname').value = '';
    }

    if (testeSenha(senhausuario.value) === false || senhausuario.value.length < 8) {
        msgsenha.style.display = 'inline-block';
        document.getElementById('senha').value = '';
    }
    else {
        if (senhausuario.value !== confirmacaoSenha.value) {
            msgconfirmacaosenha.style.display = 'inline-block';
            document.getElementById('confirmacaoSenha').value = '';
        }
    }

    cpf_cnpj.value = cpf_cnpj.value.replace(/\D/g, '');

    if (cpf_cnpj.value.length === 11) {
        if (!validarCPF(cpf_cnpj.value)) {
            msgcpf.style.display = 'inline-block';
            document.getElementById('cpf_cnpj').value = '';
        }
    }
    else if (cpf_cnpj.value.length === 14) {
        if (!validarCNPJ(cpf_cnpj.value)) {
            msgcnpj.style.display = 'inline-block';
            document.getElementById('cpf_cnpj').value = '';
        }
    }
    else {
        // Documento inválido por tamanho incorreto
        msgdocumento.style.display = 'inline-block';
        document.getElementById('cpf_cnpj').value = '';
    }

    return isValid;
}

document.addEventListener('paste', function (event) {
    if (event.target.tagName === 'INPUT') {
        event.preventDefault();
    }
});

function cadastrarUsuario() {

    let dados = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        nickname: document.getElementById('nickname').value,
        senha: document.getElementById('senha').value,
        cpf_cnpj: document.getElementById('cpf_cnpj').value,
    };

    Cadastrar(dados);
}

function testeSenha(senhausuario) {
    for (let i = 0; i < senhausuario.length - 1; i++) {
        const currentChar = senhausuario[i];
        const nextChar = senhausuario[i + 1];

        if (Number(currentChar) + 1 === Number(nextChar)) {
            return false;
        }

        if (currentChar.charCodeAt(0) + 1 === nextChar.charCodeAt(0)) {
            return false;
        }
    }
    return true;
}