import { Cadastrar, confirmacaoEmail, buscarNick_Email } from "../service/AJAX.js";

const form = document.getElementById('customerForm');

form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Chama validarFormulario que agora é assíncrona
    validarFormulario().then(isValid => {
        if (isValid) {
            cadastrarUsuario();
            // Descomente esta linha quando o cadastro for bem-sucedido e você quiser redirecionar
            // window.location.href = "./login.html";
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
    let nicknamePattern = /^\S+$/; // Para verificar espaços em branco

    let isValid = true; // Começamos assumindo que o formulário é válido

    // --- 3. Validações Locais (Sincronas) ---
    // Estas validações são rápidas e não precisam de requisições ao servidor.
    // Se alguma falhar, definimos isValid como false e limpamos o campo.

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

    // Validação de formato de nickname (sem espaços, tamanho)
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

    // Se alguma validação local já falhou, não é necessário fazer a chamada AJAX
    if (!isValid) {
        return false;
    }

    // --- 4. Validação de Unicidade com a API (Assíncrona) ---
    // Esta parte só será executada se todas as validações locais passarem.
    const objCheck = {
        nickname: nicknameusuario.value,
        email: emailusuario.value
    };

    try {
        // A função buscarNick_Email retorna um objeto { valid, code, message }
        const responseData = await buscarNick_Email(objCheck);

        console.log('Resposta da API (buscarNick_Email):', responseData);

        if (!responseData.valid) {
            // Se a API indicar que não é válido, definimos isValid para false e exibimos a mensagem correta
            isValid = false;

            switch (responseData.code) {
                case 1: // Nickname repetido
                    msgnickname.style.display = 'inline-block';
                    nicknameusuario.value = '';
                    nicknameusuario.focus();
                    break;
                case 2: // Email repetido
                    msgEmailOriginal.style.display = 'inline-block';
                    emailusuario.value = '';
                    confirmacaoEmail.value = '';
                    emailusuario.focus();
                    break;
                case 3: // Ambos (nickname e email) repetidos
                    msgnickname.style.display = 'inline-block';
                    msgEmailOriginal.style.display = 'inline-block';
                    nicknameusuario.value = '';
                    emailusuario.value = '';
                    confirmacaoEmail.value = '';
                    nicknameusuario.focus(); // Ou emailusuario.focus()
                    break;
                default:
                    // Caso um code inesperado seja retornado
                    alert("Ocorreu um erro desconhecido na validação. Tente novamente.");
                    break;
            }
        }
    } catch (error) {
        console.error("Erro ao verificar unicidade de nickname/email:", error);
        // Em caso de erro na comunicação com a API (servidor offline, erro de rede),
        // considere o formulário inválido e mostre uma mensagem genérica.
        alert("Ocorreu um erro ao conectar com o servidor para verificar os dados. Tente novamente mais tarde.");
        isValid = false;
    }

    // Retorna o estado final de isValid
    return isValid;
}

// --- Funções de Limpeza de Mensagens de Erro ---
// Adapte estas funções para esconder as novas mensagens ou as que foram reatribuídas.
// É crucial que cada campo que pode gerar um erro chame a função de limpeza correspondente
// no seu evento onkeyup ou onchange.

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


// --- Funções Auxiliares (mantidas como estão) ---
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

    let msgEmail = {
        id: '-1',
        usertype: '-1',
        email: document.getElementById('email').value
    };

    // Descomente e chame sua função de cadastro real quando for a hora
    // Cadastrar(dados);
    // await confirmacaoEmail(msgEmail);
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

// Seu código para mascarar o telefone (mantido)
$(document).ready(function () {
    $('#telefone').mask('(00) 00000-0000');
});