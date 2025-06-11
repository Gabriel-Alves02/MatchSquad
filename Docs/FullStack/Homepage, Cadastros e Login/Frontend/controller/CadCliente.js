import { Cadastrar, enviarCodigo, buscarNick_Email } from "../service/AJAX.js";

const form = document.getElementById('customerForm');

form.addEventListener('submit', (event) => {
    event.preventDefault();


    validarFormulario().then(isValid => {
        if (isValid) {
            cadastrarUsuario();
            window.location.href = "./login.html";
        } else {
            console.log("Formulário inválido. Corrija os erros antes de enviar.");
        }
    });
});

async function validarFormulario() {
    // --- 1. Esconder todas as mensagens de erro no início da validação ---
    // Isso garante que mensagens de validações anteriores sejam limpas.
    // Verifique se todos os seus elementos de mensagem de erro no HTML têm um ID começando com 'msg'.
    const errorMessages = document.querySelectorAll('[id^="msg"]');
    errorMessages.forEach(msg => msg.style.display = 'none');

    // --- 2. Obter referências aos elementos do formulário e mensagens de erro ---
    let nomeusuario = document.getElementById('nome');
    let emailusuario = document.getElementById('email');
    let confirmacaoEmail = document.getElementById('confirmacaoEmail');
    let telefoneusuario = document.getElementById('telefone');
    let nicknameusuario = document.getElementById('nickname');
    let senhausuario = document.getElementById('senha');
    let confirmacaoSenha = document.getElementById("confirmacaoSenha");
    let cpf_cnpj = document.getElementById('cpf_cnpj');

    let msgnome = document.getElementById('msgnome');
    let msgemail = document.getElementById('msgemail'); // Para email inválido (formato)
    // **NOVO/VERIFICAR**: Certifique-se de ter um elemento com id="msgEmailOriginal" no seu HTML
    let msgEmailOriginal = document.getElementById('msgEmailOriginal'); // Para email já registrado no sistema
    let msgconfirmacaoemail = document.getElementById('msgconfirmacaoemail');
    let msgphone = document.getElementById('msgphone');
    // **NOVO/VERIFICAR**: msgnickname agora é para nickname já selecionado
    let msgnickname = document.getElementById('msgnickname');
    let msgnicknameInvalido = document.getElementById('msgnicknameInvalido'); // Para formato de nickname inválido
    let msgsenha = document.getElementById('msgsenha');
    let msgconfirmacaosenha = document.getElementById('msgconfirmacaosenha');
    let msgcpf = document.getElementById('msgcpf');
    let msgcnpj = document.getElementById('msgcnpj');
    let msgdocumento = document.getElementById('msgdocumento');

    let nomePattern = /^[A-Za-z\s]+$/;
    let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let phonePattern = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    let nicknamePattern = /^\S+$/;

    let isValid = true;


    if (!nomePattern.test(nomeusuario.value)) {
        msgnome.style.display = 'inline-block';
        nomeusuario.value = '';
        isValid = false;
    }

    if (!emailPattern.test(emailusuario.value)) {
        msgemail.style.display = 'inline-block';
        emailusuario.value = '';
        isValid = false;
    } else if (emailusuario.value !== confirmacaoEmail.value) { // 'else if' para evitar mostrar as duas mensagens
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

    if (testeSenha(senhausuario.value) === false || senhausuario.value.length < 8) {
        msgsenha.style.display = 'inline-block';
        senhausuario.value = '';
        isValid = false;
    } else if (senhausuario.value !== confirmacaoSenha.value) { // 'else if'
        msgconfirmacaosenha.style.display = 'inline-block';
        confirmacaoSenha.value = '';
        isValid = false;
    }

    cpf_cnpj.value = cpf_cnpj.value.replace(/\D/g, ''); // Limpa o CPF/CNPJ para validação

    if (cpf_cnpj.value.length === 11) {
        if (!validarCPF(cpf_cnpj.value)) {
            msgcpf.style.display = 'inline-block';
            document.getElementById('cpf_cnpj').value = '';
        }
    } else if (cpf_cnpj.value.length === 14) {
        if (!validarCNPJ(cpf_cnpj.value)) {
            msgcnpj.style.display = 'inline-block';
            cpf_cnpj.value = '';
            isValid = false;
        }
    } else {
        msgdocumento.style.display = 'inline-block';
        document.getElementById('cpf_cnpj').value = '';
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

        console.log('Resposta da API (buscarNick_Email):', responseData);

        if (!responseData.valid) {

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

                    alert("Ocorreu um erro desconhecido na validação. Tente novamente.");
                    break;
            }
        }
    } catch (error) {
        console.error("Erro ao verificar unicidade de nickname/email:", error);
        alert("Ocorreu um erro ao conectar com o servidor para verificar os dados. Tente novamente mais tarde.");
        isValid = false;
    }

    // Retorna o estado final de isValid
    return isValid;
}

function limparN() {
    document.getElementById('msgnome').style.display = 'none';
}

function limparE() {
    document.getElementById('msgemail').style.display = 'none';
    document.getElementById('msgEmailOriginal').style.display = 'none'; // Adicionado
}

function limparCe() {
    document.getElementById('msgconfirmacaoemail').style.display = 'none';
}

function limparT() {
    document.getElementById('msgphone').style.display = 'none';
}

function limparNi() {
    document.getElementById('msgnickname').style.display = 'none'; // Adicionado
    document.getElementById('msgnicknameInvalido').style.display = 'none';
}

function limparS() {
    document.getElementById('msgsenha').style.display = 'none';
}

function limparCs() {
    document.getElementById('msgconfirmacaosenha').style.display = 'none';
}

function limparC() {
    document.getElementById('msgcpf').style.display = 'none';
    document.getElementById('msgcnpj').style.display = 'none';
    document.getElementById('msgdocumento').style.display = 'none'; // Adicionado
}


// document.addEventListener('paste', function (event) {
//     if (event.target.tagName === 'INPUT') {
//         event.preventDefault();
//     }
// });

async function cadastrarUsuario() {

    let dados = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        nickname: document.getElementById('nickname').value,
        senha: document.getElementById('senha').value,
        cpf_cnpj: document.getElementById('cpf_cnpj').value,
    };

    await Cadastrar(dados);
    await enviarCodigo ('-1','-1', document.getElementById('email').value);
}

function testeSenha(senha) {
    for (let i = 0; i < senha.length - 1; i++) {
        const currentChar = senha[i];
        const nextChar = senha[i + 1];

        if (Number(currentChar) + 1 === Number(nextChar)) {
            return false;
        }
    }
    return true;
}

// Seu código para mascarar o telefone (mantido)
$(document).ready(function () {
    $('#telefone').mask('(00) 00000-0000');
});